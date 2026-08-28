<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvestorInterest extends Model
{
    use HasUlids;

    protected $fillable = [
        'investor_id',
        'profile_id',
        'type',
        'message',
        'status',
        'reviewed_by_founder',
        'reviewed_at',
        'scheduled_at',
        'completed_at',
        'meeting_link',
        'admin_notes',
        'founder_notes',
    ];

    protected function casts(): array
    {
        return [
            'reviewed_at' => 'datetime',
            'scheduled_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function investor(): BelongsTo { return $this->belongsTo(Investor::class); }
    public function profile(): BelongsTo { return $this->belongsTo(FounderProfile::class, 'profile_id'); }
    public function reviewer(): BelongsTo { return $this->belongsTo(Founder::class, 'reviewed_by_founder'); }

    public function isFounderCall(): bool
    {
        return $this->type === 'founder_call';
    }

    public function isScheduled(): bool
    {
        return $this->scheduled_at !== null;
    }

    public function isCompleted(): bool
    {
        return $this->completed_at !== null;
    }

    public function getIntroductionStatus(): string
    {
        if ($this->type !== 'founder_call') {
            return 'not_requested';
        }

        if ($this->status === 'denied') {
            return 'denied';
        }

        if ($this->status === 'pending') {
            return 'requested';
        }

        if ($this->completed_at !== null) {
            return 'completed';
        }

        if ($this->scheduled_at !== null) {
            return 'scheduled';
        }

        return 'approved';
    }

    public function getEngagementStage(?InvestorDataRoomGrant $grant = null): string
    {
        if ($this->status === 'pending') {
            return 'new_interest';
        }

        if ($this->status === 'denied') {
            return 'declined';
        }

        if ($this->completed_at !== null) {
            return 'active_discussion';
        }

        if ($this->isFounderCall() && ($this->scheduled_at !== null || $this->status === 'approved')) {
            return 'introduction';
        }

        if ($grant !== null && $grant->revoked_at === null) {
            return 'data_room';
        }

        return 'reviewing';
    }
}
