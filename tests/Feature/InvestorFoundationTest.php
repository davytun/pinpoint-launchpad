<?php

use App\Models\AuditLog;
use App\Models\Investor;
use App\Models\InvestorProfile;
use App\Models\User;

test('an investor has one profile and an independent account status', function () {
    $investor = Investor::factory()->active()->create();
    $profile = InvestorProfile::factory()->for($investor)->create([
        'investor_type' => 'corporate',
        'company_name' => 'Pinpoint Capital Ltd',
    ]);

    expect($investor->fresh()->isActive())->toBeTrue()
        ->and($investor->profile->is($profile))->toBeTrue()
        ->and($profile->investor_type)->toBe('corporate');
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
