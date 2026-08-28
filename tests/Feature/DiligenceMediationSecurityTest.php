<?php

use App\Models\DiligenceRequest;
use App\Models\Founder;
use App\Models\FounderDocument;
use App\Models\FounderProfile;
use App\Models\Investor;
use App\Models\InvestorDataRoomGrant;
use App\Models\InvestorInterest;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Inertia\Testing\AssertableInertia as Assert;

function setupDiligenceSecurityContext(): array
{
    $founderA = Founder::factory()->create(['email' => 'founder.a@example.com', 'company_name' => 'Alpha Robotics']);
    $profileA = FounderProfile::create([
        'founder_id' => $founderA->id,
        'slug' => "alpha-robotics-{$founderA->id}",
        'is_public' => true,
        'sector' => 'Robotics',
    ]);

    $founderB = Founder::factory()->create(['email' => 'founder.b@example.com', 'company_name' => 'Beta Health']);
    $profileB = FounderProfile::create([
        'founder_id' => $founderB->id,
        'slug' => "beta-health-{$founderB->id}",
        'is_public' => true,
        'sector' => 'HealthTech',
    ]);

    $investorA = Investor::factory()->create(['email' => 'investor.a@capital.com', 'kyc_status' => Investor::KYC_STATUS_APPROVED]);
    $investorA->profile()->create(['full_name' => 'Alice Investor', 'company_name' => 'Alpha Ventures']);

    $investorB = Investor::factory()->create(['email' => 'investor.b@capital.com', 'kyc_status' => Investor::KYC_STATUS_APPROVED]);
    $investorB->profile()->create(['full_name' => 'Bob Investor', 'company_name' => 'Beta Ventures']);

    $superadmin = User::factory()->create(['role' => 'superadmin']);
    $irUser = User::factory()->create(['role' => 'investor_relations']);
    $analyst = User::factory()->create(['role' => 'analyst']);
    $compliance = User::factory()->create(['role' => 'compliance']);

    return [
        $founderA, $profileA,
        $founderB, $profileB,
        $investorA, $investorB,
        $superadmin, $irUser, $analyst, $compliance,
    ];
}

test('1. Unreviewed founder response and internal admin notes never leak to Investor payload', function () {
    [
        $founderA, $profileA,
        $founderB, $profileB,
        $investorA, $investorB,
        $superadmin, $irUser, $analyst, $compliance,
    ] = setupDiligenceSecurityContext();

    $diligence = DiligenceRequest::create([
        'investor_id' => $investorA->id,
        'profile_id' => $profileA->id,
        'category' => 'financial',
        'subject' => 'Burn Rate Breakdown',
        'request_details' => 'Please provide monthly burn details.',
        'status' => 'founder_responded',
        'founder_notes_to_admin' => 'CONFIDENTIAL_FOUNDER_INTERNAL_NOTE: We had unexpected legal costs in June.',
        'admin_notes' => 'INTERNAL_ADMIN_NOTE: Double-check audit log invoice item #449.',
        'admin_instructions_for_founder' => 'Please explain variance in June.',
    ]);

    $response = $this->actingAs($investorA, 'investor')
        ->get(route('investor.diligence.index'));

    $response->assertOk();

    $response->assertInertia(fn (Assert $page) => $page
        ->component('Investor/Diligence/Index')
        ->has('diligence_requests', 1)
        ->where('diligence_requests.0.id', $diligence->id)
        ->where('diligence_requests.0.subject', 'Burn Rate Breakdown')
        ->missing('diligence_requests.0.founder_notes_to_admin')
        ->missing('diligence_requests.0.admin_notes')
        ->missing('diligence_requests.0.admin_instructions_for_founder')
    );

    // Verify raw content is not exposed in HTML / json payload
    $content = $response->getContent();
    expect($content)->not->toContain('CONFIDENTIAL_FOUNDER_INTERNAL_NOTE')
        ->and($content)->not->toContain('INTERNAL_ADMIN_NOTE')
        ->and($content)->not->toContain('founder.a@example.com');
});

test('2. Admin notes never leak to Founder payload', function () {
    [
        $founderA, $profileA,
        $founderB, $profileB,
        $investorA, $investorB,
        $superadmin, $irUser, $analyst, $compliance,
    ] = setupDiligenceSecurityContext();

    $diligence = DiligenceRequest::create([
        'investor_id' => $investorA->id,
        'profile_id' => $profileA->id,
        'category' => 'financial',
        'subject' => 'Burn Rate Breakdown',
        'request_details' => 'Please provide monthly burn details.',
        'status' => 'waiting_for_founder',
        'admin_instructions_for_founder' => 'Please explain variance in June.',
        'admin_notes' => 'INTERNAL_SECRET_ADMIN_NOTE_123',
    ]);

    $response = $this->actingAs($founderA, 'founder')
        ->get(route('founder.diligence.index'));

    $response->assertOk();

    $response->assertInertia(fn (Assert $page) => $page
        ->component('Founder/Diligence/Index')
        ->has('diligence_requests', 1)
        ->where('diligence_requests.0.id', $diligence->id)
        ->missing('diligence_requests.0.admin_notes')
        ->missing('diligence_requests.0.investor')
    );

    $content = $response->getContent();
    expect($content)->not->toContain('INTERNAL_SECRET_ADMIN_NOTE_123')
        ->and($content)->not->toContain('investor.a@capital.com');
});

test('3. Investor cannot access another investor’s diligence request and Founder cannot respond to another startup request', function () {
    [
        $founderA, $profileA,
        $founderB, $profileB,
        $investorA, $investorB,
        $superadmin, $irUser, $analyst, $compliance,
    ] = setupDiligenceSecurityContext();

    $diligenceA = DiligenceRequest::create([
        'investor_id' => $investorA->id,
        'profile_id' => $profileA->id,
        'category' => 'financial',
        'subject' => 'Startup A Financials',
        'request_details' => 'Inquiry for startup A.',
        'status' => 'waiting_for_founder',
    ]);

    // Investor B should not see Investor A's diligence request on index
    $response = $this->actingAs($investorB, 'investor')
        ->get(route('investor.diligence.index'));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('Investor/Diligence/Index')
        ->has('diligence_requests', 0)
    );

    // Founder B cannot respond to Diligence request for Startup A
    $respondResponse = $this->actingAs($founderB, 'founder')
        ->patch(route('founder.diligence.respond', $diligenceA), [
            'founder_notes_to_admin' => 'Unauthorized attempt by Founder B.',
        ]);

    $respondResponse->assertForbidden();
    expect($diligenceA->fresh()->founder_notes_to_admin)->toBeNull();
});

test('4. Investor without approved KYC cannot submit diligence requests', function () {
    [
        $founderA, $profileA,
        $founderB, $profileB,
        $investorA, $investorB,
        $superadmin, $irUser, $analyst, $compliance,
    ] = setupDiligenceSecurityContext();

    $unapprovedInvestor = Investor::factory()->create(['kyc_status' => Investor::KYC_STATUS_PENDING]);

    $response = $this->actingAs($unapprovedInvestor, 'investor')
        ->post(route('investor.diligence.store', $profileA->slug), [
            'category' => 'financial',
            'subject' => 'Attempt without KYC',
            'request_details' => 'Should fail.',
        ]);

    $response->assertRedirect(route('investor.kyc.create'));
    expect(DiligenceRequest::query()->where('investor_id', $unapprovedInvestor->id)->exists())->toBeFalse();
});

test('5. Non-IR/Superadmin staff roles (Analyst/Compliance) cannot manage diligence orchestration', function () {
    [
        $founderA, $profileA,
        $founderB, $profileB,
        $investorA, $investorB,
        $superadmin, $irUser, $analyst, $compliance,
    ] = setupDiligenceSecurityContext();

    $diligence = DiligenceRequest::create([
        'investor_id' => $investorA->id,
        'profile_id' => $profileA->id,
        'category' => 'financial',
        'subject' => 'Financial query',
        'request_details' => 'Details.',
        'status' => 'submitted',
    ]);

    // Analyst blocked
    $this->actingAs($analyst)
        ->get(route('admin.dealflow.diligence.index'))
        ->assertForbidden();

    $this->actingAs($analyst)
        ->patch(route('admin.dealflow.diligence.release', $diligence), [
            'investor_visible_response' => 'Analyst response.',
            'mark_resolved' => true,
        ])
        ->assertForbidden();

    // Compliance blocked
    $this->actingAs($compliance)
        ->get(route('admin.dealflow.diligence.index'))
        ->assertForbidden();

    // IR user allowed
    $this->actingAs($irUser)
        ->get(route('admin.dealflow.diligence.index'))
        ->assertOk();

    // Superadmin allowed
    $this->actingAs($superadmin)
        ->get(route('admin.dealflow.diligence.index'))
        ->assertOk();
});

test('6. Confidential document requests still require active Data Room Grant', function () {
    Storage::fake('local');
    [
        $founderA, $profileA,
        $founderB, $profileB,
        $investorA, $investorB,
        $superadmin, $irUser, $analyst, $compliance,
    ] = setupDiligenceSecurityContext();

    Storage::disk('local')->put("founder-documents/{$founderA->id}/audit_report.pdf", 'Confidential Audit Data');
    $document = FounderDocument::create([
        'founder_id' => $founderA->id,
        'category' => 'other',
        'visibility' => 'data_room',
        'original_filename' => 'audit_report.pdf',
        'stored_filename' => 'audit_report.pdf',
        'file_path' => "founder-documents/{$founderA->id}/audit_report.pdf",
        'file_size' => 24,
        'mime_type' => 'application/pdf',
        'extension' => 'pdf',
        'is_reviewed' => true,
    ]);

    $url = URL::temporarySignedRoute('investor.data-rooms.download', now()->addMinutes(10), [
        'slug' => $profileA->slug,
        'document' => $document->id,
    ]);

    // Investor without grant cannot download confidential document
    $this->actingAs($investorA, 'investor')->get($url)->assertNotFound();

    // With active grant, download succeeds
    $grant = InvestorDataRoomGrant::create([
        'investor_id' => $investorA->id,
        'profile_id' => $profileA->id,
        'granted_by_founder' => $founderA->id,
        'granted_at' => now(),
    ]);

    $this->actingAs($investorA, 'investor')->get($url)->assertOk();
});
