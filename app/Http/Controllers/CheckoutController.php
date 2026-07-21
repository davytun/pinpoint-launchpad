<?php

namespace App\Http\Controllers;

use App\Mail\PaymentAdminNotificationMail;
use App\Mail\PaymentConfirmationMail;
use App\Mail\PiaApplicationAdminMail;
use App\Models\DiagnosticSession;
use App\Models\Payment;
use App\Models\PiaApplication;
use App\Services\PaystackService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class CheckoutController extends Controller
{
    private function getTiers(bool $isNaira): array
    {
        return [
            [
                'key'              => 'foundation',
                'label'            => $isNaira ? 'Domestic & Local Founders' : 'Diaspora & International',
                'tagline'          => $isNaira
                    ? 'Domestic founders in Nigeria pay ₦350,000 ($250) for the full PARAGON assessment.'
                    : 'Diaspora and international founders pay $500 for the full PARAGON assessment.',
                'base_price'       => $isNaira ? 350000 : 500,
                'total'            => $isNaira ? 350000 : 500,
                'naira_equivalent' => 350000,
                'features'         => [
                    'Full PARAGON scan (weighted to Potential)',
                    '1 founder interview (60 min)',
                    'Analyst-delivered 12–15 page structured report',
                    '1 debrief call',
                    '10–12 hours',
                    'Turnaround 7 working days.',
                ],
                'is_featured'      => false,
                'redeemable'       => false,
            ],
            [
                'key'              => 'growth',
                'label'            => 'Seed / Early Traction',
                'tagline'          => 'Working model, ARR under $500k, ready for a first institutional cheque.',
                'base_price'       => $isNaira ? 2090000 : 1500,
                'total'            => $isNaira ? 2090000 : 1500,
                'naira_equivalent' => 2090000,
                'features'         => [
                    'Everything in Stage 01',
                    'Financial review (up to 24 months)',
                    'Unit-economics and LTV: CAC build',
                    'Cap table and founding-document review',
                    '3 interviews',
                    'Analyst + associate, partner-reviewed 25–30 page report',
                    'Investor-readiness gap list',
                    '25–30 hours',
                    'Turnaround 12 working days.',
                ],
                'is_featured'      => true,
                'redeemable'       => false,
            ],
            [
                'key'              => 'institutional',
                'label'            => 'Seed+ / Growth',
                'tagline'          => 'ARR above $500k, established processes, larger round or growth equity.',
                'base_price'       => $isNaira ? 4850000 : 3500,
                'total'            => $isNaira ? 4850000 : 3500,
                'naira_equivalent' => 4850000,
                'features'         => [
                    'Everything in Stage 02',
                    'Full data-room review',
                    'Corporate and governance structure analysis',
                    'Material contract and IP review',
                    'Management-team assessment',
                    '5+ interviews',
                    '40+ page report',
                    'Board-ready presentation',
                    'Partner-led',
                    '60+ hours',
                    'Turnaround 20 working days.',
                    'Scope confirmed and quoted before invoice.',
                ],
                'is_featured'        => false,
                'redeemable'         => true,
                'redeemable_tooltip' => 'Our Success Guarantee: Upon the close of a funding round via the PIN Network, your assessment fee is fully credited toward your 2% success fee, effectively making this professional audit free.',
            ],
        ];
    }

    public function index(Request $request): Response|\Illuminate\Http\RedirectResponse
    {
        $sessionId = $request->session()->get('diagnostic_session_id');

        if (! $sessionId) {
            return redirect()->route('diagnostic.index')
                ->with('error', 'Please complete the PARAGON Diagnostic first.');
        }

        $diagnosticSession = DiagnosticSession::find($sessionId);

        if (! $diagnosticSession) {
            return redirect()->route('diagnostic.index')
                ->with('error', 'Please complete the PARAGON Diagnostic first.');
        }

        if (in_array($diagnosticSession->score_band, ['low', 'mid_low'])) {
            return redirect()->route('diagnostic.result')
                ->with('error', 'Your current score does not qualify for the audit programme.');
        }

        // Check by session ID first, then by email — covers session regeneration
        $paid = Payment::paid()
            ->where(function ($q) use ($sessionId, $diagnosticSession) {
                $q->where('diagnostic_session_id', $sessionId)
                  ->orWhere('customer_email', $diagnosticSession->email);
            })
            ->first();

        if ($paid) {
            return redirect()->route('onboarding.sign');
        }

        $gatewayCurrency = strtoupper(config('services.paystack.currency', 'NGN'));
        $isNairaUser = $diagnosticSession->country === 'Nigeria';

        $displayAsUsd = !$isNairaUser;
        $currencySymbol = $displayAsUsd ? '$' : '₦';

        if ($gatewayCurrency === 'NGN') {
            $paymentCurrency = 'NGN';
            $billingCurrencySymbol = '₦';
            $billingNgnFallback = !$isNairaUser;
        } else {
            $paymentCurrency = $isNairaUser ? 'NGN' : 'USD';
            $billingCurrencySymbol = $isNairaUser ? '₦' : '$';
            $billingNgnFallback = false;
        }

        return Inertia::render('Checkout/Index', [
            'score'                   => $diagnosticSession->score,
            'score_band'              => $diagnosticSession->score_band,
            'tiers'                   => $this->getTiers(!$displayAsUsd),
            'diagnostic_session_id'   => $sessionId,
            'customer_email'          => $diagnosticSession->email,
            'currency'                => $paymentCurrency,
            'currency_symbol'         => $currencySymbol,
            'billing_currency_symbol' => $billingCurrencySymbol,
            'billing_ngn_fallback'    => $billingNgnFallback,
        ]);
    }

    public function assessment(Request $request): Response
    {
        $gatewayCurrency = strtoupper(config('services.paystack.currency', 'NGN'));
        $isNaira = $gatewayCurrency === 'NGN';
        $currencySymbol = $isNaira ? '₦' : '$';

        return Inertia::render('Checkout/Assessment', [
            'tiers'                => $this->getTiers($isNaira),
            'currency'             => $gatewayCurrency,
            'currency_symbol'      => $currencySymbol,
            'billing_ngn_fallback' => false,
        ]);
    }

    public function applyAssessment(Request $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'name'         => ['required', 'string', 'max:150'],
            'email'        => ['required', 'email', 'max:200'],
            'company'      => ['required', 'string', 'max:200'],
            'country'      => ['required', 'string', 'max:100'],
            'stage'        => ['required', 'in:concept,seed,growth'],
            'raise_target' => ['required', 'string', 'max:100'],
            'message'      => ['nullable', 'string', 'max:1000'],
        ]);

        $application = PiaApplication::create($validated);

        try {
            $adminEmail = config('mail.admin_address', config('mail.from.address'));
            Mail::to($adminEmail)->send(new PiaApplicationAdminMail($application));
        } catch (\Throwable $e) {
            Log::error('Failed to send PIA application admin notification', [
                'application_id' => $application->id,
                'error'          => $e->getMessage(),
            ]);
        }

        return redirect()->route('assessment')
            ->with('success', 'Application received. A member of our team will be in touch within 48 hours.');
    }

    public function initiate(Request $request, PaystackService $paystack): SymfonyResponse
    {
        $validated = $request->validate([
            'tier'                  => ['required', 'in:foundation,growth,institutional'],
            'diagnostic_session_id' => ['required', 'integer', 'exists:diagnostic_sessions,id'],
        ]);

        // Load diagnostic session from DB — never trust user-submitted email
        $diagnosticSession = DiagnosticSession::findOrFail($validated['diagnostic_session_id']);

        // Verify the session belongs to this browser session (anti-hijacking)
        $sessionDiagnosticId = $request->session()->get('diagnostic_session_id');
        if ((int) $sessionDiagnosticId !== (int) $validated['diagnostic_session_id']) {
            Log::warning('Checkout initiate: diagnostic session ID mismatch', [
                'session_id'    => $sessionDiagnosticId,
                'submitted_id'  => $validated['diagnostic_session_id'],
                'ip'            => $request->ip(),
            ]);
            abort(403, 'Session mismatch.');
        }

        // Enforce score band — must still be mid_high or high
        if (in_array($diagnosticSession->score_band, ['low', 'mid_low'])) {
            return redirect()->route('diagnostic.result')
                ->with('error', 'Your current score does not qualify for the audit programme.');
        }

        // Block if this email already has a paid payment
        $alreadyPaid = Payment::paid()
            ->where('customer_email', $diagnosticSession->email)
            ->exists();

        if ($alreadyPaid) {
            return redirect()->route('onboarding.sign');
        }

        $gatewayCurrency = strtoupper(config('services.paystack.currency', 'NGN'));
        $isNairaUser = $diagnosticSession->country === 'Nigeria';

        if ($gatewayCurrency === 'NGN') {
            $currency = 'NGN';
        } else {
            $currency = $isNairaUser ? 'NGN' : 'USD';
        }

        try {
            $result = $paystack->initializeTransaction([
                'email'                 => $diagnosticSession->email,
                'tier'                  => $validated['tier'],
                'diagnostic_session_id' => $validated['diagnostic_session_id'],
                'callback_url'          => route('checkout.success'),
                'currency'              => $currency,
            ]);
        } catch (\Throwable $e) {
            Log::error('Payment initialization failed', [
                'error' => $e->getMessage(),
                'tier'  => $validated['tier'],
                'ip'    => $request->ip(),
            ]);

            return redirect()->route('checkout.index')
                ->with('error', 'Something went wrong. Please try again or contact support.');
        }

        $request->session()->put('pending_payment_reference', $result['reference']);
        $request->session()->put('pending_payment_tier', $validated['tier']);

        return Inertia::location($result['authorization_url']);
    }

    public function success(Request $request, PaystackService $paystack): Response|\Illuminate\Http\RedirectResponse
    {
        $reference = $request->query('reference');

        if (! $reference) {
            return redirect()->route('checkout.index')
                ->with('error', 'Invalid payment reference.');
        }

        // Find payment in OUR database first
        $payment = Payment::where('paystack_reference', $reference)->first();

        if (! $payment) {
            Log::warning('Success page hit with unknown reference', [
                'reference' => $reference,
                'ip'        => $request->ip(),
            ]);
            return redirect()->route('checkout.index')
                ->with('error', 'Payment record not found.');
        }

        // Cross-check against session pending reference — must exist AND match.
        // Skip this guard when:
        //   (a) the payment is already marked paid (webhook fired before redirect landed), or
        //   (b) the session already holds a matching payment_id (page refresh after success), or
        //   (c) the session reference is missing but the payment exists and is still pending —
        //       this covers vault/saved-card flows where Paystack's redirect may arrive on a
        //       new session (cross-origin redirect drops the session cookie on some hosts).
        //       In that case we fall through to Paystack's own verifyTransaction() API call,
        //       which is the authoritative check.
        $sessionReference = $request->session()->get('pending_payment_reference');
        $sessionPaymentId = $request->session()->get('payment_id');

        $alreadyVerified = $payment->status === 'paid'
            || (int) $sessionPaymentId === (int) $payment->id;

        $sessionMissing = ! $sessionReference || $sessionReference !== $reference;

        if (! $alreadyVerified && $sessionMissing) {
            // If payment is still pending, allow through to verifyTransaction() below —
            // the Paystack API call will confirm or reject it.
            if ($payment->status !== 'pending') {
                Log::warning('Payment reference mismatch on success page for non-pending payment', [
                    'session_ref'    => $sessionReference ?? '(none)',
                    'url_ref'        => $reference,
                    'payment_status' => $payment->status,
                    'ip'             => $request->ip(),
                ]);
                return redirect()->route('checkout.index')
                    ->with('error', 'Session expired. Please try again.');
            }

            Log::info('Success page: session reference missing for pending payment — falling through to Paystack verification', [
                'reference' => $reference,
                'ip'        => $request->ip(),
            ]);
        }

        // Already paid — skip Paystack API call entirely and go straight to render
        if ($payment->status === 'paid') {
            $request->session()->put('payment_id', $payment->id);
            $request->session()->forget('pending_payment_reference');

            return Inertia::render('Checkout/Success', [
                'tier_label'      => ucfirst($payment->tier),
                'total_amount'    => $payment->total_amount,
                'email'           => $payment->customer_email,
                'currency'        => $payment->currency ? strtoupper($payment->currency) : 'USD',
                'currency_symbol' => $payment->currency && strtoupper($payment->currency) === 'NGN' ? '₦' : '$',
            ]);
        }

        $payment->log('verification_attempted');

        // Verify with Paystack API directly — do not trust URL params alone
        try {
            $verification   = $paystack->verifyTransaction($reference);
            $paystackStatus = $verification['status'] ?? null;
            $amountPaid     = isset($verification['amount']) ? ($verification['amount'] / 100) : $payment->total_amount;
            $currency       = isset($verification['currency']) ? strtolower($verification['currency']) : $payment->currency;

            if ($paystackStatus !== 'success') {
                Log::warning('Paystack verification returned non-success status', [
                    'reference' => $reference,
                    'status'    => $paystackStatus,
                ]);
                return redirect()->route('checkout.cancel')
                    ->with('error', 'Payment was not completed successfully.');
            }
        } catch (\Throwable $e) {
            Log::error('Paystack verification exception on success page', [
                'reference' => $reference,
                'error'     => $e->getMessage(),
                'ip'        => $request->ip(),
            ]);
            return redirect()->route('checkout.cancel')
                ->with('error', 'Payment verification failed. Please contact support.');
        }

        // Atomic update — only proceeds if the row is still in non-paid state
        // This prevents duplicate emails when the webhook fires concurrently
        $affected = Payment::where('id', $payment->id)
            ->where('status', '!=', 'paid')
            ->update([
                'status'       => 'paid',
                'paid_at'      => now(),
                'total_amount' => $amountPaid,
                'currency'     => $currency,
            ]);

        if ($affected === 1) {
            $payment->refresh();
            $payment->log('paid', ['source' => 'success_page']);

            try {
                Mail::to($payment->customer_email)->send(new PaymentConfirmationMail($payment));
                Mail::to(config('mail.admin_address'))->send(new PaymentAdminNotificationMail($payment));
            } catch (\Throwable $e) {
                Log::error('Failed to send payment confirmation emails', [
                    'payment_id' => $payment->id,
                    'error'      => $e->getMessage(),
                ]);
            }
        }

        $request->session()->put('payment_id', $payment->id);
        $request->session()->forget('pending_payment_reference');

        return Inertia::render('Checkout/Success', [
            'tier_label'      => ucfirst($payment->tier),
            'total_amount'    => $payment->total_amount,
            'email'           => $payment->customer_email,
            'currency'        => $payment->currency ? strtoupper($payment->currency) : 'USD',
            'currency_symbol' => $payment->currency && strtoupper($payment->currency) === 'NGN' ? '₦' : '$',
        ]);
    }

    public function cancel(): Response
    {
        return Inertia::render('Checkout/Cancel');
    }

    public function webhook(Request $request, PaystackService $paystack): \Illuminate\Http\JsonResponse
    {
        try {
            $paystack->handleWebhook($request);
        } catch (\Throwable $e) {
            Log::error('Paystack webhook processing failed', [
                'error'          => $e->getMessage(),
                'ip'             => $request->ip(),
                'payload_length' => strlen($request->getContent()),
            ]);
        }

        // Always return 200 so Paystack does not retry indefinitely
        return response()->json(['status' => 'ok'], 200);
    }
}
