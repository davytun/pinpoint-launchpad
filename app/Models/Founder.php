<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Models\User;

class Founder extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'email',
        'password',
        'full_name',
        'company_name',
        'phone',
        'avatar',
        'email_verified_at',
        'diagnostic_session_id',
        'payment_id',
        'signature_id',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_login_at'     => 'datetime',
        'password'          => 'hashed',
    ];

    public function diagnosticSession(): BelongsTo
    {
        return $this->belongsTo(DiagnosticSession::class);
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    public function signature(): BelongsTo
    {
        return $this->belongsTo(Signature::class);
    }

    public function hasSetupAccount(): bool
    {
        return ! is_null($this->password);
    }

    public function getScoreAttribute(): ?int
    {
        return $this->diagnosticSession?->score;
    }

    public function getScoreBandAttribute(): ?string
    {
        return $this->diagnosticSession?->score_band;
    }

    public function getTierAttribute(): ?string
    {
        return $this->payment?->tier;
    }

    public function documents(): HasMany
    {
        return $this->hasMany(FounderDocument::class)->orderBy('created_at', 'desc');
    }

    public function messageThread(): HasOne
    {
        return $this->hasOne(MessageThread::class);
    }

    public function profile(): HasOne
    {
        return $this->hasOne(FounderProfile::class);
    }

    public function auditAssignment(): HasOne
    {
        return $this->hasOne(AuditAssignment::class);
    }

    public function assignedAnalyst(): ?User
    {
        return $this->auditAssignment?->analyst;
    }
}
