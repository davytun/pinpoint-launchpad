<?php

// The /settings/profile route does not exist in this app.
// Founder profiles are managed via /founder/profile routes.

test('generic settings profile route does not exist', function () {
    $this->get('/settings/profile')->assertStatus(404);
});
