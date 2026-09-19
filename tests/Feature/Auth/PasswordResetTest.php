<?php

use App\Models\Founder;
use App\Models\Investor;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Mail;

test('founder forgot-password screen can be rendered', function () {
    $this->get('/founder/forgot-password')->assertStatus(200);
});

test('founder reset-password link can be requested', function () {
    Mail::fake();
    Founder::factory()->create(['email' => 'test@example.com']);

    $response = $this->post('/founder/forgot-password', [
        'email' => 'test@example.com',
    ]);

    $response->assertSessionHas('success');
});

test('investor password reset notifications use the investor reset route', function () {
    $investor = Investor::factory()->create();
    $url = (new ResetPassword('test-token'))->toMail($investor)->actionUrl;

    expect($url)
        ->toStartWith(url('/investor/reset-password/test-token'))
        ->toContain('email='.urlencode($investor->email));
});

test('founder password reset notifications use the founder reset route', function () {
    $founder = Founder::factory()->create();
    $url = (new ResetPassword('test-token'))->toMail($founder)->actionUrl;

    expect($url)
        ->toStartWith(url('/founder/reset-password/test-token'))
        ->toContain('email='.urlencode($founder->email));
});
