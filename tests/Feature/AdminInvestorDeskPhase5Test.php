<?php

use App\Models\AuditLog;
use App\Models\Investor;
use App\Models\InvestorProfile;
use App\Models\User;

test('admin can update investor account status to rejected and reactivate', function () {
    $admin = User::factory()->create(['role' => 'investor_relations']);
    $investor = Investor::factory()->create([
        'account_status' => Investor::ACCOUNT_STATUS_ACTIVE,
        'kyc_status' => Investor::KYC_STATUS_APPROVED,
    ]);
    InvestorProfile::factory()->for($investor)->create();

    $this->actingAs($admin)
        ->patch(route('admin.investor-accounts.update', $investor), [
            'account_status' => Investor::ACCOUNT_STATUS_REJECTED,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    expect($investor->fresh()->account_status)->toBe(Investor::ACCOUNT_STATUS_REJECTED);

    $this->assertDatabaseHas('audit_logs', [
        'event' => 'investor.account_status_updated',
        'actor_type' => User::class,
        'actor_id' => $admin->id,
        'auditable_type' => Investor::class,
        'auditable_id' => $investor->id,
    ]);

    $this->actingAs($admin)
        ->patch(route('admin.investor-accounts.update', $investor), [
            'account_status' => Investor::ACCOUNT_STATUS_ACTIVE,
        ])
        ->assertSessionHas('success');

    expect($investor->fresh()->account_status)->toBe(Investor::ACCOUNT_STATUS_ACTIVE);

    expect(AuditLog::where('event', 'investor.account_status_updated')->count())->toBe(2);
});

test('compliance sees canReviewKyc on investor accounts index', function () {
    $compliance = User::factory()->create(['role' => 'compliance']);

    $this->actingAs($compliance)
        ->get(route('admin.investor-accounts.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/InvestorAccounts/Index')
            ->where('canReviewKyc', true));
});
