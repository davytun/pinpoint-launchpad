<?php

use App\Models\Founder;
use App\Models\User;

test('the founder directory does not ship every message and document', function () {
    $admin = User::factory()->create(['role' => 'superadmin']);
    Founder::factory()->create();

    $this->actingAs($admin)
        ->get(route('admin.founders.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('founders.data', 1)
            ->has('founders.data.0', fn ($row) => $row
                ->where('documents_count', 0)
                ->missing('messages')
                ->missing('documents')
                ->etc()));
});

test('opening founder details loads the summary before documents and messages', function () {
    $admin = User::factory()->create(['role' => 'superadmin']);
    $founder = Founder::factory()->create();

    $this->actingAs($admin)
        ->get(route('admin.founders.show', $founder))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Founders/Show')
            ->where('documents_count', 0)
            ->missing('documents')
            ->missing('thread_messages')
            ->loadDeferredProps(fn ($reload) => $reload
                ->has('documents')
                ->has('thread_messages')));
});

test('the details panel returns one founder documents and messages', function () {
    $admin = User::factory()->create(['role' => 'superadmin']);
    $founder = Founder::factory()->create();

    $this->actingAs($admin)
        ->getJson(route('admin.founders.panel', $founder))
        ->assertOk()
        ->assertJson([
            'documents' => [],
            'messages' => [],
            'message_thread_id' => null,
            'unread_messages' => 0,
        ]);
});
