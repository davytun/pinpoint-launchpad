<?php

namespace App\Models;

use Database\Factories\InvestorKycSubmissionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvestorKycSubmission extends Model
{
    /** @use HasFactory<InvestorKycSubmissionFactory> */
    use HasFactory;

    protected $fillable = ['investor_id', 'document_type', 'storage_path', 'original_name', 'mime_type', 'size_bytes', 'status', 'reviewed_by', 'reviewed_at', 'review_notes'];

    protected function casts(): array
    {
        return ['reviewed_at' => 'datetime'];
    }

    public function investor(): BelongsTo
    {
        return $this->belongsTo(Investor::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
