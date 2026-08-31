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

        $applications = PiaApplication::query()
            ->when(in_array($status, ['pending', 'contacted', 'converted'], true), fn ($query) => $query->where('status', $status))
            ->latest()
            ->paginate(20)
            ->through(fn (PiaApplication $application) => [
                'id' => $application->id,
                'name' => $application->name,
                'email' => $application->email,
                'company' => $application->company,
                'country' => $application->country,
                'stage' => $application->stage,
                'raise_target' => $application->raise_target,
                'message' => $application->message,
                'selected_tier' => $application->selected_tier,
                'status' => $application->status,
                'source' => $application->source,
                'created_at' => $application->created_at->toIso8601String(),
            ]);

        return Inertia::render('Admin/PiaRequests/Index', [
            'applications' => $applications,
            'activeStatus' => in_array($status, ['pending', 'contacted', 'converted'], true) ? $status : 'all',
            'tierAmounts' => self::TIER_AMOUNTS,
        ]);
    }

    public function markContacted(PiaApplication $application): RedirectResponse
    {
        if ($application->status === 'pending') {
            $application->update(['status' => 'contacted']);
        }

        return back()->with('success', "{$application->name} is marked as contacted.");
    }

    public function confirmPaymentReceived(Request $request, PiaApplication $application): RedirectResponse
    {
        $validated = $request->validate([
            'amount' => ['required', 'integer', 'min:1'],
            'currency' => ['required', 'in:NGN,USD'],
        ]);

        if (! in_array($application->selected_tier, ['foundation', 'growth', 'institutional'], true)) {
            return back()->with('error', 'Select a PIA tier before recording payment.');
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

        $token = Str::random(64);
        Cache::put('pia_agreement_invite_'.$token, ['payment_id' => $payment->id], now()->addDays(7));
        $agreementUrl = route('onboarding.continue', ['token' => $token]);

        Mail::to($application->email)->send(new PiaAgreementInviteMail($application->name, $agreementUrl));

        return back()->with('success', "Payment recorded. A secure agreement link was sent to {$application->email}.");
    }
}
