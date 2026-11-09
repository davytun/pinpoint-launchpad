<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Actions\EnableTwoFactorAuthentication;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();
        $user = $request->user();

        if (config('auth.admin_two_factor_enabled') &&
            $user->canOperateAdmin() &&
            $user->hasEnabledTwoFactorAuthentication()) {
            $request->session()->forget('admin.two_factor_verified_user');
            $request->session()->put([
                'admin.two_factor_login.id' => $user->getKey(),
                'admin.two_factor_login.password_hash' => $user->getAuthPassword(),
                'admin.two_factor_login.started_at' => now()->timestamp,
            ]);

            Auth::guard('web')->logout();
            $request->session()->regenerate();

            return redirect()->route('admin.two-factor.challenge');
        }

        $request->session()->regenerate();

        if (config('auth.admin_two_factor_enabled') &&
            $user->canOperateAdmin() &&
            ! $user->hasEnabledTwoFactorAuthentication()) {
            app(EnableTwoFactorAuthentication::class)($user);

            return redirect()->route('admin.two-factor.setup');
        }

        $default = $user->canOperateAdmin()
            ? $user->defaultAdminHomeRoute()
            : route('home', absolute: false);

        return redirect()->intended($default);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $wasAdmin = Auth::user()?->canOperateAdmin();

        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return $wasAdmin
            ? redirect()->route('admin.login')
            : redirect('/');
    }
}
