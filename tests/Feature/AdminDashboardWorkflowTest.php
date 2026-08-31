<?php

use App\Models\AuditAssignment;
use App\Models\Founder;
use App\Models\Investor;
use App\Models\InvestorInterest;
use App\Models\MessageThread;
use App\Models\Payment;
use App\Models\User;

test('superadmin dashboard generates accurate action-required workflows with valid deep-links', function () {
    $superadmin = User::factory()->create(['role' => 'superadmin']);
    $payingUser = User::factory()->create();

    // 1. Create a pending audit payment
    $payment = Payment::create([
        'user_id' => $payingUser->id,
        'customer_email' => $payingUser->email,
        'tier' => 'foundation',
        'tier_base_amount' => 35000,
        'total_amount' => 35000,
        'currency' => 'USD',
        'paid_at' => now(),
    ]);
    $payment->status = 'paid';
    $payment->audit_status = 'pending';
    $payment->save();

    // 2. Create a pending KYC investor
    $investor = Investor::factory()->create(['kyc_status' => Investor::KYC_STATUS_PENDING]);

    // 3. Create a pending dealflow interest
    $founder = Founder::factory()->create();
    $profile = $founder->profile()->create(['slug' => 'dashboard-test-co', 'is_public' => true]);
    InvestorInterest::create([
        'investor_id' => $investor->id,
        'profile_id' => $profile->id,
        'type' => 'data_room_access',
        'status' => 'pending',
    ]);

    // 4. Create an unread message thread
    MessageThread::create([
        'founder_id' => $founder->id,
        'admin_unread_count' => 3,
        'founder_unread_count' => 0,
    ]);

    $response = $this->actingAs($superadmin)->get(route('admin.dashboard'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Dashboard')
            ->has('needs_attention', 4)
            ->where('needs_attention.0.action_url', '/admin/messages')
            ->where('needs_attention.1.action_url', '/admin/investor-accounts?kyc_status=pending')
            ->where('needs_attention.2.action_url', '/admin/dealflow/interests?status=pending')
            ->where('needs_attention.3.action_url', '/admin/founders?status=pending'));
});

test('analyst dashboard generates analyst-assigned metrics and actions', function () {
    $analyst = User::factory()->create(['role' => 'analyst']);
    $founder = Founder::factory()->create();
    $payingUser = User::factory()->create();

    AuditAssignment::create([
        'analyst_id' => $analyst->id,
        'founder_id' => $founder->id,
        'assigned_by' => $analyst->id,
        'assigned_at' => now(),
    ]);

    $payment = Payment::create([
        'user_id' => $payingUser->id,
        'customer_email' => $founder->email,
        'tier' => 'growth',
        'tier_base_amount' => 75000,
        'total_amount' => 75000,
        'currency' => 'USD',
        'paid_at' => now(),
    ]);
    $payment->status = 'paid';
    $payment->audit_status = 'in_progress';
    $payment->save();

    $founder->update(['payment_id' => $payment->id]);

    $response = $this->actingAs($analyst)->get(route('admin.dashboard'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Dashboard')
            ->where('metrics.my_assigned', 1)
            ->where('metrics.active_audits', 1));
});

test('compliance and investor relations can access their operational dashboard queues', function () {
    $compliance = User::factory()->create(['role' => 'compliance']);
    $investorRelations = User::factory()->create(['role' => 'investor_relations']);

    $this->actingAs($compliance)
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Admin/Dashboard'));

    $this->actingAs($investorRelations)
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Admin/Dashboard'));
});
