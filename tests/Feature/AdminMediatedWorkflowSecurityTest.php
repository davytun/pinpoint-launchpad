<?php

use App\Models\Founder;
use App\Models\FounderDocument;
use App\Models\FounderProfile;
use App\Models\Investor;
use App\Models\InvestorDataRoomGrant;
use App\Models\InvestorInterest;
use App\Models\InvestorKycSubmission;
use App\Models\SpotlightEntry;
use App\Models\User;
use App\Notifications\DealflowAdminNotification;
use App\Notifications\InvestorInterestDecisionNotification;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;

function setupSecurityTestStartup(string $name, string $slug, ?string $email = null, ?string $phone = null): array
{
    $founder = Founder::factory()->create([
        'company_name' => $name,
        'email' => $email ?? fake()->unique()->safeEmail(),
        'phone' => $phone ?? '+1-555-0199',
    ]);

    $profile = FounderProfile::create([
        'founder_id' => $founder->id,
        'slug' => $slug,
        'is_public' => true,
        'verified_at' => now(),
        'sector' => 'Enterprise Software',
        'spotlight_one_liner' => "Next-gen {$name} platform.",
        'spotlight_summary' => "Detailed overview for {$name}.",
    ]);

    SpotlightEntry::create(['profile_id' => $profile->id, 'published_at' => now()]);

    return [$founder, $profile];
}

test('Security 1: Investor cannot directly message Founder', function () {
    [$founder, $profile] = setupSecurityTestStartup('SecureCorp1', 'securecorp-1');
    $investor = Investor::factory()->create(['kyc_status' => Investor::KYC_STATUS_APPROVED]);

    // Ensure no direct message routes exist from investor to founder
    $response = $this->actingAs($investor, 'investor')
        ->post('/founder/messages', [
            'body' => 'Direct message from investor to founder.',
        ]);

    expect($response->status())->toBeIn([302, 401, 403, 404]);
});

test('Security 2: Founder cannot directly message Investor', function () {
    [$founder, $profile] = setupSecurityTestStartup('SecureCorp2', 'securecorp-2');
    $investor = Investor::factory()->create(['kyc_status' => Investor::KYC_STATUS_APPROVED]);

    // Founder messages are strictly between Founder and Pinpoint Admin (MessageThread)
    $response = $this->actingAs($founder, 'founder')
        ->post(route('founder.messages.store'), [
            'body' => 'Message to admin team regarding diligence.',
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('messages', [
        'sender_type' => 'founder',
        'sender_id' => $founder->id,
    ]);
});

test('Security 3: Investor cannot obtain Founder private contact details (email, phone) in Spotlight or Interests payloads', function () {
    [$founder, $profile] = setupSecurityTestStartup('PrivateCorp', 'privatecorp', 'secret_founder@privatecorp.test', '+1-555-0987');
    $investor = Investor::factory()->create(['kyc_status' => Investor::KYC_STATUS_APPROVED]);

    $interest = InvestorInterest::create([
        'investor_id' => $investor->id,
        'profile_id' => $profile->id,
        'type' => 'founder_call',
        'status' => 'pending',
    ]);

    // Spotlight view
    $this->actingAs($investor, 'investor')
        ->get(route('investor.spotlight.show', $profile->slug))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Investor/Spotlight/Show')
            ->missing('entry.founder_email')
            ->missing('entry.founder_phone')
            ->where('entry.company_name', 'PrivateCorp')
        );

    // Interests view
    $this->actingAs($investor, 'investor')
        ->get(route('investor.interests.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Investor/Interests')
            ->where('interests.0.profile.founder.company_name', 'PrivateCorp')
            ->missing('interests.0.profile.founder.email')
            ->missing('interests.0.profile.founder.phone')
        );
});

test('Security 4: Founder cannot obtain confidential Investor/KYC information (documents, private phone/email)', function () {
    [$founder, $profile] = setupSecurityTestStartup('SecureCorp4', 'securecorp-4');
    $investor = Investor::factory()->create([
        'email' => 'private_investor@firm.test',
        'kyc_status' => Investor::KYC_STATUS_APPROVED,
    ]);
    $investor->profile()->create([
        'full_name' => 'John Diligence',
        'company_name' => 'Sequoia Capital Partners',
        'investor_type' => 'institutional_fund',
        'phone' => '+1-555-9999',
        'address' => '123 Wall Street, NY',
    ]);

    $interest = InvestorInterest::create([
        'investor_id' => $investor->id,
        'profile_id' => $profile->id,
        'type' => 'data_room_access',
        'status' => 'pending',
    ]);

    $this->actingAs($founder, 'founder')
        ->get(route('founder.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Founder/Dashboard')
            ->where('access_requests.0.investor_name', 'John Diligence')
            ->where('access_requests.0.firm_name', 'Sequoia Capital Partners')
            ->missing('access_requests.0.investor_email')
            ->missing('access_requests.0.investor_phone')
            ->missing('access_requests.0.investor_address')
        );
});

test('Security 5: Investor request is visible to Admin with correct counters and queues', function () {
    [$founder, $profile] = setupSecurityTestStartup('Apex Global 5', 'apex-global-5');
    $investor = Investor::factory()->create(['kyc_status' => Investor::KYC_STATUS_APPROVED]);
    $superadmin = User::factory()->create(['role' => 'superadmin']);

    $interest = InvestorInterest::create([
        'investor_id' => $investor->id,
        'profile_id' => $profile->id,
        'type' => 'data_room_access',
        'status' => 'pending',
    ]);

    $this->actingAs($superadmin)
        ->get(route('admin.dealflow.interests.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Dealflow/Interests')
            ->has('interests.data', 1)
            ->where('totals.data_room_requests', 1)
            ->where('totals.pending', 1)
        );
});

test('Security 6: Founder authorization is recorded and visible to Admin', function () {
    Notification::fake();
    [$founder, $profile] = setupSecurityTestStartup('Apex Global 6', 'apex-global-6');
    $investor = Investor::factory()->create(['kyc_status' => Investor::KYC_STATUS_APPROVED]);
    $irStaff = User::factory()->create(['role' => 'investor_relations']);

    $interest = InvestorInterest::create([
        'investor_id' => $investor->id,
        'profile_id' => $profile->id,
        'type' => 'data_room_access',
        'status' => 'pending',
    ]);

    // Founder authorizes Pinpoint to coordinate
    $this->actingAs($founder, 'founder')
        ->patch(route('founder.access-requests.status', $interest), ['status' => 'approved'])
        ->assertRedirect();

    $interest->refresh();
    expect($interest->founder_decision)->toBe('approved')
        ->and($interest->reviewed_by_founder)->toBe($founder->id)
        ->and($interest->isFounderAuthorized())->toBeTrue();

    // Staff sees founder authorization in admin workspace
    $this->actingAs($irStaff)
        ->get(route('admin.dealflow.interests.index', ['queue' => 'founder_authorized']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('interests.data', 1)
            ->where('interests.data.0.founder_decision', 'approved')
        );

    Notification::assertSentTo($irStaff, DealflowAdminNotification::class);
});

test('Security 7: Founder authorization alone does NOT create Data Room grant without Admin action', function () {
    [$founder, $profile] = setupSecurityTestStartup('Apex Global 7', 'apex-global-7');
    $investor = Investor::factory()->create(['kyc_status' => Investor::KYC_STATUS_APPROVED]);

    $interest = InvestorInterest::create([
        'investor_id' => $investor->id,
        'profile_id' => $profile->id,
        'type' => 'data_room_access',
        'status' => 'pending',
    ]);

    // Founder authorizes
    $this->actingAs($founder, 'founder')
        ->patch(route('founder.access-requests.status', $interest), ['status' => 'approved'])
        ->assertRedirect();

    // Verify NO data room grant was created
    expect(InvestorDataRoomGrant::where('investor_id', $investor->id)->where('profile_id', $profile->id)->exists())->toBeFalse();

    // Investor still cannot access data room (404/403)
    $response = $this->actingAs($investor, 'investor')
        ->get(route('investor.data-rooms.show', $profile->slug));

    expect($response->status())->toBeIn([403, 404]);
});

test('Security 8: Unauthorized Admin roles (analyst, compliance) cannot finalize dealflow decisions or grants', function () {
    [$founder, $profile] = setupSecurityTestStartup('Apex Global 8', 'apex-global-8');
    $investor = Investor::factory()->create(['kyc_status' => Investor::KYC_STATUS_APPROVED]);
    $analyst = User::factory()->create(['role' => 'analyst']);
    $compliance = User::factory()->create(['role' => 'compliance']);

    $interest = InvestorInterest::create([
        'investor_id' => $investor->id,
        'profile_id' => $profile->id,
        'type' => 'data_room_access',
        'status' => 'pending',
    ]);

    // Analyst attempt
    $this->actingAs($analyst)
        ->patch(route('admin.dealflow.interests.update', $interest), ['status' => 'approved'])
        ->assertForbidden();

    // Compliance attempt
    $this->actingAs($compliance)
        ->patch(route('admin.dealflow.interests.update', $interest), ['status' => 'approved'])
        ->assertForbidden();

    expect($interest->fresh()->status)->toBe('pending');
});

test('Security 9: IR/Superadmin can coordinate appropriate workflows and grant data room access', function () {
    Notification::fake();
    [$founder, $profile] = setupSecurityTestStartup('Apex Global 9', 'apex-global-9');
    $investor = Investor::factory()->create(['kyc_status' => Investor::KYC_STATUS_APPROVED]);
    $irStaff = User::factory()->create(['role' => 'investor_relations']);

    $interest = InvestorInterest::create([
        'investor_id' => $investor->id,
        'profile_id' => $profile->id,
        'type' => 'data_room_access',
        'status' => 'pending',
        'founder_decision' => 'approved',
    ]);

    // Admin approves and grants access
    $this->actingAs($irStaff)
        ->patch(route('admin.dealflow.interests.update', $interest), [
            'status' => 'approved',
            'notes' => 'Verified KYC and approved data room clearance.',
        ])
        ->assertRedirect();

    $interest->refresh();
    expect($interest->status)->toBe('approved');

    // Verify Data Room Grant is created
    $grant = InvestorDataRoomGrant::where('investor_id', $investor->id)->where('profile_id', $profile->id)->first();
    expect($grant)->not->toBeNull()
        ->and($grant->revoked_at)->toBeNull();

    // Investor is notified by Pinpoint
    Notification::assertSentTo($investor, InvestorInterestDecisionNotification::class);
});

test('Security 10: Data Room remains strictly startup-specific', function () {
    [$founderA, $profileA] = setupSecurityTestStartup('Startup Alpha', 'startup-alpha-10');
    [$founderB, $profileB] = setupSecurityTestStartup('Startup Beta', 'startup-beta-10');
    $investor = Investor::factory()->create(['kyc_status' => Investor::KYC_STATUS_APPROVED]);
    $admin = User::factory()->create(['role' => 'superadmin']);

    // Grant given ONLY to Startup Alpha
    $grant = InvestorDataRoomGrant::create([
        'investor_id' => $investor->id,
        'profile_id' => $profileA->id,
        'granted_by_founder' => $founderA->id,
        'granted_at' => now(),
    ]);

    // Investor can access Startup Alpha
    $this->actingAs($investor, 'investor')
        ->get(route('investor.data-rooms.show', $profileA->slug))
        ->assertOk();

    // Investor is blocked from Startup Beta (404/403)
    $response = $this->actingAs($investor, 'investor')
        ->get(route('investor.data-rooms.show', $profileB->slug));

    expect($response->status())->toBeIn([403, 404]);
});

test('Security 11: Direct URL manipulation cannot bypass Admin-mediated workflow', function () {
    [$founder, $profile] = setupSecurityTestStartup('Secret Venture', 'secret-venture-11');
    $investor = Investor::factory()->create(['kyc_status' => Investor::KYC_STATUS_APPROVED]);

    $doc = FounderDocument::create([
        'founder_id' => $founder->id,
        'document_type' => 'financial_model',
        'visibility' => 'data_room',
        'file_path' => 'documents/secret-venture/model.pdf',
        'file_name' => 'model.pdf',
        'original_filename' => 'model.pdf',
        'mime_type' => 'application/pdf',
        'file_size_bytes' => 1024,
        'is_reviewed' => true,
    ]);

    // Without a valid signed URL and active grant, access is blocked
    $this->actingAs($investor, 'investor')
        ->get("/investor/data-rooms/{$profile->slug}/document/{$doc->id}")
        ->assertForbidden();
});

test('Security 12: Investor and Founder UI payloads exclude internal Admin notes', function () {
    [$founder, $profile] = setupSecurityTestStartup('Apex Tech 12', 'apex-tech-12');
    $investor = Investor::factory()->create(['kyc_status' => Investor::KYC_STATUS_APPROVED]);

    $interest = InvestorInterest::create([
        'investor_id' => $investor->id,
        'profile_id' => $profile->id,
        'type' => 'founder_call',
        'status' => 'approved',
        'admin_notes' => 'CONFIDENTIAL: Internal compliance review passed with risk flags.',
        'founder_notes' => 'Available on Tuesdays.',
    ]);

    // Founder Dashboard payload
    $this->actingAs($founder, 'founder')
        ->get(route('founder.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Founder/Dashboard')
            ->missing('access_requests.0.admin_notes')
        );

    // Investor Interests payload
    $this->actingAs($investor, 'investor')
        ->get(route('investor.interests.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Investor/Interests')
            ->missing('interests.0.admin_notes')
        );
});
