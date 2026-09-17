<?php

use App\Models\User;

test('superadmin can access platform founder and investor admin sides', function () {
    $superadmin = User::factory()->create(['role' => 'superadmin']);

    $this->actingAs($superadmin)->get(route('admin.dashboard'))->assertOk();
    $this->actingAs($superadmin)->get(route('admin.founders.index'))->assertOk();
    $this->actingAs($superadmin)->get(route('admin.investor-accounts.index'))->assertOk();
    $this->actingAs($superadmin)->get(route('admin.users.index'))->assertOk();
    $this->actingAs($superadmin)->get(route('admin.pia-requests.index'))->assertOk();
});

test('analyst can only access founder admin side', function () {
    $analyst = User::factory()->create(['role' => 'analyst']);

    $this->actingAs($analyst)->get(route('admin.founders.index'))->assertOk();
    $this->actingAs($analyst)->get(route('admin.messages.inbox'))->assertOk();

    // Shared dashboard is platform-only; specialists are redirected to their desk home.
    $this->actingAs($analyst)
        ->get(route('admin.dashboard'))
        ->assertRedirect(route('admin.founders.index'));

    // Investor-lane routes reject analyst via require.role.
    $this->actingAs($analyst)->get(route('admin.investor-accounts.index'))->assertForbidden();
    $this->actingAs($analyst)->get(route('admin.dealflow.interests.index'))->assertForbidden();
});

test('compliance can only access investor admin side', function () {
    $compliance = User::factory()->create(['role' => 'compliance']);

    $this->actingAs($compliance)->get(route('admin.investor-accounts.index'))->assertOk();

    $this->actingAs($compliance)
        ->get(route('admin.dashboard'))
        ->assertRedirect(route('admin.investor-accounts.index'));

    $this->actingAs($compliance)->get(route('admin.founders.index'))->assertForbidden();
    $this->actingAs($compliance)->get(route('admin.messages.inbox'))->assertForbidden();
});

test('investor relations can access investor desk but not founder desk or platform', function () {
    $ir = User::factory()->create(['role' => 'investor_relations']);

    $this->actingAs($ir)->get(route('admin.investor-accounts.index'))->assertOk();
    $this->actingAs($ir)->get(route('admin.dealflow.interests.index'))->assertOk();
    $this->actingAs($ir)->get(route('admin.spotlight.index'))->assertOk();

    $this->actingAs($ir)
        ->get(route('admin.dashboard'))
        ->assertRedirect(route('admin.investor-accounts.index'));

    $this->actingAs($ir)->get(route('admin.founders.index'))->assertForbidden();
    $this->actingAs($ir)->get(route('admin.users.index'))->assertForbidden();
});

test('support role cannot operate admin desks', function () {
    $support = User::factory()->create(['role' => 'support']);

    expect($support->canOperateAdmin())->toBeFalse()
        ->and($support->canAccessFounderAdmin())->toBeFalse()
        ->and($support->canAccessInvestorAdmin())->toBeFalse()
        ->and($support->canAccessPlatformAdmin())->toBeFalse();

    $this->actingAs($support)->get(route('admin.dashboard'))->assertForbidden();
    $this->actingAs($support)->get(route('admin.founders.index'))->assertForbidden();
    $this->actingAs($support)->get(route('admin.investor-accounts.index'))->assertForbidden();
    $this->actingAs($support)->get(route('admin.messages.inbox'))->assertForbidden();
});

test('default admin home route matches desk for each role', function () {
    expect(User::factory()->create(['role' => 'superadmin'])->defaultAdminHomeRoute())
        ->toBe(route('admin.dashboard', absolute: false));

    expect(User::factory()->create(['role' => 'analyst'])->defaultAdminHomeRoute())
        ->toBe(route('admin.founders.index', absolute: false));

    expect(User::factory()->create(['role' => 'compliance'])->defaultAdminHomeRoute())
        ->toBe(route('admin.investor-accounts.index', absolute: false));

    expect(User::factory()->create(['role' => 'investor_relations'])->defaultAdminHomeRoute())
        ->toBe(route('admin.investor-accounts.index', absolute: false));
});
