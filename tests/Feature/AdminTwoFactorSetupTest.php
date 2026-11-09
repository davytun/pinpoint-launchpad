<?php

use App\Models\User;
use Laravel\Fortify\Actions\EnableTwoFactorAuthentication;
use Laravel\Fortify\Fortify;
use PragmaRX\Google2FA\Google2FA;

test('operations staff cannot enter an admin desk before configuring two factor authentication', function () {
    $analyst = User::factory()->create(['role' => 'analyst']);

    $this->actingAs($analyst)
        ->get(route('admin.founder.dashboard'))
        ->assertRedirect(route('admin.two-factor.setup'));
});

test('operations staff can view the two factor setup screen', function () {
    $staff = User::factory()->create(['role' => 'compliance']);

    $this->actingAs($staff)
        ->get(route('admin.two-factor.setup'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/TwoFactor/Setup')
            ->has('qrCode')
            ->where('email', $staff->email));
});

test('a valid authenticator code confirms setup and reveals recovery codes once', function () {
    $staff = User::factory()->create(['role' => 'compliance']);
    app(EnableTwoFactorAuthentication::class)($staff);
    $staff->refresh();

    $secret = Fortify::currentEncrypter()->decrypt($staff->two_factor_secret);
    $code = app(Google2FA::class)->getCurrentOtp($secret);

    $this->actingAs($staff)
        ->post(route('admin.two-factor.confirm'), ['code' => $code])
        ->assertRedirect(route('admin.two-factor.recovery-codes'));

    expect($staff->fresh()->two_factor_confirmed_at)->not->toBeNull();

    $this->get(route('admin.two-factor.recovery-codes'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/TwoFactor/RecoveryCodes')
            ->has('recoveryCodes', 8));

    $this->get(route('admin.two-factor.recovery-codes'))
        ->assertRedirect(route('admin.investors.dashboard'));
});

test('an invalid authenticator code shows a field error and does not confirm setup', function () {
    $staff = User::factory()->create(['role' => 'compliance']);
    app(EnableTwoFactorAuthentication::class)($staff);
    $staff->refresh();

    $secret = Fortify::currentEncrypter()->decrypt($staff->two_factor_secret);
    $validCode = app(Google2FA::class)->getCurrentOtp($secret);
    $invalidCode = ($validCode[0] === '9' ? '8' : '9').substr($validCode, 1);

    $this->actingAs($staff)
        ->from(route('admin.two-factor.setup'))
        ->post(route('admin.two-factor.confirm'), ['code' => $invalidCode])
        ->assertRedirect(route('admin.two-factor.setup'))
        ->assertSessionHasErrors('code');

    expect($staff->fresh()->two_factor_confirmed_at)->toBeNull()
        ->and(session('admin.two_factor_verified_user'))->toBeNull();
});
