<?php

use App\Models\Founder;

test('guests are redirected from the founder dashboard', function () {
    $this->get('/founder/dashboard')->assertRedirect('/founder/login');
});

test('authenticated founders can visit the dashboard', function () {
    $founder = Founder::factory()->create();

    $this->actingAs($founder, 'founder')
        ->get('/founder/dashboard')
        ->assertOk();
});
