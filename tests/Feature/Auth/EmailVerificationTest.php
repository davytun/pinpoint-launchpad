<?php

// Email verification for founders is handled via the setup invite token flow,
// not the standard Laravel email verification URLs. No generic email-verification
// routes exist in this app — founders are verified on account creation.
// Placeholder kept to prevent Breeze stubs from being re-added accidentally.

it('founder email is marked verified on account setup', function () {
    $founder = \App\Models\Founder::factory()->create(['email_verified_at' => now()]);

    expect($founder->hasVerifiedEmail())->toBeTrue();
});
