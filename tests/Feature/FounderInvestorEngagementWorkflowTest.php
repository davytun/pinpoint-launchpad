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
use App\Notifications\DealflowAdminNotification;
use App\Notifications\IntroductionCompletedNotification;
use App\Notifications\IntroductionScheduledNotification;
use App\Notifications\InvestorInterestDecisionNotification;
use App\Notifications\InvestorInterestReceivedNotification;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

function setupPhase6Startup(string $name, string $slug): array
{
    $founder = Founder::factory()->create(['company_name' => $name]);
    $profile = FounderProfile::create([
        'founder_id' => $founder->id,
        'slug' => $slug,
        'is_public' => true,
        'verified_at' => now(),
        'sector' => 'Fintech',
        'spotlight_one_liner' => "Next-gen {$name} infrastructure.",
        'spotlight_summary' => "Full platform overview for {$name}.",
    ]);

    SpotlightEntry::create(['profile_id' => $profile->id, 'published_at' => now()]);

    return [$founder, $profile];
}

test('1. Approved Investor requests Founder introduction with correct type and notifications', function () {
    Notification::fake();
    [$founder, $profile] = setupPhase6Startup('Apex Tech', 'apex-tech');
    $investor = Investor::factory()->create(['kyc_status' => Investor::KYC_STATUS_APPROVED]);
    $irStaff = User::factory()->create(['role' => 'investor_relations']);

    $response = $this->actingAs($investor, 'investor')
        ->post(route('investor.interests.store', $profile->slug), [
            'type' => 'founder_call',
            'message' => 'We would love to discuss your Q3 traction on a call.',
        ]);

    $response->assertRedirect(route('investor.interests.index'));

    $this->assertDatabaseHas('investor_interests', [
        'investor_id' => $investor->id,
        'profile_id' => $profile->id,
        'type' => 'founder_call',
        'status' => 'pending',
        'message' => 'We would love to discuss your Q3 traction on a call.',
    ]);

    $this->assertDatabaseHas('audit_logs', [
        'event' => 'investor.interest_submitted',
        'actor_id' => $investor->id,
    ]);

    $this->assertDatabaseHas('audit_logs', [
        'event' => 'introduction.requested',
        'actor_id' => $investor->id,
    ]);

    Notification::assertSentTo($founder, InvestorInterestReceivedNotification::class);
    Notification::assertSentTo($irStaff, DealflowAdminNotification::class);
});

test('2. Non-KYC-approved Investor cannot request introduction', function () {
    [$founder, $profile] = setupPhase6Startup('Apex Tech', 'apex-tech');
    $unapprovedInvestor = Investor::factory()->create(['kyc_status' => Investor::KYC_STATUS_PENDING]);

    $response = $this->actingAs($unapprovedInvestor, 'investor')
        ->post(route('investor.interests.store', $profile->slug), [
            'type' => 'founder_call',
            'message' => 'Let us speak.',
        ]);

    $response->assertRedirect(route('investor.kyc.create'));
    expect(InvestorInterest::count())->toBe(0);
});

test('3. Founder sees introduction request for their startup in sanitized pipeline', function () {
    [$founder, $profile] = setupPhase6Startup('Apex Tech', 'apex-tech');
    $investor = Investor::factory()->create(['kyc_status' => Investor::KYC_STATUS_APPROVED]);
    $investor->profile()->create([
        'full_name' => 'Sarah Venture',
        'investor_type' => 'vc_fund',
        'company_name' => 'Benchmark Partners',
    ]);

    $interest = InvestorInterest::create([
        'investor_id' => $investor->id,
        'profile_id' => $profile->id,
        'type' => 'founder_call',
        'message' => 'Intro call request.',
        'status' => 'pending',
    ]);

    $response = $this->actingAs($founder, 'founder')
        ->get(route('founder.dashboard'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Founder/Dashboard')
        ->has('access_requests', 1)
        ->where('access_requests.0.investor_name', 'Sarah Venture')
        ->where('access_requests.0.firm_name', 'Benchmark Partners')
        ->where('access_requests.0.type', 'founder_call')
        ->where('access_requests.0.status', 'pending')
        ->where('access_requests.0.stage', 'new_interest')
        ->where('access_requests.0.introduction_status', 'requested')
        ->where('access_requests.0.data_room_granted', false)
    );
});

test('4. Different Founder cannot see another startup introduction request', function () {
    [$founderA, $profileA] = setupPhase6Startup('Apex Tech', 'apex-tech');
    [$founderB, $profileB] = setupPhase6Startup('Beta Dynamics', 'beta-dynamics');

    $investor = Investor::factory()->create(['kyc_status' => Investor::KYC_STATUS_APPROVED]);
    InvestorInterest::create([
        'investor_id' => $investor->id,
        'profile_id' => $profileA->id,
        'type' => 'founder_call',
        'status' => 'pending',
    ]);

    $response = $this->actingAs($founderB, 'founder')
        ->get(route('founder.dashboard'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Founder/Dashboard')
        ->has('access_requests', 0)
    );
});

test('5. Authorized Admin/IR sees request and can coordinate scheduling and completion', function () {
    Notification::fake();
    [$founder, $profile] = setupPhase6Startup('Apex Tech', 'apex-tech');
    $investor = Investor::factory()->create(['kyc_status' => Investor::KYC_STATUS_APPROVED]);
    $irStaff = User::factory()->create(['role' => 'investor_relations']);

    $interest = InvestorInterest::create([
        'investor_id' => $investor->id,
        'profile_id' => $profile->id,
        'type' => 'founder_call',
        'status' => 'pending',
    ]);

    // IR index view
    $this->actingAs($irStaff)
        ->get(route('admin.dealflow.interests.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Dealflow/Interests')
            ->has('interests.data', 1)
            ->where('totals.pending_introductions', 1)
        );

    // IR approves request
    $this->actingAs($irStaff)
        ->patch(route('admin.dealflow.interests.update', $interest), [
            'status' => 'approved',
        ])
        ->assertRedirect();

    expect($interest->fresh()->status)->toBe('approved');
    $this->assertDatabaseHas('audit_logs', [
        'event' => 'introduction.approved',
        'actor_id' => $irStaff->id,
    ]);

    // IR schedules call
    $scheduledTime = now()->addDays(3)->setHour(14)->setMinute(0)->setSecond(0);
    $this->actingAs($irStaff)
        ->patch(route('admin.dealflow.interests.schedule', $interest), [
            'scheduled_at' => $scheduledTime->toISOString(),
            'meeting_link' => 'https://meet.google.com/abc-defg-hij',
            'notes' => 'Founder and partner confirmed for 45 min deep dive.',
        ])
        ->assertRedirect();

    $interest->refresh();
    expect($interest->scheduled_at)->not->toBeNull()
        ->and($interest->meeting_link)->toBe('https://meet.google.com/abc-defg-hij')
        ->and($interest->admin_notes)->toBe('Founder and partner confirmed for 45 min deep dive.');

    $this->assertDatabaseHas('audit_logs', [
        'event' => 'introduction.scheduled',
        'actor_id' => $irStaff->id,
    ]);

    Notification::assertSentTo($investor, IntroductionScheduledNotification::class);
    Notification::assertSentTo($founder, IntroductionScheduledNotification::class);

    // IR marks call completed
    $this->actingAs($irStaff)
        ->patch(route('admin.dealflow.interests.complete', $interest), [
            'notes' => 'Call concluded with interest in follow-on DD.',
        ])
        ->assertRedirect();

    $interest->refresh();
    expect($interest->completed_at)->not->toBeNull();
    $this->assertDatabaseHas('audit_logs', [
        'event' => 'introduction.completed',
        'actor_id' => $irStaff->id,
    ]);

    Notification::assertSentTo($investor, IntroductionCompletedNotification::class);
    Notification::assertSentTo($founder, IntroductionCompletedNotification::class);
});

test('6. Unauthorized Admin roles cannot manage or decide introductions', function () {
    [$founder, $profile] = setupPhase6Startup('Apex Tech', 'apex-tech');
    $investor = Investor::factory()->create(['kyc_status' => Investor::KYC_STATUS_APPROVED]);
    $analyst = User::factory()->create(['role' => 'analyst']);
    $compliance = User::factory()->create(['role' => 'compliance']);

    $interest = InvestorInterest::create([
        'investor_id' => $investor->id,
        'profile_id' => $profile->id,
        'type' => 'founder_call',
        'status' => 'pending',
    ]);

    // Analyst access blocked
    $this->actingAs($analyst)
        ->get(route('admin.dealflow.interests.index'))
        ->assertForbidden();

    $this->actingAs($analyst)
        ->patch(route('admin.dealflow.interests.update', $interest), ['status' => 'approved'])
        ->assertForbidden();

    $this->actingAs($analyst)
        ->patch(route('admin.dealflow.interests.schedule', $interest), [
            'scheduled_at' => now()->addDay()->toISOString(),
        ])
        ->assertForbidden();

    // Compliance access blocked
    $this->actingAs($compliance)
        ->get(route('admin.dealflow.interests.index'))
        ->assertForbidden();

    $this->actingAs($compliance)
        ->patch(route('admin.dealflow.interests.update', $interest), ['status' => 'approved'])
        ->assertForbidden();
});

test('7. Founder authorizes introduction request for Admin coordination', function () {
    Notification::fake();
    [$founder, $profile] = setupPhase6Startup('Apex Tech', 'apex-tech');
    $investor = Investor::factory()->create(['kyc_status' => Investor::KYC_STATUS_APPROVED]);
    $irStaff = User::factory()->create(['role' => 'investor_relations']);

    $interest = InvestorInterest::create([
        'investor_id' => $investor->id,
        'profile_id' => $profile->id,
        'type' => 'founder_call',
        'status' => 'pending',
    ]);

    $this->actingAs($founder, 'founder')
        ->patch(route('founder.access-requests.status', $interest), ['status' => 'approved'])
        ->assertRedirect();

    $interest->refresh();
    expect($interest->founder_decision)->toBe('approved')
        ->and($interest->reviewed_by_founder)->toBe($founder->id)
        ->and($interest->isFounderAuthorized())->toBeTrue();

    $this->assertDatabaseHas('audit_logs', [
        'event' => 'investor.founder_authorized',
        'actor_id' => $founder->id,
    ]);

    Notification::assertSentTo($irStaff, DealflowAdminNotification::class);
});

test('8. Investor receives correct introduction and diligence states on /interests', function () {
    [$founder, $profile] = setupPhase6Startup('Apex Tech', 'apex-tech');
    $investor = Investor::factory()->create(['kyc_status' => Investor::KYC_STATUS_APPROVED]);

    $interest = InvestorInterest::create([
        'investor_id' => $investor->id,
        'profile_id' => $profile->id,
        'type' => 'founder_call',
        'status' => 'approved',
        'scheduled_at' => now()->addDays(2),
        'meeting_link' => 'https://meet.google.com/xyz-123',
    ]);

    $this->actingAs($investor, 'investor')
        ->get(route('investor.interests.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Investor/Interests')
            ->has('interests', 1)
            ->where('interests.0.type', 'founder_call')
            ->where('interests.0.status', 'approved')
            ->where('interests.0.introduction_status', 'scheduled')
            ->where('interests.0.meeting_link', 'https://meet.google.com/xyz-123')
        );
});

test('9. Founder receives correct state when call is scheduled and completed', function () {
    [$founder, $profile] = setupPhase6Startup('Apex Tech', 'apex-tech');
    $investor = Investor::factory()->create(['kyc_status' => Investor::KYC_STATUS_APPROVED]);

    $interest = InvestorInterest::create([
        'investor_id' => $investor->id,
        'profile_id' => $profile->id,
        'type' => 'founder_call',
        'status' => 'approved',
        'scheduled_at' => now()->addDays(1),
        'meeting_link' => 'https://meet.google.com/founder-call',
    ]);

    $this->actingAs($founder, 'founder')
        ->get(route('founder.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Founder/Dashboard')
            ->where('access_requests.0.introduction_status', 'scheduled')
            ->where('access_requests.0.stage', 'introduction')
            ->where('access_requests.0.meeting_link', 'https://meet.google.com/founder-call')
        );

    $interest->update(['completed_at' => now()]);

    $this->actingAs($founder, 'founder')
        ->get(route('founder.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Founder/Dashboard')
            ->where('access_requests.0.introduction_status', 'completed')
            ->where('access_requests.0.stage', 'active_discussion')
        );
});

test('10. Rejection works cleanly for Founder and Admin', function () {
    Notification::fake();
    [$founder, $profile] = setupPhase6Startup('Apex Tech', 'apex-tech');
    $investor = Investor::factory()->create(['kyc_status' => Investor::KYC_STATUS_APPROVED]);
    $irStaff = User::factory()->create(['role' => 'investor_relations']);

    $interest = InvestorInterest::create([
        'investor_id' => $investor->id,
        'profile_id' => $profile->id,
        'type' => 'founder_call',
        'status' => 'pending',
    ]);

    $this->actingAs($founder, 'founder')
        ->patch(route('founder.access-requests.status', $interest), ['status' => 'denied'])
        ->assertRedirect();

    $interest->refresh();
    expect($interest->founder_decision)->toBe('declined')
        ->and($interest->getIntroductionStatus())->toBe('denied')
        ->and($interest->getEngagementStage())->toBe('declined');

    $this->assertDatabaseHas('audit_logs', [
        'event' => 'investor.founder_declined',
        'actor_id' => $founder->id,
    ]);

    Notification::assertSentTo($irStaff, DealflowAdminNotification::class);
});

test('11. Duplicate request behavior is idempotent and well-defined', function () {
    [$founder, $profile] = setupPhase6Startup('Apex Tech', 'apex-tech');
    $investor = Investor::factory()->create(['kyc_status' => Investor::KYC_STATUS_APPROVED]);

    // Initial submission
    $this->actingAs($investor, 'investor')
        ->post(route('investor.interests.store', $profile->slug), [
            'type' => 'more_details',
            'message' => 'Initial inquiry.',
        ])
        ->assertRedirect();

    expect(InvestorInterest::count())->toBe(1);

    // Follow-up submission upgrades to founder call
    $this->actingAs($investor, 'investor')
        ->post(route('investor.interests.store', $profile->slug), [
            'type' => 'founder_call',
            'message' => 'Upgraded to founder call.',
        ])
        ->assertRedirect();

    expect(InvestorInterest::count())->toBe(1);
    $interest = InvestorInterest::first();
    expect($interest->type)->toBe('founder_call')
        ->and($interest->message)->toBe('Upgraded to founder call.')
        ->and($interest->status)->toBe('pending');
});

test('12. Data Room status remains independent of introduction status', function () {
    [$founder, $profile] = setupPhase6Startup('Apex Tech', 'apex-tech');
    $investor = Investor::factory()->create(['kyc_status' => Investor::KYC_STATUS_APPROVED]);

    $grant = InvestorDataRoomGrant::create([
        'investor_id' => $investor->id,
        'profile_id' => $profile->id,
        'granted_by_founder' => $founder->id,
        'granted_at' => now(),
        'revoked_at' => null,
    ]);

    $interest = InvestorInterest::create([
        'investor_id' => $investor->id,
        'profile_id' => $profile->id,
        'type' => 'founder_call',
        'status' => 'pending',
    ]);

    // Introduction is pending, but data room is granted
    expect($grant->fresh()->revoked_at)->toBeNull()
        ->and($interest->fresh()->status)->toBe('pending');

    $this->actingAs($investor, 'investor')
        ->get(route('investor.interests.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('interests.0.data_room_status', 'granted')
            ->where('interests.0.introduction_status', 'requested')
        );
});

test('13. Revoking Data Room does not silently cancel an approved introduction', function () {
    [$founder, $profile] = setupPhase6Startup('Apex Tech', 'apex-tech');
    $investor = Investor::factory()->create(['kyc_status' => Investor::KYC_STATUS_APPROVED]);
    $admin = User::factory()->create(['role' => 'superadmin']);

    $grant = InvestorDataRoomGrant::create([
        'investor_id' => $investor->id,
        'profile_id' => $profile->id,
        'granted_by_founder' => $founder->id,
        'granted_at' => now(),
    ]);

    $interest = InvestorInterest::create([
        'investor_id' => $investor->id,
        'profile_id' => $profile->id,
        'type' => 'founder_call',
        'status' => 'approved',
        'scheduled_at' => now()->addDays(2),
    ]);

    // Revoke Data Room
    $this->actingAs($admin)
        ->patch(route('admin.dealflow.data-rooms.revoke', $grant))
        ->assertRedirect();

    expect($grant->fresh()->revoked_at)->not->toBeNull();
    // Introduction remains approved and scheduled
    expect($interest->fresh()->status)->toBe('approved')
        ->and($interest->fresh()->scheduled_at)->not->toBeNull();
});

test('14. Introduction decision does not automatically grant Data Room access', function () {
    [$founder, $profile] = setupPhase6Startup('Apex Tech', 'apex-tech');
    $investor = Investor::factory()->create(['kyc_status' => Investor::KYC_STATUS_APPROVED]);

    $interest = InvestorInterest::create([
        'investor_id' => $investor->id,
        'profile_id' => $profile->id,
        'type' => 'founder_call',
        'status' => 'pending',
    ]);

    $this->actingAs($founder, 'founder')
        ->patch(route('founder.access-requests.status', $interest), ['status' => 'approved'])
        ->assertRedirect();

    expect($interest->fresh()->founder_decision)->toBe('approved')
        ->and(InvestorDataRoomGrant::where('investor_id', $investor->id)->exists())->toBeFalse();
});

test('15. Cross-startup isolation remains strictly intact', function () {
    [$founderA, $profileA] = setupPhase6Startup('Apex Tech', 'apex-tech');
    [$founderB, $profileB] = setupPhase6Startup('Beta Dynamics', 'beta-dynamics');

    $investor = Investor::factory()->create(['kyc_status' => Investor::KYC_STATUS_APPROVED]);

    $interestA = InvestorInterest::create([
        'investor_id' => $investor->id,
        'profile_id' => $profileA->id,
        'type' => 'founder_call',
        'status' => 'pending',
    ]);

    // Founder B cannot modify or approve Founder A's interest
    $this->actingAs($founderB, 'founder')
        ->patch(route('founder.access-requests.status', $interestA), ['status' => 'approved'])
        ->assertForbidden();

    expect($interestA->fresh()->status)->toBe('pending');
});
