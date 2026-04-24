<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Signature extends Model
{
    protected $fillable = [
        'payment_id',
        'diagnostic_session_id',
        'boldsign_document_id',
        'boldsign_template_id',
        'embed_url',
        'embed_url_expires_at',
        'status',
        'signer_email',
        'signer_name',
        'signer_full_name',
        'signer_company_name',
        'details_confirmed',
        'signed_at',
        'signed_pdf_path',
        'metadata',
    ];

    protected $casts = [
        'signed_at'            => 'datetime',
        'embed_url_expires_at' => 'datetime',
        'details_confirmed'    => 'boolean',
        'metadata'             => 'array',
    ];

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    public function diagnosticSession(): BelongsTo
    {
        return $this->belongsTo(DiagnosticSession::class);
    }

    public function isSigned(): bool
    {
        return $this->status === 'signed';
    }

    public function isPending(): bool
    {
        return in_array($this->status, ['pending', 'sent']);
    }

    public function isEmbedUrlValid(): bool
    {
        return $this->embed_url
            && $this->embed_url_expires_at
            && $this->embed_url_expires_at->isAfter(now()->addMinutes(2));
    }

    public function log(string $event, array $metadata = []): void
    {
        $logs   = $this->metadata['logs'] ?? [];
        $logs[] = [
            'event'     => $event,
            'timestamp' => now()->toISOString(),
            'ip'        => request()->ip(),
            'metadata'  => $metadata,
        ];

        $this->update([
            'metadata' => array_merge($this->metadata ?? [], ['logs' => $logs]),
        ]);
    }

    public function scopeSigned(Builder $query): Builder
    {
        return $query->where('status', 'signed');
    }

    public function scopeByEmail(Builder $query, string $email): Builder
    {
        return $query->where('signer_email', $email);
    }
}
