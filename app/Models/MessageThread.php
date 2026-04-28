<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MessageThread extends Model
{
    protected $fillable = [
        'founder_id',
        'last_message_at',
        'founder_unread_count',
        'admin_unread_count',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
    ];

    public function founder(): BelongsTo
    {
        return $this->belongsTo(Founder::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class, 'thread_id');
    }

    public function latestMessage(): ?Message
    {
        return $this->messages()->latest()->first();
    }

    public function markReadByFounder(): void
    {
        $this->update(['founder_unread_count' => 0]);
    }

    public function markReadByAdmin(): void
    {
        $this->update(['admin_unread_count' => 0]);
    }

    public function incrementFounderUnread(): void
    {
        $this->increment('founder_unread_count');
    }

    public function incrementAdminUnread(): void
    {
        $this->increment('admin_unread_count');
    }
}
