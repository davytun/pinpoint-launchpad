<?php

use App\Models\Investor;
use App\Models\InvestorKycSubmission;
use App\Models\InvestorProfile;
use App\Models\User;

test('investor reviews are filtered by KYC status and include the latest submission', function () {
    $reviewer = User::factory()->create(['role' => 'investor_relations']);
    $pendingInvestor = Investor::factory()->create(['kyc_status' => Investor::KYC_STATUS_PENDING]);
    InvestorProfile::factory()->for($pendingInvestor)->create();
    InvestorKycSubmission::create([
        'investor_id' => $pendingInvestor->id,
        'document_type' => 'valid_id',
        'storage_path' => "investor-kyc/{$pendingInvestor->id}/identity.enc",
        'original_name' => 'identity.pdf',
        'mime_type' => 'application/pdf',
        'size_bytes' => 100,
        'status' => InvestorKycSubmission::STATUS_PENDING,
    ]);

    $approvedInvestor = Investor::factory()->create(['kyc_status' => Investor::KYC_STATUS_APPROVED]);
    InvestorProfile::factory()->for($approvedInvestor)->create();

    $response = $this->actingAs($reviewer)
        ->get(route('admin.investor-accounts.index', ['kyc_status' => Investor::KYC_STATUS_PENDING]));

    $response->assertOk();

    $page = $response->viewData('page');

    expect($page['component'])->toBe('Admin/InvestorAccounts/Index')
        ->and($page['props']['activeKycStatus'])->toBe(Investor::KYC_STATUS_PENDING)
        ->and($page['props']['investors']['data'][0]['id'])->toBe($pendingInvestor->id)
        ->and($page['props']['investors']['data'][0]['kyc_status'])->toBe(Investor::KYC_STATUS_PENDING)
        ->and($page['props']['investors']['data'][0]['latest_kyc_submission']['original_name'])->toBe('identity.pdf');

    $response = $this->actingAs($reviewer)->get(route('admin.investor-accounts.show', $pendingInvestor));

    $response->assertOk();

    $page = $response->viewData('page');

    expect($page['component'])->toBe('Admin/InvestorAccounts/Show')
        ->and($page['props']['investor']['id'])->toBe($pendingInvestor->id)
        ->and($page['props']['investor']['profile']['full_name'])->toBe($pendingInvestor->profile->full_name)
        ->and($page['props']['investor']['kyc_submissions'][0]['original_name'])->toBe('identity.pdf');
});

test('the legacy KYC queue redirects to pending investor reviews', function () {
    $compliance = User::factory()->create(['role' => 'compliance']);

    $this->actingAs($compliance)
        ->get(route('admin.investor-kyc.index'))
        ->assertRedirect(route('admin.investor-accounts.index', ['kyc_status' => Investor::KYC_STATUS_PENDING]));
});
