<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class FounderProfile extends Model
{
    protected $fillable = [
        'founder_id',
        'payment_id',
        'slug',
        'is_public',
        'radar_data',
        'overall_score',
        'analyst_summary',
        'batch',
        'sector',
        'verified_at',
        'expires_at',
    ];

    protected $casts = [
        'is_public'   => 'boolean',
        'radar_data'  => 'array',
        'verified_at' => 'datetime',
        'expires_at'  => 'datetime',
    ];

    public function founder(): BelongsTo
    {
        return $this->belongsTo(Founder::class);
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    public function badges(): HasMany
    {
        return $this->hasMany(VerificationBadge::class, 'profile_id');
    }

    public function investorAccessRequests(): HasMany
    {
        return $this->hasMany(InvestorAccessRequest::class, 'profile_id');
    }

    public function isLive(): bool
    {
        return $this->is_public
            && $this->verified_at !== null
            && ($this->expires_at === null || $this->expires_at->isFuture());
    }

    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }

    public function daysUntilExpiry(): ?int
    {
        if (! $this->expires_at) {
            return null;
        }

        return max(0, (int) now()->diffInDays($this->expires_at, false));
    }

    public function verifiedBadgesCount(): int
    {
        return $this->badges()->where('is_verified', true)->count();
    }

    public function scopePublic(Builder $query): Builder
    {
        return $query->where('is_public', true)->whereNotNull('verified_at');
    }
}
