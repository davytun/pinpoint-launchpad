<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Actions\ConfirmTwoFactorAuthentication;
use Laravel\Fortify\Actions\EnableTwoFactorAuthentication;

class AdminTwoFactorSetupController extends Controller
{
    public function show(Request $request): Response|RedirectResponse
    {
        $user = $this->adminUser($request);

        if ($user->hasEnabledTwoFactorAuthentication()) {
            return redirect()->to($user->defaultAdminHomeRoute());
        }

        app(EnableTwoFactorAuthentication::class)($user);
        $user->refresh();

        return Inertia::render('Admin/TwoFactor/Setup', [
            'qrCode' => 'data:image/svg+xml;base64,'.base64_encode($user->twoFactorQrCodeSvg()),
            'email' => $user->email,
        ]);
    }

    public function confirm(Request $request): RedirectResponse
    {
        $user = $this->adminUser($request);
        $validated = $request->validate([
            'code' => ['required', 'digits:6'],
        ]);

        app(ConfirmTwoFactorAuthentication::class)($user, $validated['code']);
        $request->session()->put('admin.two_factor_recovery_codes_visible', true);

        return redirect()->route('admin.two-factor.recovery-codes');
    }

    public function recoveryCodes(Request $request): Response|RedirectResponse
    {
        $user = $this->adminUser($request);

        if (! $user->hasEnabledTwoFactorAuthentication() ||
            ! $request->session()->pull('admin.two_factor_recovery_codes_visible', false)) {
            return redirect()->to($user->defaultAdminHomeRoute());
        }

        return Inertia::render('Admin/TwoFactor/RecoveryCodes', [
            'recoveryCodes' => $user->recoveryCodes(),
            'continueUrl' => $user->defaultAdminHomeRoute(),
        ]);
    }

    private function adminUser(Request $request): User
    {
        $user = $request->user('web');

        abort_unless($user instanceof User && $user->canOperateAdmin(), 403);

        return $user;
    }
}
