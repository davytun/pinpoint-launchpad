<?php

namespace App\Http\Middleware;

use App\Models\Payment;
use App\Models\Signature;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSignatureComplete
{
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Session signature_id — fastest path
        if ($request->session()->has('signature_id')) {
            $signature = Signature::find($request->session()->get('signature_id'));

            if ($signature && $signature->isSigned()) {
                return $next($request);
            }
        }

        // 2. Recover via session payment_id — load payment with its signature
        if ($request->session()->has('payment_id')) {
            $payment = Payment::with('signature')->find($request->session()->get('payment_id'));

            if ($payment && $payment->signature && $payment->signature->isSigned()) {
                $request->session()->put('signature_id', $payment->signature->id);
                return $next($request);
            }
        }

        // 3. Email fallback via diagnostic session
        $diagnosticSessionId = $request->session()->get('diagnostic_session_id');

        if ($diagnosticSessionId) {
            $payment = Payment::where('diagnostic_session_id', $diagnosticSessionId)
                ->where('status', 'paid')
                ->latest()
                ->first();

            if ($payment) {
                $signature = Signature::byEmail($payment->customer_email)
                    ->signed()
                    ->latest()
                    ->first();

                if ($signature) {
                    $request->session()->put('signature_id', $signature->id);
                    return $next($request);
                }
            }
        }

        return redirect()->route('onboarding.sign')
            ->with('error', 'Please complete the agreement signing to continue.');
    }
}
