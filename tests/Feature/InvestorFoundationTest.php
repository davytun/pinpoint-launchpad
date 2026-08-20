<?php

use App\Models\AuditLog;
use App\Models\Investor;
use App\Models\InvestorProfile;
use App\Models\User;

test('an investor has one profile, immediate account access, and a KYC state', function () {
    $investor = Investor::factory()->create();
    $profile = InvestorProfile::factory()->for($investor)->create([
        'investor_type' => 'corporate',
        'company_name' => 'Pinpoint Capital Ltd',
    ]);

    expect($investor->fresh()->isActive())->toBeTrue()
        ->and($investor->fresh()->needsKycSubmission())->toBeTrue()
        ->and($investor->fresh()->hasPendingKyc())->toBeFalse()
        ->and($investor->fresh()->hasApprovedKyc())->toBeFalse()
        ->and($investor->profile->is($profile))->toBeTrue()
        ->and($profile->investor_type)->toBe('corporate');
});

test('KYC state helpers describe pending, approved, and rejected investors', function () {
    $pendingInvestor = Investor::factory()->create(['kyc_status' => Investor::KYC_STATUS_PENDING]);
    $approvedInvestor = Investor::factory()->create(['kyc_status' => Investor::KYC_STATUS_APPROVED]);
    $rejectedInvestor = Investor::factory()->create(['kyc_status' => Investor::KYC_STATUS_REJECTED]);

    expect($pendingInvestor->hasPendingKyc())->toBeTrue()
        ->and($pendingInvestor->needsKycSubmission())->toBeFalse()
        ->and($approvedInvestor->hasApprovedKyc())->toBeTrue()
        ->and($approvedInvestor->needsKycSubmission())->toBeFalse()
        ->and($rejectedInvestor->needsKycSubmission())->toBeTrue();
});

test('audit logs can record an investor actor and auditable target', function () {
    $investor = Investor::factory()->create();
    $profile = InvestorProfile::factory()->for($investor)->create();

    $auditLog = AuditLog::factory()->create([
        'actor_type' => Investor::class,
        'actor_id' => $investor->id,
        'auditable_type' => InvestorProfile::class,
        'auditable_id' => $profile->id,
    ]);

    expect($auditLog->actor->is($investor))->toBeTrue()
        ->and($auditLog->auditable->is($profile))->toBeTrue();
});

test('the investor guard and password broker use the investor provider', function () {
    expect(config('auth.guards.investor.provider'))->toBe('investors')
        ->and(config('auth.providers.investors.model'))->toBe(Investor::class)
        ->and(config('auth.passwords.investors.provider'))->toBe('investors');
});

test('compliance and investor relations are recognized as staff roles', function () {
    $compliance = User::factory()->make(['role' => 'compliance']);
    $investorRelations = User::factory()->make(['role' => 'investor_relations']);

    expect($compliance->isCompliance())->toBeTrue()
        ->and($compliance->isAdmin())->toBeTrue()
        ->and($investorRelations->isInvestorRelations())->toBeTrue()
        ->and($investorRelations->isAdmin())->toBeTrue();
});
