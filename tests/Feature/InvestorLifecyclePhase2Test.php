<?php

use App\Models\AuditLog;
use App\Models\Founder;
use App\Models\FounderDocument;
use App\Models\FounderProfile;
use App\Models\Investor;
use App\Models\InvestorDataRoomGrant;
use App\Models\InvestorInterest;
use App\Models\SpotlightEntry;
use App\Models\User;
use App\Models\VerificationBadge;
use App\Notifications\DealflowAdminNotification;
use App\Notifications\InvestorDataRoomRevokedNotification;
use App\Notifications\InvestorInterestDecisionNotification;
use App\Notifications\InvestorInterestReceivedNotification;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;

function setupLiveSpotlightStartup(): array
{
    $founder = Founder::factory()->create(['company_name' => 'NovaPay Global']);
    $profile = FounderProfile::create([
        'founder_id' => $founder->id,
        'slug' => "novapay-{$founder->id}",
        'is_public' => true,
        'verified_at' => now()->subDay(),
        'overall_score' => 88,
        'sector' => 'Fintech',
        'batch' => 'Cohort 2026',
        'spotlight_one_liner' => 'Cross-border liquidity engine for emerging markets.',
        'spotlight_summary' => 'NovaPay processes enterprise treasury operations across 8 corridors.',
        'is_featured_in_spotlight' => true,
    ]);

    VerificationBadge::create([
        'profile_id' => $profile->id,
        'badge_type' => 'financial',
        'label' => 'Financials Audited',
        'is_verified' => true,
        'verified_at' => now()->subDay(),
    ]);

    SpotlightEntry::create([
        'profile_id' => $profile->id,
        'published_at' => now(),
    ]);

    Storage::disk('local')->put("founder-documents/{$founder->id}/pitch_deck.pdf", 'NovaPay Pitch Deck');
    $pitchDeck = FounderDocument::create([
        'founder_id' => $founder->id,
        'category' => 'pitch_deck',
        'visibility' => 'spotlight',
        'original_filename' => 'NovaPay_Deck.pdf',
        'stored_filename' => 'pitch_deck.pdf',
        'file_path' => "founder-documents/{$founder->id}/pitch_deck.pdf",
        'file_size' => 100,
        'mime_type' => 'application/pdf',
        'extension' => 'pdf',
        'is_reviewed' => true,
    ]);

    Storage::disk('local')->put("founder-documents/{$founder->id}/financial_model.xlsx", 'Financial Model Data');
    $vdrDoc = FounderDocument::create([
        'founder_id' => $founder->id,
        'category' => 'financial_forecast',
        'visibility' => 'data_room',
        'original_filename' => 'NovaPay_Financial_Model.xlsx',
        'stored_filename' => 'financial_model.xlsx',
        'file_path' => "founder-documents/{$founder->id}/financial_model.xlsx",
        'file_size' => 200,
        'mime_type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'extension' => 'xlsx',
        'is_reviewed' => true,
    ]);

    return [$founder, $profile, $pitchDeck, $vdrDoc];
}

test('spotlight discovery is gated to KYC-approved investors only', function () {
    Storage::fake('local');
    [$founder, $profile, $pitchDeck] = setupLiveSpotlightStartup();

    $unapprovedInvestor = Investor::factory()->create(['kyc_status' => Investor::KYC_STATUS_PENDING]);
    $approvedInvestor = Investor::factory()->create(['kyc_status' => Investor::KYC_STATUS_APPROVED]);

    // 1. Unapproved investor is redirected to KYC page
    $this->actingAs($unapprovedInvestor, 'investor')->get(route('investor.spotlight.index'))->assertRedirect(route('investor.kyc.create'));
    $this->actingAs($unapprovedInvestor, 'investor')->get(route('investor.spotlight.show', $profile->slug))->assertRedirect(route('investor.kyc.create'));

    // 2. Approved investor can view Spotlight and preview/download pitch deck
    $this->actingAs($approvedInvestor, 'investor')->get(route('investor.spotlight.index'))->assertOk();
    $this->actingAs($approvedInvestor, 'investor')->get(route('investor.spotlight.show', $profile->slug))->assertOk();

    $previewUrl = URL::temporarySignedRoute('investor.spotlight.pitch-deck.preview', now()->addMinutes(10), ['slug' => $profile->slug]);
    $this->actingAs($approvedInvestor, 'investor')->get($previewUrl)->assertOk()->assertStreamedContent('NovaPay Pitch Deck');

    $downloadUrl = URL::temporarySignedRoute('investor.spotlight.pitch-deck', now()->addMinutes(10), ['slug' => $profile->slug]);
    $this->actingAs($approvedInvestor, 'investor')->get($downloadUrl)->assertOk()->assertStreamedContent('NovaPay Pitch Deck');
});

test('investor submits data room access interest which notifies founder and dealflow staff', function () {
    Notification::fake();
    [$founder, $profile] = setupLiveSpotlightStartup();

    $investor = Investor::factory()->create(['kyc_status' => Investor::KYC_STATUS_APPROVED]);
    $irStaff = User::factory()->create(['role' => 'investor_relations']);
    $superadmin = User::factory()->create(['role' => 'superadmin']);

    $response = $this->actingAs($investor, 'investor')
        ->post(route('investor.interests.store', $profile->slug), [
            'type' => 'data_room_access',
            'message' => 'Interested in leading the seed round, please share full VDR access.',
        ]);

    $response->assertSessionHas('success');

    $interest = InvestorInterest::where('investor_id', $investor->id)->where('profile_id', $profile->id)->first();
    expect($interest)->not->toBeNull()
        ->and($interest->type)->toBe('data_room_access')
        ->and($interest->status)->toBe('pending')
        ->and($interest->message)->toBe('Interested in leading the seed round, please share full VDR access.');

    // Founder receives notification
    Notification::assertSentTo($founder, InvestorInterestReceivedNotification::class);

    // Dealflow staff receive notification
    Notification::assertSentTo($irStaff, DealflowAdminNotification::class);
    Notification::assertSentTo($superadmin, DealflowAdminNotification::class);

    $this->assertDatabaseHas('audit_logs', [
        'event' => 'investor.interest_submitted',
        'actor_type' => Investor::class,
        'actor_id' => $investor->id,
        'auditable_type' => InvestorInterest::class,
        'auditable_id' => $interest->id,
    ]);
});

test('founder approves data room interest, creating grant and unlocking investor data room access', function () {
    Notification::fake();
    Storage::fake('local');
    [$founder, $profile, $pitchDeck, $vdrDoc] = setupLiveSpotlightStartup();

    $investor = Investor::factory()->create(['kyc_status' => Investor::KYC_STATUS_APPROVED]);
    $admin = User::factory()->create(['role' => 'investor_relations']);
    $interest = InvestorInterest::create([
        'investor_id' => $investor->id,
        'profile_id' => $profile->id,
        'type' => 'data_room_access',
        'status' => 'pending',
    ]);

    // Founder authorizes interest to Pinpoint
    $response = $this->actingAs($founder, 'founder')
        ->patch(route('founder.access-requests.status', $interest), [
            'status' => 'approved',
        ]);

    $response->assertRedirect();
    $interest->refresh();

    expect($interest->founder_decision)->toBe('approved')
        ->and($interest->reviewed_by_founder)->toBe($founder->id)
        ->and($interest->reviewed_at)->not->toBeNull()
        ->and(InvestorDataRoomGrant::where('investor_id', $investor->id)->where('profile_id', $profile->id)->exists())->toBeFalse();

    // Admin reviews and activates data room grant
    $this->actingAs($admin)
        ->patch(route('admin.dealflow.interests.update', $interest), [
            'status' => 'approved',
        ]);

    // Grant is created
    $grant = InvestorDataRoomGrant::where('investor_id', $investor->id)->where('profile_id', $profile->id)->first();
    expect($grant)->not->toBeNull()
        ->and($grant->isActive())->toBeTrue()
        ->and($grant->granted_by_founder)->toBe($founder->id);

    // Investor receives decision notification
    Notification::assertSentTo($investor, InvestorInterestDecisionNotification::class, function ($n) {
        return $n->status === 'approved' && $n->dataRoomGranted === true;
    });

    // Investor visits /investor/data-rooms
    $indexResponse = $this->actingAs($investor, 'investor')->get(route('investor.data-rooms.index'));
    $indexResponse->assertOk()
        ->assertInertia(fn ($page) => $page->component('Investor/DataRooms/Index'));

    // Investor visits /investor/data-rooms/{slug}
    $showResponse = $this->actingAs($investor, 'investor')->get(route('investor.data-rooms.show', $profile->slug));
    $showResponse->assertOk()
        ->assertInertia(fn ($page) => $page->component('Investor/DataRooms/Show'));

    // Investor downloads VDR document using signed route
    $downloadUrl = URL::temporarySignedRoute('investor.data-rooms.download', now()->addMinutes(10), [
        'slug' => $profile->slug,
        'document' => $vdrDoc->id,
    ]);

    $this->actingAs($investor, 'investor')->get($downloadUrl)->assertOk()->assertStreamedContent('Financial Model Data');

    $this->assertDatabaseHas('audit_logs', [
        'event' => 'data_room.document_downloaded',
        'actor_type' => Investor::class,
        'actor_id' => $investor->id,
        'auditable_type' => FounderDocument::class,
        'auditable_id' => $vdrDoc->id,
    ]);
});

test('admin can override/review interest and revoke/reinstate data room access', function () {
    Notification::fake();
    Storage::fake('local');
    [$founder, $profile, $pitchDeck, $vdrDoc] = setupLiveSpotlightStartup();

    $investor = Investor::factory()->create(['kyc_status' => Investor::KYC_STATUS_APPROVED]);
    $admin = User::factory()->create(['role' => 'investor_relations']);

    $interest = InvestorInterest::create([
        'investor_id' => $investor->id,
        'profile_id' => $profile->id,
        'type' => 'data_room_access',
        'status' => 'pending',
    ]);

    // 1. Admin approves interest via dealflow management
    $this->actingAs($admin)
        ->patch(route('admin.dealflow.interests.update', $interest), [
            'status' => 'approved',
        ])
        ->assertSessionHas('success');

    $grant = InvestorDataRoomGrant::where('investor_id', $investor->id)->where('profile_id', $profile->id)->firstOrFail();
    expect($grant->isActive())->toBeTrue();

    // 2. Investor can download document
    $downloadUrl = URL::temporarySignedRoute('investor.data-rooms.download', now()->addMinutes(10), [
        'slug' => $profile->slug,
        'document' => $vdrDoc->id,
    ]);
    $this->actingAs($investor, 'investor')->get($downloadUrl)->assertOk();

    // 3. Admin revokes grant
    $this->actingAs($admin)
        ->patch(route('admin.dealflow.data-rooms.revoke', $grant))
        ->assertSessionHas('success');

    expect($grant->fresh()->isActive())->toBeFalse();
    Notification::assertSentTo($investor, InvestorDataRoomRevokedNotification::class);

    // 4. Investor attempt to download revoked document is 404
    $this->actingAs($investor, 'investor')->get($downloadUrl)->assertNotFound();

    // 5. Admin reinstates grant
    $this->actingAs($admin)
        ->patch(route('admin.dealflow.data-rooms.reinstate', $grant))
        ->assertSessionHas('success');

    expect($grant->fresh()->isActive())->toBeTrue();

    // 6. Investor can download document again
    $this->actingAs($investor, 'investor')->get($downloadUrl)->assertOk();
});

test('admin profile view displays unified investorInterests data without legacy dependencies', function () {
    [$founder, $profile] = setupLiveSpotlightStartup();
    $investor = Investor::factory()->create(['kyc_status' => Investor::KYC_STATUS_APPROVED]);
    $admin = User::factory()->create(['role' => 'superadmin']);

    $interest = InvestorInterest::create([
        'investor_id' => $investor->id,
        'profile_id' => $profile->id,
        'type' => 'founder_call',
        'message' => 'Would like to schedule a partner call.',
        'status' => 'pending',
    ]);

    // Admin profile show
    $response = $this->actingAs($admin)->get(route('admin.profiles.show', $profile));
    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Profiles/Show')
            ->has('access_requests', 1)
            ->where('access_requests.0.id', $interest->id)
            ->where('access_requests.0.type', 'founder_call')
            ->where('access_requests.0.message', 'Would like to schedule a partner call.'));

    // Admin profile access requests dedicated page
    $accessRequestsResponse = $this->actingAs($admin)->get(route('admin.profiles.access-requests', $profile));
    $accessRequestsResponse->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Profiles/AccessRequests')
            ->has('access_requests', 1)
            ->where('access_requests.0.id', $interest->id));
});
