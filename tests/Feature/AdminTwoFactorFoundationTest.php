<?php

use App\Models\User;
use Illuminate\Support\Facades\Schema;

test('users table includes the two factor authentication fields', function () {
    expect(Schema::hasColumns('users', [
        'two_factor_secret',
        'two_factor_recovery_codes',
        'two_factor_confirmed_at',
    ]))->toBeTrue();
});

test('two factor credentials are hidden from serialized users', function () {
    $user = User::factory()->create();

    $serialized = $user->toArray();

    expect($serialized)
        ->not->toHaveKey('two_factor_secret')
        ->not->toHaveKey('two_factor_recovery_codes');
});

test('new users do not have two factor authentication enabled', function () {
    $user = User::factory()->create();

    expect($user->hasEnabledTwoFactorAuthentication())->toBeFalse();
});
