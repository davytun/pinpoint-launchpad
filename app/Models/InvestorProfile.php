<?php

namespace App\Models;

use Database\Factories\InvestorProfileFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvestorProfile extends Model
{
    /** @use HasFactory<InvestorProfileFactory> */
    use HasFactory;

    protected $fillable = ['investor_id', 'investor_type', 'full_name', 'company_name', 'phone', 'address'];

    public function investor(): BelongsTo
    {
        return $this->belongsTo(Investor::class);
    }
}
