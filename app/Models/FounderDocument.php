<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FounderDocument extends Model
{
    protected $fillable = [
        'founder_id',
        'payment_id',
        'category',
        'original_filename',
        'stored_filename',
        'file_path',
        'file_size',
        'mime_type',
        'extension',
        'is_reviewed',
        'reviewed_at',
        'reviewed_by',
        'analyst_note',
    ];

    protected $casts = [
        'is_reviewed' => 'boolean',
        'reviewed_at' => 'datetime',
        'file_size'   => 'integer',
    ];

    public function founder(): BelongsTo
    {
        return $this->belongsTo(Founder::class);
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function fileSizeForHumans(): string
    {
        if ($this->file_size < 1024) {
            return $this->file_size . ' B';
        }
        if ($this->file_size < 1048576) {
            return round($this->file_size / 1024, 1) . ' KB';
        }
        return round($this->file_size / 1048576, 1) . ' MB';
    }

    public function categoryLabel(): string
    {
        return match ($this->category) {
            'cap_table'                => 'Cap Table',
            'financial_forecast'       => 'Financial Forecast',
            'bank_statement'           => 'Bank Statement',
            'pitch_deck'               => 'Pitch Deck',
            'articles_of_incorporation'=> 'Articles of Incorporation',
            'ip_assignment'            => 'IP Assignment',
            'customer_contracts'       => 'Customer Contracts / LOIs',
            'unit_economics'           => 'Unit Economics Model',
            'other'                    => 'Other',
            default                    => ucfirst(str_replace('_', ' ', $this->category)),
        };
    }

    public function isDeletable(): bool
    {
        return in_array(
            $this->founder->payment?->audit_status,
            ['pending']
        );
    }

    public function fileIcon(): string
    {
        return match ($this->extension) {
            'pdf'             => 'file-text',
            'doc', 'docx'    => 'file-text',
            'xls', 'xlsx', 'csv' => 'file-spreadsheet',
            'ppt', 'pptx'    => 'presentation',
            'jpg', 'jpeg', 'png' => 'image',
            default           => 'file',
        };
    }

    public function scopeByCategory(Builder $query, string $category): Builder
    {
        return $query->where('category', $category);
    }

    public function scopeReviewed(Builder $query): Builder
    {
        return $query->where('is_reviewed', true);
    }

    public function scopeUnreviewed(Builder $query): Builder
    {
        return $query->where('is_reviewed', false);
    }
}
