<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Contracts\TwoFactorAuthenticationProvider;
use Laravel\Fortify\Fortify;

class AdminTwoFactorChallengeController extends Controller
{
    public function show(Request $request): Response|RedirectResponse
    {
        $user = $this->pendingUser($request);

        if (! $user) {
            return redirect()->route('admin.login')->with('status', 'Please sign in again.');
        }

        return Inertia::render('Admin/TwoFactor/Challenge', [
            'email' => $user->email,
        ]);
    }

    public function store(Request $request, TwoFactorAuthenticationProvider $provider): RedirectResponse
    {
        $user = $this->pendingUser($request);

        if (! $user) {
            return redirect()->route('admin.login')->with('status', 'Your verification session expired. Please sign in again.');
        }

        $validated = $request->validate([
            'code' => ['nullable', 'digits:6', 'required_without:recovery_code'],
            'recovery_code' => ['nullable', 'string', 'max:255', 'required_without:code'],
        ]);

        if (! empty($validated['recovery_code'])) {
            $this->verifyRecoveryCode($user, $validated['recovery_code']);
        } else {
            $secret = Fortify::currentEncrypter()->decrypt($user->two_factor_secret);

            if (! $provider->verify($secret, $validated['code'])) {
                throw ValidationException::withMessages([
                    'code' => 'That authenticator code is not valid. Try the current code shown in your app.',
                ]);
            }
        }

        Auth::guard('web')->login($user);
        $request->session()->forget([
            'admin.two_factor_login.id',
            'admin.two_factor_login.password_hash',
            'admin.two_factor_login.started_at',
        ]);
        $request->session()->put('admin.two_factor_verified_user', $user->getKey());
        $request->session()->regenerate();

        return redirect()->intended($user->defaultAdminHomeRoute());
    }

    private function pendingUser(Request $request): ?User
    {
        $id = $request->session()->get('admin.two_factor_login.id');
        $passwordHash = $request->session()->get('admin.two_factor_login.password_hash');
        $startedAt = (int) $request->session()->get('admin.two_factor_login.started_at', 0);
        $user = $id ? User::find($id) : null;

        if (! $user instanceof User ||
            ! $user->canOperateAdmin() ||
            ! $user->hasEnabledTwoFactorAuthentication() ||
            ! is_string($passwordHash) ||
            ! hash_equals($user->getAuthPassword(), $passwordHash) ||
            $startedAt < now()->subMinutes(5)->timestamp) {
            $request->session()->forget([
                'admin.two_factor_login.id',
                'admin.two_factor_login.password_hash',
                'admin.two_factor_login.started_at',
            ]);

            return null;
        }

        return $user;
    }

    private function verifyRecoveryCode(User $user, string $submittedCode): void
    {
        $submittedCode = trim($submittedCode);
        $matchedCode = collect($user->recoveryCodes())
            ->first(fn (string $code) => hash_equals($code, $submittedCode));

        if (! $matchedCode) {
            throw ValidationException::withMessages([
                'recovery_code' => 'That recovery code is not valid or has already been used.',
            ]);
        }

        $user->replaceRecoveryCode($matchedCode);
    }
}
