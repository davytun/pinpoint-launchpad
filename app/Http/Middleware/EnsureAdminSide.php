<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminSide
{
    public function handle(Request $request, Closure $next, string $side): Response
    {
        if (! Auth::check()) {
            return redirect()->route('admin.login');
        }

        $user = Auth::user();

        $allowed = match ($side) {
            'central' => $user->canAccessPlatformAdmin(),
            'founder' => $user->canAccessFounderAdmin(),
            'investors' => $user->canAccessInvestorAdmin(),
            default => false,
        };

        if (! $allowed) {
            if ($user->canOperateAdmin()) {
                return redirect()->to($user->defaultAdminHomeRoute());
            }

            abort(403);
        }

        return $next($request);
    }
}
