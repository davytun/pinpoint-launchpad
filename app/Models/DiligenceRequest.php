<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DiligenceRequest extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'investor_id',
        'profile_id',
        'interest_id',
        'category',
        'subject',
        'request_details',
        'status',
        'admin_instructions_for_founder',
        'founder_notes_to_admin',
        'founder_responded_at',
        'investor_visible_response',
        'admin_notes',
        'data_room_required',
        'resolved_at',
    ];

    protected function casts(): array
    {
        return [
            'founder_responded_at' => 'datetime',
            'resolved_at' => 'datetime',
            'data_room_required' => 'boolean',
        ];
    }

    public function investor(): BelongsTo
    {
        return $this->belongsTo(Investor::class);
    }

    public function profile(): BelongsTo
    {
        return $this->belongsTo(FounderProfile::class, 'profile_id');
    }

    public function interest(): BelongsTo
    {
        return $this->belongsTo(InvestorInterest::class, 'interest_id');
    }

    public function isSubmitted(): bool
    {
        return $this->status === 'submitted';
    }

    public function isUnderReview(): bool
    {
        return $this->status === 'under_review';
    }

    public function isWaitingForFounder(): bool
    {
        return $this->status === 'waiting_for_founder';
    }

    public function isFounderResponded(): bool
    {
        return $this->status === 'founder_responded';
    }

    public function isResolved(): bool
    {
        return $this->status === 'resolved';
    }

    public function isDeclined(): bool
    {
        return $this->status === 'declined';
    }

    public function getInvestorFacingStatus(): string
    {
        return match ($this->status) {
            'submitted' => 'Submitted to Pinpoint',
            'under_review' => 'Under Review',
            'waiting_for_founder' => 'Pinpoint Coordinating',
            'founder_responded' => 'Pinpoint Coordinating',
            'resolved' => 'Response Available',
            'declined' => 'Unable to Fulfil',
            default => 'Under Review',
        };
    }

    public function getFounderFacingStatus(): string
    {
        return match ($this->status) {
            'waiting_for_founder' => 'Response Required by Pinpoint',
            'founder_responded' => 'Response Submitted to Pinpoint',
            'resolved' => 'Resolved',
            'declined' => 'Closed',
            default => 'Coordinated by Pinpoint',
        };
    }
}
