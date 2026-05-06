<?php

use App\Models\Founder;

test('founder login screen can be rendered', function () {
    $this->get('/founder/login')->assertStatus(200);
});

test('founders can authenticate using the login screen', function () {
    $founder = Founder::factory()->create();

    $response = $this->post('/founder/login', [
        'email'    => $founder->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticatedAs($founder, 'founder');
    $response->assertRedirect(route('founder.dashboard'));
});

test('founders cannot authenticate with invalid password', function () {
    $founder = Founder::factory()->create();

    $this->post('/founder/login', [
        'email'    => $founder->email,
        'password' => 'wrong-password',
    ]);

    $this->assertGuest('founder');
});

test('founders can logout and are redirected to login', function () {
    $founder = Founder::factory()->create();

    $response = $this->actingAs($founder, 'founder')
        ->withSession(['founder_last_activity' => now()->timestamp])
        ->post('/founder/logout');

    $response->assertRedirect('/founder/login');
});
