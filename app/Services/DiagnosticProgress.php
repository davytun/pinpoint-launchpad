<?php

namespace App\Services;

use App\Models\DiagnosticSession;
use App\Models\Founder;
use App\Models\Payment;
use App\Models\PiaApplication;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;

class DiagnosticProgress
{
    public const COOKIE = 'diagnostic_resume';

    /** About 60 days, in minutes. */
    public const MINUTES = 60 * 24 * 60;

    public function remember(Request $request, DiagnosticSession $session): void
    {
        $request->session()->put('diagnostic_session_id', $session->id);
        $request->session()->put('diagnostic_email', $session->email);
        $request->session()->put('result_viewed', true);

        Cookie::queue(cookie(self::COOKIE, $session->resume_token, self::MINUTES));
    }

    public function resolve(Request $request): ?DiagnosticSession
    {
        $sessionId = $request->session()->get('diagnostic_session_id');

        if ($sessionId) {
            $session = DiagnosticSession::query()->find($sessionId);

            if ($session) {
                return $session;
            }
        }

        $token = $request->cookie(self::COOKIE);

        if (! is_string($token) || $token === '') {
            return null;
        }

        return DiagnosticSession::query()->where('resume_token', $token)->first();
    }

    public function shouldResume(DiagnosticSession $session): bool
    {
        if ($this->founderExists($session) || $this->paidPayment($session) !== null) {
            return true;
        }

        if ($session->isOnCooldown() || in_array($session->score_band, ['mid_high', 'high'], true)) {
            return true;
        }

        return $this->openPiaRequest($session);
    }

    /**
     * Send a returning founder to the next unfinished step.
     *
     * @param  'auto'|'result'|'checkout'  $preferred
     */
    public function redirectToProgress(Request $request, DiagnosticSession $session, string $preferred = 'auto'): RedirectResponse
    {
        $recovered = (int) $request->session()->get('diagnostic_session_id') !== (int) $session->id;

        $this->remember($request, $session);
        $request->session()->forget(['diagnostic_result', 'diagnostic_basics']);

        if ($preferred !== 'result' && $this->founderExists($session)) {
            return redirect()->route('founder.login')
                ->with('info', 'An account already exists for this email. Log in to continue your application.');
        }

        if ($preferred !== 'result') {
            $paid = $this->paidPayment($session);

            if ($paid) {
                $request->session()->put('payment_id', $paid->id);

                return $this->withRecoveryNotice(redirect()->route('onboarding.sign'), $recovered);
            }
        }

        $wantsCheckout = $preferred === 'checkout'
            || ($preferred === 'auto' && $this->openPiaRequest($session));

        if ($wantsCheckout && ! in_array($session->score_band, ['low', 'mid_low'], true)) {
            return $this->withRecoveryNotice(redirect()->route('checkout.index'), $recovered);
        }

        return $this->withRecoveryNotice(redirect()->route('diagnostic.result'), $recovered);
    }

    private function withRecoveryNotice(RedirectResponse $redirect, bool $recovered): RedirectResponse
    {
        if (! $recovered) {
            return $redirect;
        }

        return $redirect->with('info', 'We found your diagnostic. Picking up where you left off.');
    }

    private function founderExists(DiagnosticSession $session): bool
    {
        return Founder::query()->where('email', $session->email)->exists();
    }

    private function paidPayment(DiagnosticSession $session): ?Payment
    {
        return Payment::paid()
            ->where(function ($query) use ($session) {
                $query->where('diagnostic_session_id', $session->id)
                    ->orWhere('customer_email', $session->email);
            })
            ->latest()
            ->first();
    }

    private function openPiaRequest(DiagnosticSession $session): bool
    {
        return PiaApplication::query()
            ->where('email', $session->email)
            ->where('source', 'diagnostic_tier_selection')
            ->whereIn('status', ['pending', 'contacted'])
            ->exists();
    }
}
