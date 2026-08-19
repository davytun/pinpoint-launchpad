<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SpotlightEntry extends Model
{
    protected $fillable = ['profile_id', 'published_at', 'published_by'];

    protected function casts(): array
    {
        return ['published_at' => 'datetime'];
    }

    public function profile(): BelongsTo
    {
        return $this->belongsTo(FounderProfile::class, 'profile_id');
    }

    public function publisher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'published_by');
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->whereNotNull('published_at');
    }
}
