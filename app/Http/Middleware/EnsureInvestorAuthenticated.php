<?php

namespace App\Http\Middleware;

use App\Models\Investor;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureInvestorAuthenticated
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! Auth::guard('investor')->check()) {
            return redirect()->route('investor.login')
                ->with('error', 'Please log in to access the investor portal.');
        }

        if (Auth::guard('investor')->user()->account_status !== Investor::ACCOUNT_STATUS_ACTIVE) {
            Auth::guard('investor')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('investor.login')
                ->with('error', 'Your account is no longer active.');
        }

        return $next($request);
    }
}
