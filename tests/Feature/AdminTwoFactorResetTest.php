<?php

use App\Models\AuditLog;
use App\Models\User;
use Laravel\Fortify\Actions\EnableTwoFactorAuthentication;

function configuredUserForReset(string $role): User
{
    $user = User::factory()->create(['role' => $role]);
    app(EnableTwoFactorAuthentication::class)($user);
    $user->forceFill(['two_factor_confirmed_at' => now()])->save();

    return $user->fresh();
}

test('a superadmin can reset another operations users two factor authentication', function () {
    $superadmin = configuredUserForReset('superadmin');
    $staff = configuredUserForReset('analyst');

    $this->actingAs($superadmin)
        ->withSession(['admin.two_factor_verified_user' => $superadmin->getKey()])
        ->delete(route('admin.users.two-factor.destroy', $staff))
        ->assertRedirect();

    $staff->refresh();

    expect($staff->two_factor_secret)->toBeNull()
        ->and($staff->two_factor_recovery_codes)->toBeNull()
        ->and($staff->two_factor_confirmed_at)->toBeNull();

    expect(AuditLog::query()
        ->where('event', 'admin.two_factor.reset')
        ->where('actor_id', (string) $superadmin->getKey())
        ->where('auditable_id', (string) $staff->getKey())
        ->exists())->toBeTrue();
});

test('a superadmin cannot reset their own two factor authentication', function () {
    $superadmin = configuredUserForReset('superadmin');

    $this->actingAs($superadmin)
        ->withSession(['admin.two_factor_verified_user' => $superadmin->getKey()])
        ->delete(route('admin.users.two-factor.destroy', $superadmin))
        ->assertSessionHasErrors('two_factor');

    expect($superadmin->fresh()->hasEnabledTwoFactorAuthentication())->toBeTrue();
});
