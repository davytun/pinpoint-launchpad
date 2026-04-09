<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentLog extends Model
{
    // Only auto-manage created_at — no updated_at on immutable audit log rows
    const CREATED_AT = 'created_at';
    const UPDATED_AT = null;

    protected $fillable = [
        'payment_id',
        'event',
        'metadata',
        'ip_address',
    ];

    protected $casts = [
        'metadata'   => 'array',
        'created_at' => 'datetime',
    ];

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }
}
