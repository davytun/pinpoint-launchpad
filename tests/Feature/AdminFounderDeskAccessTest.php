<?php

use App\Models\AuditAssignment;
use App\Models\Founder;
use App\Models\FounderDocument;
use App\Models\FounderProfile;
use App\Models\MessageThread;
use App\Models\Payment;
use App\Models\User;

test('analyst can only open message threads for assigned founders', function () {
    $analyst = User::factory()->create(['role' => 'analyst']);
    $assigned = Founder::factory()->create();
    $other = Founder::factory()->create();

    AuditAssignment::create([
        'analyst_id' => $analyst->id,
        'founder_id' => $assigned->id,
        'assigned_by' => $analyst->id,
        'assigned_at' => now(),
    ]);

    $assignedThread = MessageThread::create([
        'founder_id' => $assigned->id,
        'admin_unread_count' => 2,
        'founder_unread_count' => 0,
        'last_message_at' => now(),
    ]);

    $otherThread = MessageThread::create([
        'founder_id' => $other->id,
        'admin_unread_count' => 5,
        'founder_unread_count' => 0,
        'last_message_at' => now(),
    ]);

    $this->actingAs($analyst)
        ->get(route('admin.messages.inbox'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Messages/Inbox')
            ->has('threads', 1)
            ->where('threads.0.id', $assignedThread->id));

    $this->actingAs($analyst)
        ->get(route('admin.messages.show', $assignedThread))
        ->assertOk();

    $this->actingAs($analyst)
        ->get(route('admin.messages.show', $otherThread))
        ->assertForbidden();

    $this->actingAs($analyst)
        ->get(route('admin.messages.inbox', ['founder_id' => $other->id]))
        ->assertForbidden();
});

test('analyst document and profile access is assignment-scoped', function () {
    $analyst = User::factory()->create(['role' => 'analyst']);
    $assigned = Founder::factory()->create();
    $other = Founder::factory()->create();

    AuditAssignment::create([
        'analyst_id' => $analyst->id,
        'founder_id' => $assigned->id,
        'assigned_by' => $analyst->id,
        'assigned_at' => now(),
    ]);

    $assignedProfile = FounderProfile::create([
        'founder_id' => $assigned->id,
        'slug' => 'assigned-desk-co',
        'is_public' => true,
    ]);

    $otherProfile = FounderProfile::create([
        'founder_id' => $other->id,
        'slug' => 'other-desk-co',
        'is_public' => true,
    ]);

    $assignedDoc = FounderDocument::create([
        'founder_id' => $assigned->id,
        'category' => 'pitch_deck',
        'original_filename' => 'deck.pdf',
        'stored_filename' => 'deck.pdf',
        'file_path' => 'documents/assigned/deck.pdf',
        'file_size' => 1024,
        'mime_type' => 'application/pdf',
        'extension' => 'pdf',
    ]);

    $otherDoc = FounderDocument::create([
        'founder_id' => $other->id,
        'category' => 'pitch_deck',
        'original_filename' => 'other.pdf',
        'stored_filename' => 'other.pdf',
        'file_path' => 'documents/other/other.pdf',
        'file_size' => 1024,
        'mime_type' => 'application/pdf',
        'extension' => 'pdf',
    ]);

    $this->actingAs($analyst)
        ->get(route('admin.documents.index', $assigned))
        ->assertOk();

    $this->actingAs($analyst)
        ->get(route('admin.documents.index', $other))
        ->assertForbidden();

    $this->actingAs($analyst)
        ->get(route('admin.profiles.show', $assignedProfile))
        ->assertOk();

    $this->actingAs($analyst)
        ->get(route('admin.profiles.show', $otherProfile))
        ->assertForbidden();

    $this->actingAs($analyst)
        ->get(route('admin.profiles.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Profiles/Index')
            ->has('profiles', 1)
            ->where('profiles.0.id', $assignedProfile->id));

    // Cross-founder document URL param mismatch
    $this->actingAs($analyst)
        ->get(route('admin.documents.download', [$assigned, $otherDoc]))
        ->assertNotFound();

    // Silence unused var warning intent — assignedDoc proves create path works for assigned founder
    expect($assignedDoc->founder_id)->toBe($assigned->id);
});

test('audit status update refuses synthetic payment creation', function () {
    $superadmin = User::factory()->create(['role' => 'superadmin']);
    $founder = Founder::factory()->create(['payment_id' => null]);

    $this->actingAs($superadmin)
        ->patch(route('admin.founders.audit-status', $founder), [
            'audit_status' => 'in_progress',
        ])
        ->assertSessionHasErrors('audit_status');

    expect(Payment::count())->toBe(0);
});

test('analyst unread badge counts only assigned threads', function () {
    $analyst = User::factory()->create(['role' => 'analyst']);
    $assigned = Founder::factory()->create();
    $other = Founder::factory()->create();

    AuditAssignment::create([
        'analyst_id' => $analyst->id,
        'founder_id' => $assigned->id,
        'assigned_by' => $analyst->id,
        'assigned_at' => now(),
    ]);

    MessageThread::create([
        'founder_id' => $assigned->id,
        'admin_unread_count' => 3,
        'founder_unread_count' => 0,
    ]);

    MessageThread::create([
        'founder_id' => $other->id,
        'admin_unread_count' => 9,
        'founder_unread_count' => 0,
    ]);

    expect($analyst->adminUnreadMessagesCount())->toBe(3);
});
