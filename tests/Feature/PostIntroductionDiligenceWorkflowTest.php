<?php

use App\Models\AuditLog;
use App\Models\DiligenceRequest;
use App\Models\Founder;
use App\Models\FounderProfile;
use App\Models\Investor;
use App\Models\InvestorInterest;
use App\Models\User;
use App\Notifications\FounderDiligenceRequestedNotification;
use App\Notifications\InvestorDiligenceResponseReadyNotification;
use Illuminate\Support\Facades\Notification;

function setupDiligenceContext(): array
{
    $founder = Founder::factory()->create(['company_name' => 'Nexus Quantum Ltd']);
    $profile = FounderProfile::create([
        'founder_id' => $founder->id,
        'slug' => "nexus-quantum-{$founder->id}",
        'is_public' => true,
        'sector' => 'DeepTech',
        'spotlight_one_liner' => 'Quantum error-correction hardware',
    ]);

    $investor = Investor::factory()->create([
        'kyc_status' => Investor::KYC_STATUS_APPROVED,
    ]);
    $investor->profile()->create([
        'full_name' => 'Marcus Vance',
        'company_name' => 'Vance Horizon Capital',
    ]);

    $admin = User::factory()->create([
        'role' => 'investor_relations',
    ]);

    $interest = InvestorInterest::create([
        'investor_id' => $investor->id,
        'profile_id' => $profile->id,
        'type' => 'founder_call',
        'status' => 'approved',
        'founder_decision' => 'approved',
        'completed_at' => now()->subDay(),
    ]);

    return [$founder, $profile, $investor, $admin, $interest];
}

test('1. Investor can submit post-introduction diligence request to Pinpoint IR', function () {
    Notification::fake();
    [$founder, $profile, $investor, $admin, $interest] = setupDiligenceContext();

    $response = $this->actingAs($investor, 'investor')
        ->post(route('investor.diligence.store', $profile->slug), [
            'category' => 'financial',
            'subject' => 'Clarification on Q3 Gross Margins',
            'request_details' => 'Could Pinpoint IR request the gross margin model assumptions for the Q3 enterprise pipeline?',
            'data_room_required' => false,
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('diligence_requests', [
        'investor_id' => $investor->id,
        'profile_id' => $profile->id,
        'interest_id' => $interest->id,
        'category' => 'financial',
        'subject' => 'Clarification on Q3 Gross Margins',
        'status' => 'submitted',
    ]);

    $this->assertDatabaseHas('audit_logs', [
        'event' => 'diligence.request_submitted',
        'actor_type' => $investor::class,
        'actor_id' => $investor->id,
    ]);
});

test('2. Admin can forward diligence request to Founder with guidance', function () {
    Notification::fake();
    [$founder, $profile, $investor, $admin, $interest] = setupDiligenceContext();

    $diligence = DiligenceRequest::create([
        'investor_id' => $investor->id,
        'profile_id' => $profile->id,
        'interest_id' => $interest->id,
        'category' => 'financial',
        'subject' => 'Clarification on Q3 Gross Margins',
        'request_details' => 'Could Pinpoint IR request the gross margin model assumptions?',
        'status' => 'submitted',
    ]);

    $response = $this->actingAs($admin)
        ->patch(route('admin.dealflow.diligence.request-founder', $diligence), [
            'admin_instructions_for_founder' => 'Please provide the high-level COGS breakdown for enterprise contracts.',
        ]);

    $response->assertRedirect();
    expect($diligence->fresh()->status)->toBe('waiting_for_founder')
        ->and($diligence->fresh()->admin_instructions_for_founder)->toBe('Please provide the high-level COGS breakdown for enterprise contracts.');

    $this->assertDatabaseHas('audit_logs', [
        'event' => 'diligence.founder_response_requested',
        'actor_type' => $admin::class,
        'actor_id' => $admin->id,
    ]);

    Notification::assertSentTo($founder, FounderDiligenceRequestedNotification::class);
});

test('3. Founder can submit response directly to Pinpoint IR', function () {
    Notification::fake();
    [$founder, $profile, $investor, $admin, $interest] = setupDiligenceContext();

    $diligence = DiligenceRequest::create([
        'investor_id' => $investor->id,
        'profile_id' => $profile->id,
        'interest_id' => $interest->id,
        'category' => 'financial',
        'subject' => 'Clarification on Q3 Gross Margins',
        'request_details' => 'Could Pinpoint IR request the gross margin model assumptions?',
        'status' => 'waiting_for_founder',
        'admin_instructions_for_founder' => 'Please provide the COGS breakdown.',
    ]);

    $response = $this->actingAs($founder, 'founder')
        ->patch(route('founder.diligence.respond', $diligence), [
            'founder_notes_to_admin' => 'Our enterprise contract gross margin is currently 78% with hardware amortization included.',
        ]);

    $response->assertRedirect();
    expect($diligence->fresh()->status)->toBe('founder_responded')
        ->and($diligence->fresh()->founder_notes_to_admin)->toBe('Our enterprise contract gross margin is currently 78% with hardware amortization included.')
        ->and($diligence->fresh()->founder_responded_at)->not->toBeNull();

    $this->assertDatabaseHas('audit_logs', [
        'event' => 'diligence.founder_responded',
        'actor_type' => $founder::class,
        'actor_id' => $founder->id,
    ]);
});

test('4. Admin reviews founder response and releases approved investor response', function () {
    Notification::fake();
    [$founder, $profile, $investor, $admin, $interest] = setupDiligenceContext();

    $diligence = DiligenceRequest::create([
        'investor_id' => $investor->id,
        'profile_id' => $profile->id,
        'interest_id' => $interest->id,
        'category' => 'financial',
        'subject' => 'Clarification on Q3 Gross Margins',
        'request_details' => 'Could Pinpoint IR request the gross margin model assumptions?',
        'status' => 'founder_responded',
        'founder_notes_to_admin' => 'Our enterprise contract gross margin is currently 78% with hardware amortization included.',
        'founder_responded_at' => now(),
    ]);

    $response = $this->actingAs($admin)
        ->patch(route('admin.dealflow.diligence.release', $diligence), [
            'investor_visible_response' => 'Nexus Quantum has verified that enterprise gross margins are modeled at 78%, factoring in full hardware amortization.',
            'mark_resolved' => true,
            'admin_notes' => 'Reviewed against financial model v2 in audit vault.',
        ]);

    $response->assertRedirect();
    expect($diligence->fresh()->status)->toBe('resolved')
        ->and($diligence->fresh()->investor_visible_response)->toBe('Nexus Quantum has verified that enterprise gross margins are modeled at 78%, factoring in full hardware amortization.')
        ->and($diligence->fresh()->admin_notes)->toBe('Reviewed against financial model v2 in audit vault.')
        ->and($diligence->fresh()->resolved_at)->not->toBeNull();

    $this->assertDatabaseHas('audit_logs', [
        'event' => 'diligence.response_released',
        'actor_type' => $admin::class,
        'actor_id' => $admin->id,
    ]);
    $this->assertDatabaseHas('audit_logs', [
        'event' => 'diligence.resolved',
        'actor_type' => $admin::class,
        'actor_id' => $admin->id,
    ]);

    Notification::assertSentTo($investor, InvestorDiligenceResponseReadyNotification::class);
});

test('5. Admin can update overall engagement deal stage', function () {
    [$founder, $profile, $investor, $admin, $interest] = setupDiligenceContext();

    $response = $this->actingAs($admin)
        ->patch(route('admin.dealflow.interests.deal-stage', $interest), [
            'deal_stage' => 'active_discussion',
            'notes' => 'Founder and investor completed follow-up review on financial model.',
        ]);

    $response->assertRedirect();
    expect($interest->fresh()->deal_stage)->toBe('active_discussion')
        ->and($interest->fresh()->getEngagementStage())->toBe('active_discussion');

    $this->assertDatabaseHas('audit_logs', [
        'event' => 'engagement.stage_changed',
        'actor_type' => $admin::class,
        'actor_id' => $admin->id,
    ]);
});
