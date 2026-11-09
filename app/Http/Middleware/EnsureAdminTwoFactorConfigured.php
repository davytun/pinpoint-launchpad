<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminTwoFactorConfigured
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::guard('web')->user();

        if (! $user instanceof User) {
            return redirect()->route('admin.login');
        }

        if (! config('auth.admin_two_factor_enabled')) {
            return $next($request);
        }

        if ($user->canOperateAdmin() && ! $user->hasEnabledTwoFactorAuthentication()) {
            return redirect()->route('admin.two-factor.setup');
        }

        if ($user->canOperateAdmin() &&
            (int) $request->session()->get('admin.two_factor_verified_user') !== $user->getKey()) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('admin.login')->with('status', 'Please sign in again to verify your authenticator code.');
        }

        return $next($request);
    }
}
