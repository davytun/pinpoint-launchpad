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

            if ($payment && $payment->status === 'paid') {
                return $next($request);
            }
        }

        // 2. Session may have expired — recover via diagnostic_session_id (direct FK, not email)
        $diagnosticSessionId = $request->session()->get('diagnostic_session_id');

        if ($diagnosticSessionId) {
            $diagnosticSession = DiagnosticSession::find($diagnosticSessionId);

            if ($diagnosticSession) {
                $payment = Payment::where('diagnostic_session_id', $diagnosticSession->id)
                    ->where('status', 'paid')
                    ->latest()
                    ->first();

                if ($payment) {
                    $request->session()->put('payment_id', $payment->id);
                    return $next($request);
                }
            }
        }

        // 3. Authenticated user fallback — scoped to the current diagnostic session
        if ($request->user()) {
            $scopedSessionId = $diagnosticSessionId
                ?? $request->route('diagnostic_session_id')
                ?? $request->input('diagnostic_session_id');

            $query = Payment::where('user_id', $request->user()->id)
                ->where('status', 'paid');

            if ($scopedSessionId) {
                $query->where('diagnostic_session_id', $scopedSessionId);
            }

            $payment = $query->latest()->first();

            if ($payment) {
                $request->session()->put('payment_id', $payment->id);
                return $next($request);
            }
        }

        return redirect()->route('checkout.index')
            ->with('error', 'Please complete payment to continue.');
    }
}
