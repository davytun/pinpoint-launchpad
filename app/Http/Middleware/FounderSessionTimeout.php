<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class FounderSessionTimeout
{
    private const TIMEOUT_SECONDS = 120 * 60; // 120 minutes

    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::guard('founder')->check()) {
            $lastActivity = session('founder_last_activity');

            if ($lastActivity && (now()->timestamp - $lastActivity) > self::TIMEOUT_SECONDS) {
                Auth::guard('founder')->logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                return redirect()->route('founder.login')
                    ->with('info', 'Your session has expired. Please log in again.');
            }

            session(['founder_last_activity' => now()->timestamp]);
        }

        return $next($request);
    }
}
