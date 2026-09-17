<?php

use App\Models\User;

test('superadmin can access platform founder and investor admin sides', function () {
    $superadmin = User::factory()->create(['role' => 'superadmin']);

    $this->actingAs($superadmin)->get(route('admin.dashboard'))->assertOk();
    $this->actingAs($superadmin)->get(route('admin.founder.dashboard'))->assertOk();
    $this->actingAs($superadmin)->get(route('admin.investors.dashboard'))->assertOk();
    $this->actingAs($superadmin)->get(route('admin.founders.index'))->assertOk();
    $this->actingAs($superadmin)->get(route('admin.investor-accounts.index'))->assertOk();
    $this->actingAs($superadmin)->get(route('admin.users.index'))->assertOk();
    $this->actingAs($superadmin)->get(route('admin.pia-requests.index'))->assertOk();
});

test('analyst can only access founder admin side', function () {
    $analyst = User::factory()->create(['role' => 'analyst']);

    $this->actingAs($analyst)->get(route('admin.founder.dashboard'))->assertOk();
    $this->actingAs($analyst)->get(route('admin.founders.index'))->assertOk();
    $this->actingAs($analyst)->get(route('admin.messages.inbox'))->assertOk();

    $this->actingAs($analyst)
        ->get(route('admin.dashboard'))
        ->assertRedirect(route('admin.founder.dashboard'));

    // Wrong desk: admin.side redirects operable staff to their home.
    $this->actingAs($analyst)
        ->get(route('admin.investor-accounts.index'))
        ->assertRedirect(route('admin.founder.dashboard'));

    $this->actingAs($analyst)
        ->get(route('admin.dealflow.interests.index'))
        ->assertRedirect(route('admin.founder.dashboard'));
});

test('compliance can only access investor admin side', function () {
    $compliance = User::factory()->create(['role' => 'compliance']);

    $this->actingAs($compliance)->get(route('admin.investors.dashboard'))->assertOk();
    $this->actingAs($compliance)->get(route('admin.investor-accounts.index'))->assertOk();

    $this->actingAs($compliance)
        ->get(route('admin.dashboard'))
        ->assertRedirect(route('admin.investors.dashboard'));

    $this->actingAs($compliance)
        ->get(route('admin.founders.index'))
        ->assertRedirect(route('admin.investors.dashboard'));

    $this->actingAs($compliance)
        ->get(route('admin.messages.inbox'))
        ->assertRedirect(route('admin.investors.dashboard'));
});

test('investor relations can access investor desk but not founder desk or platform', function () {
    $ir = User::factory()->create(['role' => 'investor_relations']);

    $this->actingAs($ir)->get(route('admin.investors.dashboard'))->assertOk();
    $this->actingAs($ir)->get(route('admin.investor-accounts.index'))->assertOk();
    $this->actingAs($ir)->get(route('admin.dealflow.interests.index'))->assertOk();
    $this->actingAs($ir)->get(route('admin.spotlight.index'))->assertOk();

    $this->actingAs($ir)
        ->get(route('admin.dashboard'))
        ->assertRedirect(route('admin.investors.dashboard'));

    $this->actingAs($ir)
        ->get(route('admin.founders.index'))
        ->assertRedirect(route('admin.investors.dashboard'));

    // Platform team page still role-gates with 403 (require.role before side).
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
        ->toBe(route('admin.founder.dashboard', absolute: false));

    expect(User::factory()->create(['role' => 'compliance'])->defaultAdminHomeRoute())
        ->toBe(route('admin.investors.dashboard', absolute: false));

    expect(User::factory()->create(['role' => 'investor_relations'])->defaultAdminHomeRoute())
        ->toBe(route('admin.investors.dashboard', absolute: false));
});
