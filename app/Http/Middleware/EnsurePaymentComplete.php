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

        // 2. Session may have expired — recover via diagnostic session email
        $diagnosticSessionId = $request->session()->get('diagnostic_session_id');

        if ($diagnosticSessionId) {
            $diagnosticSession = DiagnosticSession::find($diagnosticSessionId);

            if ($diagnosticSession) {
                $payment = Payment::where('customer_email', $diagnosticSession->email)
                    ->where('status', 'paid')
                    ->latest()
                    ->first();

                if ($payment) {
                    // Restore payment to session
                    $request->session()->put('payment_id', $payment->id);
                    return $next($request);
                }
            }
        }

        // 3. Authenticated user fallback
        if ($request->user()) {
            $payment = Payment::where('user_id', $request->user()->id)
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
