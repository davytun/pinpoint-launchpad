<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WaitlistEntry extends Model
{
    protected $fillable = [
        'type',
        'name',
        'email',
        'company_name',
        'firm_name',
        'stage',
        'role',
        'email_sent_at',
        'converted_at',
    ];

    protected function casts(): array
    {
        return [
            'email_sent_at'  => 'datetime',
            'converted_at'   => 'datetime',
        ];
    }
}
