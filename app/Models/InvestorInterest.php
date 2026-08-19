<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvestorInterest extends Model
{
    protected $fillable = ['investor_id', 'profile_id', 'type', 'message', 'status', 'reviewed_by_founder', 'reviewed_at'];

    protected function casts(): array
    {
        return ['reviewed_at' => 'datetime'];
    }

    public function investor(): BelongsTo { return $this->belongsTo(Investor::class); }
    public function profile(): BelongsTo { return $this->belongsTo(FounderProfile::class, 'profile_id'); }
    public function reviewer(): BelongsTo { return $this->belongsTo(Founder::class, 'reviewed_by_founder'); }
}
