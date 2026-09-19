<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RequireRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
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

        if (! in_array($user->role, $roles, true)) {
            abort(403, 'Insufficient permissions.');
        }

        return $next($request);
    }
}
