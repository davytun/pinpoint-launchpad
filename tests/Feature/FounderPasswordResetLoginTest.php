<?php

use App\Models\Founder;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Notification;

test('founder can reset password and then log in with the new password', function () {
    Notification::fake();

    $founder = Founder::factory()->create([
        'email' => 'founder-reset@example.com',
        'password' => 'old-password',
    ]);

    $this->post(route('founder.password.email'), [
        'email' => $founder->email,
    ])->assertSessionHas('success');

    Notification::assertSentTo($founder, ResetPassword::class, function (ResetPassword $notification) use ($founder) {
        $this->post(route('founder.password.update'), [
            'token' => $notification->token,
            'email' => $founder->email,
            'password' => 'brand-new-password',
            'password_confirmation' => 'brand-new-password',
        ])->assertRedirect(route('founder.login'));

        $this->post(route('founder.login.store'), [
            'email' => $founder->email,
            'password' => 'brand-new-password',
        ])->assertRedirect(route('founder.dashboard'));

        return true;
    });
});
