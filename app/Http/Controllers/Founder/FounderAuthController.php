<?php

namespace App\Http\Controllers\Founder;

use App\Http\Controllers\Controller;
use App\Mail\FounderWelcomeMail;
use App\Models\DiagnosticSession;
use App\Models\Founder;
use App\Models\Payment;
use App\Models\Signature;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class FounderAuthController extends Controller
{
    // ─── Setup ───────────────────────────────────────────────────────────────

    public function showSetup(Request $request): Response|RedirectResponse
    {
        $email = $request->query('email');
        $token = $request->query('token');

        if (! $email || ! $token) {
            return redirect()->route('founder.login')
                ->with('error', 'Invalid setup link. Please check your email for the setup invitation.');
        }

        $cachedToken = Cache::get('founder_setup_token_' . $email);

        if (! $cachedToken || ! hash_equals($cachedToken, $token)) {
            return redirect()->route('founder.login')
                ->with('error', 'This setup link has expired or is invalid. Please contact support.');
        }

        $founder = Founder::where('email', $email)->first();

        if ($founder && $founder->hasSetupAccount()) {
            return redirect()->route('founder.login')
                ->with('info', 'Your account is already set up. Please log in.');
        }

        // Pre-fill name/company from most recent signed signature
        /** @var Signature|null $signature */
        $signature = Signature::where('signer_email', $email)
            ->where('status', 'signed')
            ->latest()->first();

        return Inertia::render('Founder/Auth/Setup', [
            'email'        => $email,
            'token'        => $token,
            'full_name'    => $signature?->signer_full_name,
            'company_name' => $signature?->signer_company_name,
        ]);
    }

    public function setup(Request $request): RedirectResponse
    {
        $request->validate([
            'token'        => ['required', 'string'],
            'email'        => ['required', 'email'],
            'password'     => ['required', 'min:8', 'confirmed'],
            'full_name'    => ['required', 'string', 'min:2', 'max:100'],
            'company_name' => ['required', 'string', 'min:2', 'max:150'],
        ]);

        // Re-verify token — one-time use
        $cachedToken = Cache::get('founder_setup_token_' . $request->email);

        if (! $cachedToken || ! hash_equals($cachedToken, $request->token)) {
            return back()->withErrors([
                'email' => 'This setup link is invalid or has expired.',
            ]);
        }

        $diagnosticSession = DiagnosticSession::where('email', $request->email)
            ->latest()->first();

        /** @var Payment|null $payment */
        $payment = Payment::where('customer_email', $request->email)
            ->where('status', 'paid')
            ->latest()->first();

        /** @var Signature|null $signature */
        $signature = Signature::where('signer_email', $request->email)
            ->where('status', 'signed')
            ->latest()->first();

        $founder = Founder::firstOrNew(['email' => $request->email]);

        $founder->fill([
            'password'              => $request->password,
            'full_name'             => $request->full_name,
            'company_name'          => $request->company_name,
            'email_verified_at'     => now(),
            'diagnostic_session_id' => $diagnosticSession?->id,
            'payment_id'            => $payment?->id,
            'signature_id'          => $signature?->id,
            'last_login_at'         => now(),
        ]);
        $founder->save();

        Auth::guard('founder')->login($founder);

        // Regenerate session to prevent fixation attacks
        $request->session()->regenerate();
        $request->session()->put('founder_last_activity', now()->timestamp);

        // Invalidate token — one-time use only
        Cache::forget('founder_setup_token_' . $request->email);

        // Clear onboarding session keys
        session()->forget([
            'diagnostic_session_id',
            'diagnostic_result',
            'payment_id',
            'signature_id',
            'signer_full_name',
            'signer_company_name',
            'pending_payment_reference',
        ]);

        Mail::to($founder->email)->send(new FounderWelcomeMail($founder));

        return redirect()->route('founder.dashboard');
    }

    // ─── Login / Logout ──────────────────────────────────────────────────────

    public function showLogin(): Response|RedirectResponse
    {
        if (Auth::guard('founder')->check()) {
            return redirect()->route('founder.dashboard');
        }

        return Inertia::render('Founder/Auth/Login');
    }

    public function login(Request $request): RedirectResponse
    {
        $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required'],
        ]);

        $credentials = $request->only('email', 'password');

        if (Auth::guard('founder')->attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();
            $request->session()->put('founder_last_activity', now()->timestamp);

            Auth::guard('founder')->user()->update(['last_login_at' => now()]);

            return redirect()->intended(route('founder.dashboard'));
        }

        return back()->withErrors([
            'email' => 'These credentials do not match our records.',
        ])->onlyInput('email');
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::guard('founder')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('founder.login');
    }

    // ─── Password Reset ──────────────────────────────────────────────────────

    public function showForgotPassword(): Response|RedirectResponse
    {
        if (Auth::guard('founder')->check()) {
            return redirect()->route('founder.dashboard');
        }

        return Inertia::render('Founder/Auth/ForgotPassword');
    }

    public function sendResetLink(Request $request): RedirectResponse
    {
        $request->validate(['email' => ['required', 'email']]);

        $status = Password::broker('founders')->sendResetLink(
            $request->only('email')
        );

        if ($status === Password::RESET_LINK_SENT) {
            return back()->with('success', 'If an account exists with that email, you will receive a reset link shortly.');
        }

        return back()->withErrors(['email' => 'Unable to send reset link.']);
    }

    public function showResetPassword(Request $request): Response
    {
        return Inertia::render('Founder/Auth/ResetPassword', [
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

        $status = Password::broker('founders')->reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (Founder $founder, string $password) {
                $founder->forceFill([
                    'password'       => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($founder));
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return redirect()->route('founder.login')
                ->with('success', 'Password reset successfully. Please log in.');
        }

        return back()->withErrors(['email' => __($status)]);
    }
}
