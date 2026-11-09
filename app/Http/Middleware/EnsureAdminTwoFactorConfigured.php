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

        if ($user->canOperateAdmin() && ! $user->hasEnabledTwoFactorAuthentication()) {
            return redirect()->route('admin.two-factor.setup');
        }

        return $next($request);
    }
}
