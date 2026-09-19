<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminSide
{
    public function handle(Request $request, Closure $next, string $side): Response
    {
        /** @var User|null $user */
        $user = Auth::guard('web')->user();

        if (! $user instanceof User) {
            if (Auth::guard('investor')->check() || Auth::guard('founder')->check()) {
                abort(403);
            }

            return redirect()->route('admin.login');
        }

        Auth::shouldUse('web');

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
