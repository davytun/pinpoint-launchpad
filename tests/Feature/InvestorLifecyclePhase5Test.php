<?php

use App\Models\AuditLog;
use App\Models\Founder;
use App\Models\FounderDocument;
use App\Models\FounderProfile;
use App\Models\Investor;
use App\Models\InvestorDataRoomGrant;
use App\Models\InvestorInterest;
use App\Models\InvestorKycSubmission;
use App\Models\SpotlightEntry;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;

function createTestStartupForPhase5(string $companyName, string $slug): array
{
    $founder = Founder::factory()->create(['company_name' => $companyName]);
    $profile = FounderProfile::create([
        'founder_id' => $founder->id,
        'slug' => $slug,
        'is_public' => true,
        'verified_at' => now(),
        'spotlight_one_liner' => "Revolutionary {$companyName} technology.",
        'spotlight_summary' => "Detailed overview of {$companyName}.",
        'radar_data' => ['potential' => 90, 'agility' => 85, 'risk' => 60, 'alignment' => 88, 'governance' => 80, 'operations' => 82, 'network' => 75],
    ]);

    SpotlightEntry::create(['profile_id' => $profile->id, 'published_at' => now()]);

    Storage::disk('local')->put("founder-documents/{$founder->id}/pitch-deck.pdf", "{$companyName} Pitch Deck");
    $pitchDeck = FounderDocument::create([
        'founder_id' => $founder->id,
        'category' => 'pitch_deck',
        'visibility' => 'spotlight',
        'original_filename' => 'Pitch_Deck.pdf',
        'stored_filename' => 'pitch-deck.pdf',
        'file_path' => "founder-documents/{$founder->id}/pitch-deck.pdf",
        'file_size' => 150,
        'mime_type' => 'application/pdf',
        'extension' => 'pdf',
        'is_reviewed' => true,
    ]);

    Storage::disk('local')->put("founder-documents/{$founder->id}/confidential_vdr.pdf", "{$companyName} Highly Confidential VDR");
    $vdrDoc = FounderDocument::create([
        'founder_id' => $founder->id,
        'category' => 'financial_forecast',
        'visibility' => 'data_room',
        'original_filename' => 'Confidential_VDR.pdf',
        'stored_filename' => 'confidential_vdr.pdf',
        'file_path' => "founder-documents/{$founder->id}/confidential_vdr.pdf",
        'file_size' => 350,
        'mime_type' => 'application/pdf',
        'extension' => 'pdf',
        'is_reviewed' => true,
    ]);

    return [$founder, $profile, $pitchDeck, $vdrDoc];
}

test('complete cross-portal investor lifecycle with strict KYC gating, startup isolation, and VDR grant revocation', function () {
    Storage::fake('local');

    $compliance = User::factory()->create(['role' => 'compliance']);
    $admin = User::factory()->create(['role' => 'superadmin']);

    [$founderA, $profileA, $pitchDeckA, $vdrDocA] = createTestStartupForPhase5('Alpha Corp', 'alpha-corp');
    [$founderB, $profileB, $pitchDeckB, $vdrDocB] = createTestStartupForPhase5('Beta Dynamics', 'beta-dynamics');

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 1: Registration (KYC = not_submitted)
    // ─────────────────────────────────────────────────────────────────────────
    $regResponse = $this->post(route('investor.onboarding.store'), [
        'full_name' => 'Alexander Vance',
        'email' => 'alexander.vance@venture.com',
        'password' => 'SecurePass123!@#',
        'password_confirmation' => 'SecurePass123!@#',
        'investor_type' => 'individual',
        'phone' => '+15550192834',
        'address' => '100 Montgomery St, San Francisco, CA',
        'terms_agreed' => true,
        'aml_confirmed' => true,
    ]);
    $regResponse->assertRedirect(route('investor.dashboard'));

    $investor = Investor::where('email', 'alexander.vance@venture.com')->firstOrFail();
    expect($investor->kyc_status)->toBe(Investor::KYC_STATUS_NOT_SUBMITTED)
        ->and($investor->hasApprovedKyc())->toBeFalse();

    // Spotlight is blocked for not_submitted investor
    $this->actingAs($investor, 'investor')->get(route('investor.spotlight.index'))->assertRedirect(route('investor.kyc.create'));
    $this->actingAs($investor, 'investor')->get(route('investor.spotlight.show', $profileA->slug))->assertRedirect(route('investor.kyc.create'));

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 2: Initial KYC Submission (KYC = pending)
    // ─────────────────────────────────────────────────────────────────────────
    $kycFile1 = UploadedFile::fake()->create('passport_scan.pdf', 200, 'application/pdf');
    $this->actingAs($investor, 'investor')->post(route('investor.kyc.store'), [
        'document' => $kycFile1,
    ])->assertRedirect();

    expect($investor->fresh()->kyc_status)->toBe(Investor::KYC_STATUS_PENDING);

    // Spotlight remains blocked for pending investor
    $this->actingAs($investor, 'investor')->get(route('investor.spotlight.index'))->assertRedirect(route('investor.kyc.create'));
    $this->actingAs($investor, 'investor')->get(route('investor.spotlight.show', $profileA->slug))->assertRedirect(route('investor.kyc.create'));

    // Duplicate submission while pending is rejected
    $this->actingAs($investor, 'investor')->post(route('investor.kyc.store'), [
        'document' => UploadedFile::fake()->create('another.pdf', 100, 'application/pdf'),
    ])->assertSessionHasErrors('document');

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 3: Compliance Rejection with Note (KYC = rejected)
    // ─────────────────────────────────────────────────────────────────────────
    $submission1 = $investor->kycSubmissions()->firstOrFail();
    $this->actingAs($compliance)->patch(route('admin.investor-kyc.review', $submission1), [
        'status' => 'rejected',
        'review_notes' => 'Passport scan is blurry and corners are cropped.',
    ])->assertRedirect();

    expect($investor->fresh()->kyc_status)->toBe(Investor::KYC_STATUS_REJECTED)
        ->and($submission1->fresh()->status)->toBe(InvestorKycSubmission::STATUS_REJECTED)
        ->and($submission1->fresh()->review_notes)->toBe('Passport scan is blurry and corners are cropped.');

    // Spotlight remains blocked for rejected investor
    $this->actingAs($investor, 'investor')->get(route('investor.spotlight.index'))->assertRedirect(route('investor.kyc.create'));

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 4: Investor Resubmission (KYC = pending)
    // ─────────────────────────────────────────────────────────────────────────
    $kycFile2 = UploadedFile::fake()->create('passport_hd_scan.pdf', 400, 'application/pdf');
    $this->actingAs($investor->fresh(), 'investor')->post(route('investor.kyc.store'), [
        'document' => $kycFile2,
    ])->assertRedirect();

    expect($investor->fresh()->kyc_status)->toBe(Investor::KYC_STATUS_PENDING)
        ->and($investor->kycSubmissions()->count())->toBe(2);

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 5: Compliance Approval (KYC = approved) -> Spotlight UNLOCKED!
    // ─────────────────────────────────────────────────────────────────────────
    $submission2 = $investor->kycSubmissions()->where('status', InvestorKycSubmission::STATUS_PENDING)->firstOrFail();
    $this->actingAs($compliance)->patch(route('admin.investor-kyc.review', $submission2), [
        'status' => 'approved',
        'review_notes' => 'Document verified successfully.',
    ])->assertRedirect();

    expect($investor->fresh()->kyc_status)->toBe(Investor::KYC_STATUS_APPROVED)
        ->and($investor->fresh()->hasApprovedKyc())->toBeTrue();

    // Spotlight index and show are now accessible!
    $this->actingAs($investor->fresh(), 'investor')->get(route('investor.spotlight.index'))->assertOk();
    $this->actingAs($investor->fresh(), 'investor')->get(route('investor.spotlight.show', $profileA->slug))->assertOk();
    $this->actingAs($investor->fresh(), 'investor')->get(route('investor.spotlight.show', $profileB->slug))->assertOk();

    // Pitch deck preview and download work for approved investor
    $pitchUrlA = URL::temporarySignedRoute('investor.spotlight.pitch-deck.preview', now()->addMinutes(10), ['slug' => $profileA->slug]);
    $this->actingAs($investor->fresh(), 'investor')->get($pitchUrlA)->assertOk()->assertStreamedContent('Alpha Corp Pitch Deck');

    // Attempting to upload replacement KYC while approved is blocked
    $this->actingAs($investor->fresh(), 'investor')->post(route('investor.kyc.store'), [
        'document' => UploadedFile::fake()->create('unnecessary.pdf', 100, 'application/pdf'),
    ])->assertSessionHasErrors('document');
    expect($investor->fresh()->kyc_status)->toBe(Investor::KYC_STATUS_APPROVED);

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 6: Data Room is initially BLOCKED (no grant yet)
    // ─────────────────────────────────────────────────────────────────────────
    $this->actingAs($investor->fresh(), 'investor')->get(route('investor.data-rooms.show', $profileA->slug))->assertNotFound();
    $this->actingAs($investor->fresh(), 'investor')->get(route('investor.data-rooms.show', $profileB->slug))->assertNotFound();

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 7: Investor Submits Interest for Startup A
    // ─────────────────────────────────────────────────────────────────────────
    $this->actingAs($investor->fresh(), 'investor')->post(route('investor.interests.store', $profileA->slug), [
        'type' => 'data_room_access',
        'message' => 'Interested in conducting due diligence on Alpha Corp.',
    ])->assertRedirect();

    $interestA = InvestorInterest::where('investor_id', $investor->id)->where('profile_id', $profileA->id)->firstOrFail();
    expect($interestA->status)->toBe('pending')
        ->and(InvestorDataRoomGrant::where('investor_id', $investor->id)->exists())->toBeFalse();

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 8: Founder A Authorizes Interest -> Admin Approves -> Grants Data Room Access for Startup A
    // ─────────────────────────────────────────────────────────────────────────
    $this->actingAs($founderA, 'founder')->patch(route('founder.access-requests.status', $interestA), [
        'status' => 'approved',
    ])->assertRedirect();

    expect($interestA->fresh()->founder_decision)->toBe('approved')
        ->and(InvestorDataRoomGrant::where('investor_id', $investor->id)->where('profile_id', $profileA->id)->exists())->toBeFalse();

    $this->actingAs($admin)->patch(route('admin.dealflow.interests.update', $interestA), [
        'status' => 'approved',
    ])->assertRedirect();

    expect($interestA->fresh()->status)->toBe('approved');
    $grantA = InvestorDataRoomGrant::where('investor_id', $investor->id)->where('profile_id', $profileA->id)->firstOrFail();
    expect($grantA->isActive())->toBeTrue();

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 9: Verify Startup Isolation
    // ─────────────────────────────────────────────────────────────────────────
    // Startup A Data Room is accessible
    $vdrResponseA = $this->actingAs($investor->fresh(), 'investor')->get(route('investor.data-rooms.show', $profileA->slug));
    $vdrResponseA->assertOk()->assertInertia(fn ($page) => $page
        ->component('Investor/DataRooms/Show')
        ->where('slug', $profileA->slug)
        ->has('documents', 1));

    // Download document from Startup A
    $downloadUrlA = URL::temporarySignedRoute('investor.data-rooms.download', now()->addMinutes(10), [
        'slug' => $profileA->slug,
        'document' => $vdrDocA->id,
    ]);
    $this->actingAs($investor->fresh(), 'investor')->get($downloadUrlA)->assertOk()->assertStreamedContent('Alpha Corp Highly Confidential VDR');

    // Startup B Data Room remains strictly forbidden / 404 (No grant for Beta Dynamics)
    $this->actingAs($investor->fresh(), 'investor')->get(route('investor.data-rooms.show', $profileB->slug))->assertNotFound();

    // Cross-startup document tampering: requesting Startup B document using Startup A slug
    $tamperedUrl = URL::temporarySignedRoute('investor.data-rooms.download', now()->addMinutes(10), [
        'slug' => $profileA->slug,
        'document' => $vdrDocB->id,
    ]);
    $this->actingAs($investor->fresh(), 'investor')->get($tamperedUrl)->assertNotFound();

    // Cross-startup slug tampering: requesting Startup B document using Startup B slug (no grant)
    $tamperedUrlB = URL::temporarySignedRoute('investor.data-rooms.download', now()->addMinutes(10), [
        'slug' => $profileB->slug,
        'document' => $vdrDocB->id,
    ]);
    $this->actingAs($investor->fresh(), 'investor')->get($tamperedUrlB)->assertNotFound();

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 10: Admin Revocation & Reinstatement
    // ─────────────────────────────────────────────────────────────────────────
    // Revoke Startup A grant
    $this->actingAs($admin)->patch(route('admin.dealflow.data-rooms.revoke', $grantA))->assertRedirect();
    expect($grantA->fresh()->isActive())->toBeFalse()
        ->and($interestA->fresh()->status)->toBe('approved'); // Interest record stays approved

    // Access to Startup A Data Room is immediately blocked
    $this->actingAs($investor->fresh(), 'investor')->get(route('investor.data-rooms.show', $profileA->slug))->assertNotFound();
    $this->actingAs($investor->fresh(), 'investor')->get($downloadUrlA)->assertNotFound();

    // Reinstate Startup A grant
    $this->actingAs($admin)->patch(route('admin.dealflow.data-rooms.reinstate', $grantA))->assertRedirect();
    expect($grantA->fresh()->isActive())->toBeTrue();

    // Access to Startup A Data Room is immediately restored
    $this->actingAs($investor->fresh(), 'investor')->get(route('investor.data-rooms.show', $profileA->slug))->assertOk();
    $freshDownloadUrlA = URL::temporarySignedRoute('investor.data-rooms.download', now()->addMinutes(10), [
        'slug' => $profileA->slug,
        'document' => $vdrDocA->id,
    ]);
    $this->actingAs($investor->fresh(), 'investor')->get($freshDownloadUrlA)->assertOk()->assertStreamedContent('Alpha Corp Highly Confidential VDR');
});
