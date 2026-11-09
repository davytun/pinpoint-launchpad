<?php

use App\Models\User;

test('admin login screen can be rendered', function () {
    $this->get(route('admin.login'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Admin/Login'));
});

test('investor desk staff are sent to two factor setup after authentication', function () {
    $compliance = User::factory()->create(['role' => 'compliance']);

    $this->post(route('admin.login.store'), [
        'email' => $compliance->email,
        'password' => 'password',
    ])->assertRedirect(route('admin.two-factor.setup'));

    $this->assertAuthenticatedAs($compliance);
});

test('investor relations staff are sent to two factor setup after authentication', function () {
    $ir = User::factory()->create(['role' => 'investor_relations']);

    $this->post(route('admin.login.store'), [
        'email' => $ir->email,
        'password' => 'password',
    ])->assertRedirect(route('admin.two-factor.setup'));

    $this->assertAuthenticatedAs($ir);
});

test('admin login with invalid credentials returns an email error', function () {
    User::factory()->create([
        'email' => 'staff@example.com',
        'role' => 'compliance',
        'password' => 'password',
    ]);

    $this->from(route('admin.login'))
        ->post(route('admin.login.store'), [
            'email' => 'staff@example.com',
            'password' => 'wrong-password',
        ])
        ->assertRedirect(route('admin.login'))
        ->assertSessionHasErrors('email');

    $this->assertGuest();
});
