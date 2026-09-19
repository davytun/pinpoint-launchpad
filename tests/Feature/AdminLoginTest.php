<?php

use App\Models\User;

test('admin login screen can be rendered', function () {
    $this->get(route('admin.login'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Admin/Login'));
});

test('investor desk staff can authenticate and land on investor dashboard', function () {
    $compliance = User::factory()->create(['role' => 'compliance']);

    $this->post(route('admin.login.store'), [
        'email' => $compliance->email,
        'password' => 'password',
    ])->assertRedirect(route('admin.investors.dashboard'));

    $this->assertAuthenticatedAs($compliance);
});

test('investor relations staff land on investor dashboard', function () {
    $ir = User::factory()->create(['role' => 'investor_relations']);

    $this->post(route('admin.login.store'), [
        'email' => $ir->email,
        'password' => 'password',
    ])->assertRedirect(route('admin.investors.dashboard'));

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
