<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvestorAccessRequest extends Model
{
    protected $fillable = [
        'profile_id',
        'investor_name',
        'investor_email',
        'firm_name',
        'linkedin_url',
        'message',
        'ip_address',
        'notified_founder_at',
    ];

    protected $casts = [
        'notified_founder_at' => 'datetime',
    ];

    public function founderProfile(): BelongsTo
    {
        return $this->belongsTo(FounderProfile::class, 'profile_id');
    }
}
