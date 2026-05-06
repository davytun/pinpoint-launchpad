<?php

// Password confirmation middleware is not used in this app's founder auth flow.
// Founders use a token-gated setup route and standard session auth thereafter.
// Placeholder to prevent stale Breeze tests from being re-added.

it('placeholder — no confirm-password route in this app', function () {
    expect(true)->toBeTrue();
});
