<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlatformAnnouncement extends Model
{
    protected $fillable = ['type', 'audience', 'title', 'body', 'destination_url', 'published_by', 'published_at'];

    protected function casts(): array
    {
        return ['published_at' => 'datetime'];
    }
}
