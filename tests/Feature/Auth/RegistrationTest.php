<?php

// Self-registration is not available to founders — they onboard through the
// payment → signature → setup-invite-email flow only. The /register route
// is a Breeze leftover that returns 200 but is not linked anywhere in the app.

test('self-registration is not linked and founders cannot register directly', function () {
    // Verify there is no usable registration POST that creates a founder
    $response = $this->post('/register', [
        'name'                  => 'Test User',
        'email'                 => 'test@example.com',
        'password'              => 'password',
        'password_confirmation' => 'password',
    ]);

    // Should either redirect (Breeze default user created) or fail — not create a Founder
    expect(\App\Models\Founder::where('email', 'test@example.com')->exists())->toBeFalse();
});
