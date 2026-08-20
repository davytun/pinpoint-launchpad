<?php

use App\Models\Investor;

test('only active investors with approved KYC can access protected investor content', function () {
    $notSubmitted = new Investor([
        'account_status' => Investor::ACCOUNT_STATUS_ACTIVE,
        'kyc_status' => Investor::KYC_STATUS_NOT_SUBMITTED,
    ]);
    $pending = new Investor([
        'account_status' => Investor::ACCOUNT_STATUS_ACTIVE,
        'kyc_status' => Investor::KYC_STATUS_PENDING,
    ]);
    $rejected = new Investor([
        'account_status' => Investor::ACCOUNT_STATUS_ACTIVE,
        'kyc_status' => Investor::KYC_STATUS_REJECTED,
    ]);
    $approved = new Investor([
        'account_status' => Investor::ACCOUNT_STATUS_ACTIVE,
        'kyc_status' => Investor::KYC_STATUS_APPROVED,
    ]);
    $inactiveApproved = new Investor([
        'account_status' => 'rejected',
        'kyc_status' => Investor::KYC_STATUS_APPROVED,
    ]);

    expect($notSubmitted->canAccessProtectedInvestorContent())->toBeFalse()
        ->and($pending->canAccessProtectedInvestorContent())->toBeFalse()
        ->and($rejected->canAccessProtectedInvestorContent())->toBeFalse()
        ->and($approved->canAccessProtectedInvestorContent())->toBeTrue()
        ->and($inactiveApproved->canAccessProtectedInvestorContent())->toBeFalse();
});
