<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvestorDataRoomGrant extends Model
{
    protected $fillable = ['investor_id', 'profile_id', 'granted_by_founder', 'granted_at', 'revoked_at'];

    protected function casts(): array
    {
        return ['granted_at' => 'datetime', 'revoked_at' => 'datetime'];
    }

    public function investor(): BelongsTo { return $this->belongsTo(Investor::class); }
    public function profile(): BelongsTo { return $this->belongsTo(FounderProfile::class, 'profile_id'); }
    public function grantor(): BelongsTo { return $this->belongsTo(Founder::class, 'granted_by_founder'); }

    public function isActive(): bool { return $this->revoked_at === null; }
}
