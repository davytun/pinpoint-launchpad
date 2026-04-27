<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureFounderAuthenticated
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! Auth::guard('founder')->check()) {
            return redirect()->route('founder.login')
                ->with('error', 'Please log in to access your dashboard.');
        }

        return $next($request);
    }
}
