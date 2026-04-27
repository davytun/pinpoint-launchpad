<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Signature;
use App\Services\BoldSignService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OnboardingController extends Controller
{
    public function __construct(private BoldSignService $boldSign) {}

    public function sign(Request $request): mixed
    {
        $paymentId = $request->session()->get('payment_id');

        if (! $paymentId) {
            return redirect()->route('checkout.index')
                ->with('error', 'Please complete payment first.');
        }

        $payment = Payment::with(['signature', 'diagnosticSession'])->find($paymentId);

        if (! $payment) {
            return redirect()->route('checkout.index')
                ->with('error', 'Please complete payment first.');
        }

        // Already signed — go straight to dashboard
        if ($payment->signature && $payment->signature->isSigned()) {
            return redirect()->route('founder.dashboard');
        }

        $tierLabel = ucfirst($payment->tier);

        // Existing document with confirmed details — show iframe
        if ($payment->signature && $payment->signature->details_confirmed && $payment->signature->boldsign_document_id) {
            $request->session()->put('signature_id', $payment->signature->id);

            try {
                $embedResult = $this->resolveEmbedUrl($payment->signature);
            } catch (\RuntimeException $e) {
                if (str_contains($e->getMessage(), 'already been completed') || str_contains($e->getMessage(), 'already completed')) {
                    $payment->signature->update(['status' => 'signed', 'signed_at' => now()]);
                    return redirect()->route('founder.setup');
                }
                throw $e;
            }

            return Inertia::render('Onboarding/Sign', [
                'embed_url'    => $embedResult,
                'signer_email' => $payment->signature->signer_email,
                'tier_label'   => $tierLabel,
                'document_id'  => $payment->signature->boldsign_document_id,
            ]);
        }

        // No confirmed details yet — show pre-signing form
        return Inertia::render('Onboarding/ConfirmDetails', [
            'email'      => $payment->customer_email,
            'tier_label' => $tierLabel,
        ]);
    }

    public function confirmDetails(Request $request): mixed
    {
        $request->validate([
            'full_name'    => ['required', 'string', 'min:2', 'max:100'],
            'company_name' => ['required', 'string', 'min:2', 'max:150'],
        ]);

        $paymentId = $request->session()->get('payment_id');
        $payment   = Payment::with('signature')->find($paymentId);

        if (! $payment) {
            return redirect()->route('checkout.index')
                ->with('error', 'Please complete payment first.');
        }

        $email     = $payment->customer_email;
        $fullName  = $request->full_name;
        $company   = $request->company_name;
        $tierLabel = ucfirst($payment->tier);

        // Create the BoldSign document with real founder details
        $result = $this->boldSign->createDocumentFromTemplate([
            'email'         => $email,
            'name'          => $fullName,
            'founder_name'  => $fullName,
            'company_name'  => $company,
            'tier_selected' => $tierLabel . ' Audit',
            'amount_paid'   => number_format($payment->total_amount, 2),
            'date'          => now()->format('d M Y'),
        ]);

        // Get embed URL and cache it on the record
        $embedResult = $this->boldSign->getEmbeddedSignUrl($result['document_id'], $email);

        // Create or update the Signature record
        $signature = $payment->signature ?? new Signature(['payment_id' => $payment->id]);

        $signature->fill([
            'payment_id'            => $payment->id,
            'diagnostic_session_id' => $payment->diagnostic_session_id,
            'boldsign_document_id'  => $result['document_id'],
            'boldsign_template_id'  => config('services.boldsign.template_id'),
            'status'                => 'sent',
            'signer_email'          => $email,
            'signer_name'           => $fullName,
            'signer_full_name'      => $fullName,
            'signer_company_name'   => $company,
            'details_confirmed'     => true,
            'embed_url'             => $embedResult['url'],
            'embed_url_expires_at'  => $embedResult['expires_at'],
            'metadata'              => [
                'tier'         => $payment->tier,
                'amount'       => $payment->total_amount,
                'company_name' => $company,
            ],
        ])->save();

        $signature->log('document_created', ['document_id' => $result['document_id']]);
        $signature->log('embed_url_generated');

        $request->session()->put('signature_id', $signature->id);
        $request->session()->put('signer_full_name', $fullName);
        $request->session()->put('signer_company_name', $company);

        return Inertia::render('Onboarding/Sign', [
            'embed_url'    => $embedResult['url'],
            'signer_email' => $email,
            'tier_label'   => $tierLabel,
            'document_id'  => $result['document_id'],
        ]);
    }

    public function complete(Request $request): mixed
    {
        $signature = null;
        $signatureId = $request->session()->get('signature_id');

        if ($signatureId) {
            $signature = Signature::find($signatureId);
        }

        if (! $signature && $request->session()->has('payment_id')) {
            $payment   = Payment::with('signature')->find($request->session()->get('payment_id'));
            $signature = $payment?->signature;

            if ($signature) {
                $request->session()->put('signature_id', $signature->id);
            }
        }

        if (! $signature) {
            return redirect()->route('onboarding.sign');
        }

        $signature->refresh();

        return Inertia::render('Onboarding/Verifying', [
            'signature_verified' => $signature->isSigned(),
        ]);
    }

    public function webhook(Request $request): \Illuminate\Http\JsonResponse
    {
        $this->boldSign->handleWebhook($request);

        return response()->json(['status' => 'ok'], 200);
    }

    // Returns a valid embed URL string, refreshing if expired or missing.
    private function resolveEmbedUrl(Signature $signature): string
    {
        if ($signature->isEmbedUrlValid()) {
            return $signature->embed_url;
        }

        $embedResult = $this->boldSign->getEmbeddedSignUrl(
            $signature->boldsign_document_id,
            $signature->signer_email,
        );

        $signature->update([
            'embed_url'            => $embedResult['url'],
            'embed_url_expires_at' => $embedResult['expires_at'],
        ]);

        $signature->log('embed_url_refreshed');

        return $embedResult['url'];
    }
}
