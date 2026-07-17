<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PiaApplication extends Model
{
    protected $fillable = [
        'name',
        'email',
        'company',
        'country',
        'stage',
        'raise_target',
        'message',
        'status',
        'source',
    ];
}
