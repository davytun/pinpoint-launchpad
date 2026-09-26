<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\PiaAgreementInviteMail;
use App\Models\DiagnosticSession;
use App\Models\Payment;
use App\Models\PiaApplication;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PiaApplicationController extends Controller
{
    private const TIER_AMOUNTS = [
        'NGN' => ['foundation' => 350000, 'growth' => 2090000, 'institutional' => 4850000],
        'USD' => ['foundation' => 500, 'growth' => 1500, 'institutional' => 3500],
    ];

    public function index(Request $request): Response
    {
        $status = $request->string('status')->value();

        $applications = $this->paymentQuery()
            ->when(in_array($status, ['pending', 'contacted', 'converted'], true), fn ($query) => $query->where('status', $status))
            ->latest()
            ->paginate(20);

        $diagnostics = DiagnosticSession::query()
            ->whereIn('email', $applications->getCollection()->pluck('email')->filter()->unique()->all())
            ->latest('id')
            ->get()
            ->unique(fn (DiagnosticSession $session) => strtolower((string) $session->email))
            ->keyBy(fn (DiagnosticSession $session) => strtolower((string) $session->email));

        $applications->through(function (PiaApplication $application) use ($diagnostics) {
            $diagnostic = $diagnostics->get(strtolower($application->email));

            return [
                'id' => $application->id,
                'name' => $application->name,
                'email' => $application->email,
                'company' => $application->company,
                'country' => $diagnostic?->country ?: $application->country,
                'stage' => $diagnostic?->growth_stage ?: $application->stage,
                'raise_target' => $diagnostic?->looking_to_raise ?: $application->raise_target,
                'score' => $diagnostic?->score !== null ? (int) $diagnostic->score : null,
                'score_band_label' => $diagnostic ? $diagnostic->getScoreBandLabel() : null,
                'message' => $application->message,
                'selected_tier' => $application->selected_tier,
                'status' => $application->status,
                'source' => $application->source,
                'created_at' => $application->created_at->toIso8601String(),
                'agreement_url' => $this->agreementUrlFor($application),
            ];
        });

        $desk = str_starts_with($request->path(), 'admin/founder') ? 'founder' : 'platform';

        $statusCounts = [
            'all' => $this->paymentQuery()->count(),
            'pending' => $this->paymentQuery()->where('status', 'pending')->count(),
            'contacted' => $this->paymentQuery()->where('status', 'contacted')->count(),
            'converted' => $this->paymentQuery()->where('status', 'converted')->count(),
        ];

        return Inertia::render('Admin/PiaRequests/Index', [
            'applications' => $applications,
            'activeStatus' => in_array($status, ['pending', 'contacted', 'converted'], true) ? $status : 'all',
            'statusCounts' => $statusCounts,
            'tierAmounts' => self::TIER_AMOUNTS,
            'desk' => $desk,
            'can_record_payment' => $desk === 'founder'
                ? ($request->user()?->canManageAudit() ?? false)
                : ($request->user()?->isSuperAdmin() ?? false),
        ]);
    }

    public function markContacted(PiaApplication $application): RedirectResponse
    {
        $this->ensurePaymentRequest($application);

        if ($application->status === 'pending') {
            $application->update(['status' => 'contacted']);
        }

        return back()->with('success', "Marked as contacted — next, wait for {$application->name}'s payment.");
    }

    public function updateTier(Request $request, PiaApplication $application): RedirectResponse
    {
        $this->ensurePaymentRequest($application);

        if ($application->status === 'converted') {
            return back()->with('error', 'This request is already paid — the plan cannot be changed.');
        }

        $validated = $request->validate([
            'selected_tier' => ['required', 'in:foundation,growth,institutional'],
        ]);

        $application->update(['selected_tier' => $validated['selected_tier']]);

        return back()->with('success', 'Plan saved for '.$application->company.'.');
    }

    public function confirmPaymentReceived(Request $request, PiaApplication $application): RedirectResponse
    {
        $this->ensurePaymentRequest($application);

        $validated = $request->validate([
            'amount' => ['required', 'integer', 'min:1'],
            'currency' => ['required', 'in:NGN,USD'],
            'selected_tier' => ['nullable', 'in:foundation,growth,institutional'],
        ]);

        if (! empty($validated['selected_tier'])) {
            $application->update(['selected_tier' => $validated['selected_tier']]);
            $application->refresh();
        }

        if (! in_array($application->selected_tier, ['foundation', 'growth', 'institutional'], true)) {
            return back()->with('error', 'Pick a plan before confirming payment.');
        }

        if ($application->status === 'converted') {
            $existingUrl = $this->agreementUrlFor($application);

            return back()
                ->with('info', 'Payment was already confirmed for this request.')
                ->with('agreement_url', $existingUrl);
        }

        $payment = DB::transaction(function () use ($application, $validated) {
            $diagnostic = DiagnosticSession::query()->where('email', $application->email)->latest()->first();
            $reference = 'offline-pia-'.$application->id;

            $payment = Payment::query()->firstOrCreate(
                ['paystack_reference' => $reference],
                [
                    'diagnostic_session_id' => $diagnostic?->id,
                    'tier' => $application->selected_tier,
                    'tier_base_amount' => $validated['amount'],
                    'total_amount' => $validated['amount'],
                    'currency' => $validated['currency'],
                    'customer_email' => $application->email,
                ],
            );

            if ($payment->status !== 'paid') {
                $payment->status = 'paid';
                $payment->audit_status = 'pending';
                $payment->paid_at = now();
                $payment->save();
                $payment->log('offline_payment_recorded', [
                    'pia_application_id' => $application->id,
                    'recorded_by' => request()->user()?->id,
                ]);
            }

            $application->update(['status' => 'converted']);

            return $payment;
        });

        $agreementUrl = $this->issueAgreementInvite($application, $payment);
        $mailed = $this->sendAgreementInvite($application, $agreementUrl);

        return back()
            ->with(
                'success',
                $mailed
                    ? "Payment confirmed. Agreement link emailed to {$application->email}."
                    : "Payment confirmed. Email could not be sent — copy the agreement link and send it to {$application->email}."
            )
            ->with('agreement_url', $agreementUrl);
    }

    public function resendAgreement(PiaApplication $application): RedirectResponse
    {
        $this->ensurePaymentRequest($application);

        if ($application->status !== 'converted') {
            return back()->with('error', 'Confirm payment before sending an agreement link.');
        }

        $payment = Payment::query()->where('paystack_reference', 'offline-pia-'.$application->id)->first();
        if (! $payment) {
            return back()->with('error', 'No payment record found for this request.');
        }

        $agreementUrl = $this->issueAgreementInvite($application, $payment);
        $mailed = $this->sendAgreementInvite($application, $agreementUrl);

        return back()
            ->with(
                'success',
                $mailed
                    ? "Agreement link emailed again to {$application->email}."
                    : "Email could not be sent — copy the agreement link and send it to {$application->email}."
            )
            ->with('agreement_url', $agreementUrl);
    }

    private function paymentQuery()
    {
        return PiaApplication::query()->where('source', 'diagnostic_tier_selection');
    }

    private function ensurePaymentRequest(PiaApplication $application): void
    {
        abort_unless($application->source === 'diagnostic_tier_selection', 404);
    }

    private function issueAgreementInvite(PiaApplication $application, Payment $payment): string
    {
        $token = Str::random(64);

        Cache::put('pia_agreement_invite_'.$token, [
            'payment_id' => $payment->id,
            'pia_application_id' => $application->id,
        ], now()->addDays(7));

        Cache::put('pia_agreement_app_'.$application->id, $token, now()->addDays(7));

        return route('onboarding.continue', ['token' => $token]);
    }

    private function agreementUrlFor(PiaApplication $application): ?string
    {
        if ($application->status !== 'converted') {
            return null;
        }

        $token = Cache::get('pia_agreement_app_'.$application->id);
        if (! is_string($token) || $token === '') {
            return null;
        }

        return route('onboarding.continue', ['token' => $token]);
    }

    private function sendAgreementInvite(PiaApplication $application, string $agreementUrl): bool
    {
        try {
            Mail::to($application->email)->send(new PiaAgreementInviteMail($application->name, $agreementUrl));

            return true;
        } catch (\Throwable $e) {
            report($e);

            return false;
        }
    }
}
