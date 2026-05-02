<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Payment extends Model
{
    // 'status' and 'audit_status' are intentionally excluded from mass-assignment.
    // Set them explicitly via model properties or dedicated methods.
    protected $fillable = [
        'user_id',
        'diagnostic_session_id',
        'paystack_reference',
        'paystack_access_code',
        'tier',
        'tier_base_amount',
        'gate_fee',
        'total_amount',
        'currency',
        'customer_email',
        'paid_at',
    ];

    protected $casts = [
        'paid_at'           => 'datetime',
        'tier_base_amount'  => 'integer',
        'gate_fee'          => 'integer',
        'total_amount'      => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function diagnosticSession(): BelongsTo
    {
        return $this->belongsTo(DiagnosticSession::class);
    }

    public function isRefundable(): bool
    {
        return $this->audit_status === 'pending' && $this->status === 'paid';
    }

    public function signature(): HasOne
    {
        return $this->hasOne(Signature::class);
    }

    public function logs(): HasMany
    {
        return $this->hasMany(PaymentLog::class);
    }

    public function founderProfile(): HasOne
    {
        return $this->hasOne(FounderProfile::class);
    }

    public function log(string $event, array $metadata = [], ?string $ip = null): void
    {
        // request() may not exist in queue/console context — coalesce safely
        $resolvedIp = $ip ?? (app()->runningInConsole() ? null : (request()->ip() ?? null));

        $this->logs()->create([
            'event'      => $event,
            'metadata'   => $metadata ?: null,
            'ip_address' => $resolvedIp,
        ]);
    }

    public function scopePaid(Builder $query): Builder
    {
        return $query->where('status', 'paid');
    }

    public function scopeByEmail(Builder $query, string $email): Builder
    {
        return $query->where('customer_email', $email);
    }
}
