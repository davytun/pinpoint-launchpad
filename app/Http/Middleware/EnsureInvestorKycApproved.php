<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureInvestorKycApproved
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $investor = Auth::guard('investor')->user();

        if (! $investor || ! $investor->canAccessProtectedInvestorContent()) {
            return redirect()->route('investor.kyc.create')
                ->with('error', 'KYC approval is required before you can access protected investor materials.');
        }

        return $next($request);
    }
}
