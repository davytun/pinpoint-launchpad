<?php

use App\Models\User;
use Laravel\Fortify\Actions\EnableTwoFactorAuthentication;
use Laravel\Fortify\Fortify;
use PragmaRX\Google2FA\Google2FA;

function configuredOperationsUser(string $role = 'compliance'): User
{
    $user = User::factory()->create(['role' => $role]);
    app(EnableTwoFactorAuthentication::class)($user);
    $user->forceFill(['two_factor_confirmed_at' => now()])->save();

    return $user->fresh();
}

test('configured operations staff are challenged after entering their password', function () {
    $staff = configuredOperationsUser();

    $this->post(route('admin.login.store'), [
        'email' => $staff->email,
        'password' => 'password',
    ])->assertRedirect(route('admin.two-factor.challenge'));

    $this->assertGuest('web');
});

test('a valid authenticator code completes the pending admin login', function () {
    $staff = configuredOperationsUser();
    $this->post(route('admin.login.store'), [
        'email' => $staff->email,
        'password' => 'password',
    ]);

    $secret = Fortify::currentEncrypter()->decrypt($staff->two_factor_secret);
    $code = app(Google2FA::class)->getCurrentOtp($secret);

    $this->post(route('admin.two-factor.challenge.store'), ['code' => $code])
        ->assertRedirect(route('admin.investors.dashboard'));

    $this->assertAuthenticatedAs($staff, 'web');
    expect(session('admin.two_factor_verified_user'))->toBe($staff->getKey());
});

test('a recovery code completes login and cannot be reused', function () {
    $staff = configuredOperationsUser();
    $recoveryCode = $staff->recoveryCodes()[0];

    $this->post(route('admin.login.store'), [
        'email' => $staff->email,
        'password' => 'password',
    ]);

    $this->post(route('admin.two-factor.challenge.store'), ['recovery_code' => $recoveryCode])
        ->assertRedirect(route('admin.investors.dashboard'));

    expect($staff->fresh()->recoveryCodes())->not->toContain($recoveryCode);
});

test('a configured admin session without two factor verification is signed out', function () {
    $staff = configuredOperationsUser('analyst');

    $this->actingAs($staff)
        ->get(route('admin.founder.dashboard'))
        ->assertRedirect(route('admin.login'));

    $this->assertGuest('web');
});

test('admin two factor enforcement can be paused without deleting setup', function () {
    config()->set('auth.admin_two_factor_enabled', false);
    $staff = configuredOperationsUser();

    $this->post(route('admin.login.store'), [
        'email' => $staff->email,
        'password' => 'password',
    ])->assertRedirect(route('admin.investors.dashboard'));

    $this->assertAuthenticatedAs($staff, 'web');
    expect($staff->fresh()->hasEnabledTwoFactorAuthentication())->toBeTrue();
});
