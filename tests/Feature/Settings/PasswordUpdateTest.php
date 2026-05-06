<?php

// The /settings/password route does not exist in this app.
// Admin and founder account settings are managed via separate flows.

test('settings password route does not exist', function () {
    $this->put('/settings/password')->assertStatus(404);
});
