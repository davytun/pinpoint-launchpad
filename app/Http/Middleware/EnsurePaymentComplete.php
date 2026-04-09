<?php

namespace App\Http\Middleware;

use App\Models\DiagnosticSession;
use App\Models\Payment;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePaymentComplete
{
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Session payment_id — fastest path
        if ($request->session()->has('payment_id')) {
            $payment = Payment::find($request->session()->get('payment_id'));

            // Verify ownership when a user is authenticated
            $ownerOk = ! $request->user()
                || $payment?->user_id === null
                || (int) $payment->user_id === (int) $request->user()->id;

            if ($payment && $payment->status === 'paid' && $ownerOk) {
                return $next($request);
            }
        }

        // 2. Session may have expired — recover via diagnostic_session_id (direct FK, not email)
        // diagnostic_session_id comes only from the server-side session — never user input
        $diagnosticSessionId = $request->session()->get('diagnostic_session_id');

        if ($diagnosticSessionId) {
            $diagnosticSession = DiagnosticSession::find($diagnosticSessionId);

            if ($diagnosticSession) {
                $payment = Payment::where('diagnostic_session_id', $diagnosticSession->id)
                    ->where('status', 'paid')
                    ->latest()
                    ->first();

                // Ownership check: only restore if payment belongs to the authenticated user (when logged in)
                $ownershipOk = ! $request->user() || (int) $payment?->user_id === (int) $request->user()->id || $payment?->user_id === null;

                if ($payment && $ownershipOk) {
                    $request->session()->put('payment_id', $payment->id);
                    return $next($request);
                }
            }
        }

        // 3. Authenticated user fallback — requires a scoped diagnostic_session_id
        if ($request->user()) {
            // Only use route param — never $request->input() to prevent user-supplied IDs
            $scopedSessionId = $diagnosticSessionId ?? $request->route('diagnostic_session_id');

            // Refuse to run a loose all-payments query without a scoped session ID
            if (! $scopedSessionId) {
                return redirect()->route('checkout.index')
                    ->with('error', 'Please complete payment to continue.');
            }

            $payment = Payment::where('user_id', $request->user()->id)
                ->where('diagnostic_session_id', $scopedSessionId)
                ->where('status', 'paid')
                ->latest()
                ->first();

            if ($payment) {
                $request->session()->put('payment_id', $payment->id);
                return $next($request);
            }
        }

        return redirect()->route('checkout.index')
            ->with('error', 'Please complete payment to continue.');
    }
}
