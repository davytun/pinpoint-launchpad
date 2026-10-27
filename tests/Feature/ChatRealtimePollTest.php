<?php

use App\Models\Founder;
use App\Models\Message;
use App\Models\MessageThread;
use App\Models\User;
use Illuminate\Support\Str;

if (! function_exists('seedChatMessage')) {
    /**
     * Create a message with a deterministic, time-ordered ULID so cursor
     * comparisons are stable regardless of how fast rows are inserted.
     */
    function seedChatMessage(MessageThread $thread, string $senderType, string $senderId, string $body, DateTimeInterface $time): Message
    {
        return Message::forceCreate([
            'id' => (string) Str::ulid($time),
            'thread_id' => $thread->id,
            'sender_type' => $senderType,
            'sender_id' => $senderId,
            'body' => $body,
            'created_at' => $time,
            'updated_at' => $time,
        ]);
    }
}

test('admin poll returns only messages newer than the cursor and clears admin unread', function () {
    $superadmin = User::factory()->create(['role' => 'superadmin']);
    $founder = Founder::factory()->create();
    $thread = MessageThread::create([
        'founder_id' => $founder->id,
        'admin_unread_count' => 2,
        'founder_unread_count' => 0,
        'last_message_at' => now(),
    ]);

    $first = seedChatMessage($thread, 'founder', (string) $founder->id, 'first', now()->subMinutes(3));
    $second = seedChatMessage($thread, 'founder', (string) $founder->id, 'second', now()->subMinutes(2));
    $third = seedChatMessage($thread, 'founder', (string) $founder->id, 'third', now()->subMinute());

    $this->actingAs($superadmin)
        ->getJson(route('admin.messages.poll', ['thread' => $thread->id, 'after' => $second->id]))
        ->assertOk()
        ->assertJsonCount(1, 'messages')
        ->assertJsonPath('messages.0.id', $third->id)
        ->assertJsonPath('messages.0.body', 'third');

    expect($thread->fresh()->admin_unread_count)->toBe(0);
    expect($first->exists)->toBeTrue();
});

test('admin poll without a cursor returns the whole thread and the unread total', function () {
    $superadmin = User::factory()->create(['role' => 'superadmin']);
    $founder = Founder::factory()->create();
    $thread = MessageThread::create([
        'founder_id' => $founder->id,
        'admin_unread_count' => 3,
        'founder_unread_count' => 0,
        'last_message_at' => now(),
    ]);

    seedChatMessage($thread, 'founder', (string) $founder->id, 'one', now()->subMinutes(3));
    seedChatMessage($thread, 'admin', (string) $superadmin->id, 'two', now()->subMinutes(2));
    seedChatMessage($thread, 'founder', (string) $founder->id, 'three', now()->subMinute());

    // total_unread is computed after the thread is marked read, so it settles at 0.
    $this->actingAs($superadmin)
        ->getJson(route('admin.messages.poll', ['thread' => $thread->id]))
        ->assertOk()
        ->assertJsonCount(3, 'messages')
        ->assertJsonPath('total_unread', 0);
});

test('admin poll does not leak messages from an unassigned founder', function () {
    $analyst = User::factory()->create(['role' => 'analyst']);
    $other = Founder::factory()->create();
    $thread = MessageThread::create([
        'founder_id' => $other->id,
        'admin_unread_count' => 1,
        'founder_unread_count' => 0,
        'last_message_at' => now(),
    ]);
    seedChatMessage($thread, 'founder', (string) $other->id, 'private note', now());

    $this->actingAs($analyst)
        ->getJson(route('admin.messages.poll', ['thread' => $thread->id]))
        ->assertOk()
        ->assertJsonCount(0, 'messages');

    // Unread is untouched because access was scoped out.
    expect($thread->fresh()->admin_unread_count)->toBe(1);
});

test('founder poll returns only messages newer than the cursor and clears founder unread', function () {
    $founder = Founder::factory()->create();
    $thread = MessageThread::create([
        'founder_id' => $founder->id,
        'admin_unread_count' => 0,
        'founder_unread_count' => 1,
        'last_message_at' => now(),
    ]);

    $older = seedChatMessage($thread, 'admin', '1', 'older reply', now()->subMinutes(2));
    $newer = seedChatMessage($thread, 'admin', '1', 'newer reply', now()->subMinute());

    $this->actingAs($founder, 'founder')
        ->getJson(route('founder.messages.poll', ['after' => $older->id]))
        ->assertOk()
        ->assertJsonCount(1, 'messages')
        ->assertJsonPath('messages.0.id', $newer->id);

    expect($thread->fresh()->founder_unread_count)->toBe(0);
});
