<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Message extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'has_attachment' => 'boolean',
        'is_deleted'     => 'boolean',
        'attachment_size' => 'integer',
    ];

    public function thread(): BelongsTo
    {
        return $this->belongsTo(MessageThread::class, 'thread_id');
    }

    public function isFromFounder(): bool
    {
        return $this->sender_type === 'founder';
    }

    public function isFromAdmin(): bool
    {
        return $this->sender_type === 'admin';
    }

    public function attachmentSizeForHumans(): ?string
    {
        if (is_null($this->attachment_size)) {
            return null;
        }

        if ($this->attachment_size < 1024) {
            return $this->attachment_size . ' B';
        }
        if ($this->attachment_size < 1048576) {
            return round($this->attachment_size / 1024, 1) . ' KB';
        }
        return round($this->attachment_size / 1048576, 1) . ' MB';
    }

    public function senderName(Founder $founder): string
    {
        if ($this->isFromFounder()) {
            return $founder->full_name ?? 'You';
        }
        return 'Pinpoint Team';
    }

    public function scopeVisible(Builder $query): Builder
    {
        return $query->where('is_deleted', false);
    }
}
