<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Investor extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\InvestorFactory> */
    use HasFactory, Notifiable;

    protected $fillable = [
        'email', 'password', 'account_status', 'email_verified_at', 'last_login_at',
        'terms_accepted_at', 'aml_confirmed_at',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'password' => 'hashed', 'email_verified_at' => 'datetime', 'last_login_at' => 'datetime',
            'terms_accepted_at' => 'datetime', 'aml_confirmed_at' => 'datetime',
        ];
    }

    public function profile(): HasOne
    {
        return $this->hasOne(InvestorProfile::class);
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class, 'actor_id')->where('actor_type', self::class);
    }

    public function isActive(): bool
    {
        return $this->account_status === 'active';
    }
}
