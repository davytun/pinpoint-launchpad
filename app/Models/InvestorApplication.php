<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InvestorApplication extends Model
{
    protected $fillable = [
        'investor_type',
        'name',
        'email',
        'organisation',
        'role',
        'country',
        'website',
        'stages',
        'sectors',
        'geographies',
        'cheque_size',
        'instrument',
        'deals_per_year',
        'fund_detail',
        'thesis_notes',
        'status',
        'confirmations',
        'submitted_at',
    ];

    protected $casts = [
        'stages'        => 'array',
        'sectors'       => 'array',
        'geographies'   => 'array',
        'confirmations' => 'array',
        'submitted_at'  => 'datetime',
    ];
}
