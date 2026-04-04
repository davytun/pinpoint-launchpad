<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class DiagnosticSession extends Model
{
    protected $fillable = [
        'email',
        'answers',
        'score',
        'score_band',
        'pillar_scores',
        'cooldown_until',
        'completed_at',
        'ip_address',
    ];

    protected $casts = [
        'answers'       => 'array',
        'pillar_scores' => 'array',
        'cooldown_until' => 'datetime',
        'completed_at'  => 'datetime',
    ];

    public function scopeByEmail(Builder $query, string $email): Builder
    {
        return $query->where('email', $email);
    }

    public function isOnCooldown(): bool
    {
        return $this->cooldown_until !== null && $this->cooldown_until->isFuture();
    }

    public function daysRemainingOnCooldown(): int
    {
        if (! $this->isOnCooldown()) {
            return 0;
        }

        return (int) now()->diffInDays($this->cooldown_until, absolute: true);
    }

    public function getScoreBandLabel(): string
    {
        return match ($this->score_band) {
            'low'      => 'Not Ready',
            'mid_low'  => 'Early Stage',
            'mid_high' => 'Getting Closer',
            'high'     => 'Investor Ready',
            default    => 'Unknown',
        };
    }
}
