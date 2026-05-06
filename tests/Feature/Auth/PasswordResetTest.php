<?php

use App\Models\Founder;

test('founder forgot-password screen can be rendered', function () {
    $this->get('/founder/forgot-password')->assertStatus(200);
});

test('founder reset-password link can be requested', function () {
    Founder::factory()->create(['email' => 'test@example.com']);

    $response = $this->post('/founder/forgot-password', [
        'email' => 'test@example.com',
    ]);

    $response->assertSessionHas('success');
});
