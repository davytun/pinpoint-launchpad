<?php

namespace App\Http\Controllers;

use App\Mail\PaymentAdminNotificationMail;
use App\Mail\PaymentConfirmationMail;
use App\Models\DiagnosticSession;
use App\Models\Payment;
use App\Services\PaystackService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class CheckoutController extends Controller
{
    private const TIERS = [
        [
            'key'        => 'foundation',
            'label'      => 'Foundation',
            'tagline'    => 'Early-stage founders needing a roadmap.',
            'base_price' => 350,
            'gate_fee'   => 150,
            'total'      => 500,
            'features'   => [
                'Full Radar Chart: Detailed visual of all 7 PARAGON pillars.',
                'The Actionable Blueprint: 5-page gap analysis report.',
                'Digital Readiness Badge: For your pitch deck & LinkedIn.',
                'Standard Support: Email-based guidance on report findings.',
            ],
            'is_featured' => false,
            'redeemable'  => false,
        ],
        [
            'key'        => 'growth',
            'label'      => 'Growth',
            'tagline'    => 'Seed-stage startups preparing for a round.',
            'base_price' => 750,
            'gate_fee'   => 150,
            'total'      => 900,
            'features'   => [
                'Everything in Tier 1.',
                '1-on-1 Analyst Review: 45-min deep dive into your "Deal-Killers."',
                'Financial Stress-Test: Verification of your CAC/LTV & Runway.',
                'Tier 2 PIN Access: Introduction to 3 targeted "Angel/Micro-VC" leads.',
            ],
            'is_featured' => true,
            'redeemable'  => false,
        ],
        [
            'key'        => 'institutional',
            'label'      => 'Institutional',
            'tagline'    => 'Series A/B and High-Growth SMEs.',
            'base_price' => 1500,
            'gate_fee'   => 150,
            'total'      => 1650,
            'features'   => [
                'Everything in Tier 2.',
                '2-Hour Strategy Intensive: Direct consultation with a Lead Analyst.',
                'The "Verified" Portal: Custom secure URL for investor due diligence.',
                'The PIN Network Max: Unlimited access to our Tier-1 VC Network.',
                'Success Fee Credit: Your $1,500 is credited against your 2% equity warrant.',
            ],
            'is_featured'        => false,
            'redeemable'         => true,
            'redeemable_tooltip' => 'Our Success Guarantee: Upon the close of a funding round via the PIN Network, your $1,500 assessment fee is fully credited toward your 2% success fee, effectively making this professional audit free.',
        ],
    ];

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

        return Inertia::render('Checkout/Index', [
            'score'                 => $diagnosticSession->score,
            'score_band'            => $diagnosticSession->score_band,
            'tiers'                 => self::TIERS,
            'diagnostic_session_id' => $sessionId,
            'customer_email'        => $diagnosticSession->email,
        ]);
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

        try {
            $result = $paystack->initializeTransaction([
                'email'                 => $diagnosticSession->email,
                'tier'                  => $validated['tier'],
                'diagnostic_session_id' => $validated['diagnostic_session_id'],
                'callback_url'          => route('checkout.success'),
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

        // Cross-check against session pending reference — must exist AND match
        $sessionReference = $request->session()->get('pending_payment_reference');

        // Allow webhook-first flow only when explicitly enabled via config
        $allowWebhookFirst = config('checkout.allow_webhook_first', false);

        if (! $allowWebhookFirst && (! $sessionReference || $sessionReference !== $reference)) {
            Log::warning('Payment reference mismatch or missing session reference on success page', [
                'session_ref' => $sessionReference ?? '(none)',
                'url_ref'     => $reference,
                'ip'          => $request->ip(),
            ]);
            abort(403, 'Reference mismatch or missing session reference');
        }

        $payment->log('verification_attempted');

        // Verify with Paystack API directly — do not trust URL params alone
        try {
            $verification   = $paystack->verifyTransaction($reference);
            $paystackStatus = $verification['status'] ?? null;

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
            ->update(['status' => 'paid', 'paid_at' => now()]);

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
            'tier_label'   => ucfirst($payment->tier),
            'total_amount' => $payment->total_amount,
            'email'        => $payment->customer_email,
        ]);
    }

    public function cancel(): Response
    {
        return Inertia::render('Checkout/Cancel');
    }

    public function webhook(Request $request, PaystackService $paystack): \Illuminate\Http\JsonResponse
    {
        $paystack->handleWebhook($request);

        return response()->json(['status' => 'ok'], 200);
    }
}
