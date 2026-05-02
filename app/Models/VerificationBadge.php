<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VerificationBadge extends Model
{
    protected $fillable = [
        'profile_id',
        'badge_type',
        'label',
        'is_verified',
        'verified_at',
    ];

    protected $casts = [
        'is_verified' => 'boolean',
        'verified_at' => 'datetime',
    ];

    public function founderProfile(): BelongsTo
    {
        return $this->belongsTo(FounderProfile::class, 'profile_id');
    }

    public static function displayMap(): array
    {
        return [
            'legal'          => 'LEGAL: VERIFIED',
            'financial'      => 'FINANCING: VERIFIED',
            'tech_stack'     => 'TECH STACK: AUDITED',
            'cap_table'      => 'CAP TABLE: CLEAN',
            'ip_ownership'   => 'IP OWNERSHIP: CONFIRMED',
            'unit_economics' => 'UNIT ECONOMICS: VERIFIED',
            'market_size'    => 'MARKET SIZE: VALIDATED',
        ];
    }
}
