<?php

namespace App\Http\Controllers\Investor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Investor\InvestorLoginRequest;
use App\Models\Investor;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class InvestorAuthController extends Controller
{
    public function showLogin(): Response|RedirectResponse
    {
        if (Auth::guard('investor')->check()) {
            return redirect()->route('investor.dashboard');
        }

        return Inertia::render('Investor/Auth/Login', [
            'status' => session('status'),
        ]);
    }

    public function login(InvestorLoginRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        if (! Auth::guard('investor')->attempt([
            'email' => $validated['email'],
            'password' => $validated['password'],
        ], $request->boolean('remember'))) {
            return back()->withErrors([
                'email' => trans('auth.failed'),
            ])->onlyInput('email');
        }

        $investor = Auth::guard('investor')->user();

        if ($investor->account_status !== Investor::ACCOUNT_STATUS_ACTIVE) {
            Auth::guard('investor')->logout();
            return back()->withErrors([
                'email' => 'We could not sign you in. Your account may still be under review.',
            ])->onlyInput('email');
        }

        $request->session()->regenerate();
        $investor->update(['last_login_at' => now()]);

        return redirect()->intended(route('investor.dashboard'));
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::guard('investor')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('investor.login');
    }

    public function dashboard(): Response
    {
        return Inertia::render('Investor/Dashboard', [
            'investor' => Auth::guard('investor')->user()->load([
                'profile:investor_id,full_name',
                'kycSubmissions:id,investor_id,status,original_name,review_notes,reviewed_at',
            ]),
        ]);
    }

    public function showForgotPassword(): Response|RedirectResponse
    {
        if (Auth::guard('investor')->check()) {
            return redirect()->route('investor.dashboard');
        }

        return Inertia::render('Investor/Auth/ForgotPassword');
    }

    public function sendResetLink(Request $request): RedirectResponse
    {
        $request->validate(['email' => ['required', 'email']]);

        $status = Password::broker('investors')->sendResetLink(
            $request->only('email')
        );

        if ($status === Password::RESET_LINK_SENT || $status === Password::INVALID_USER) {
            return back()->with('success', 'If an account exists with that email, you will receive a reset link shortly.');
        }

        return back()->withErrors(['email' => __($status)]);
    }

    public function showResetPassword(Request $request): Response
    {
        return Inertia::render('Investor/Auth/ResetPassword', [
            'token' => $request->route('token'),
            'email' => $request->query('email', ''),
        ]);
    }

    public function resetPassword(Request $request): RedirectResponse
    {
        $request->validate([
            'token'                 => ['required'],
            'email'                 => ['required', 'email'],
            'password'              => ['required', 'min:8', 'confirmed'],
            'password_confirmation' => ['required'],
        ]);

        $status = Password::broker('investors')->reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (Investor $investor, string $password) {
                $investor->forceFill([
                    'password'       => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($investor));
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return redirect()->route('investor.login')
                ->with('success', 'Password reset successfully. Please log in.');
        }

        return back()->withErrors(['email' => __($status)]);
    }
}
