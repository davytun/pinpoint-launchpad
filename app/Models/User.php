<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => 'string',
        ];
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === 'superadmin';
    }

    public function isAnalyst(): bool
    {
        return $this->role === 'analyst';
    }

    public function isSupport(): bool
    {
        return $this->role === 'support';
    }

    // Legacy helpers — keep for backward compat with any existing checks
    public function isAdmin(): bool
    {
        return in_array($this->role, ['superadmin', 'analyst', 'support']);
    }

    public function isFounder(): bool
    {
        return false;
    }

    public function canAccessFinancials(): bool
    {
        return $this->isSuperAdmin();
    }

    public function canManageAudit(): bool
    {
        return in_array($this->role, ['superadmin', 'analyst']);
    }

    public function canAccessFounder(int $founderId): bool
    {
        if ($this->isSuperAdmin()) return true;
        if ($this->isSupport()) return true;

        return AuditAssignment::where('analyst_id', $this->id)
            ->where('founder_id', $founderId)
            ->exists();
    }

    public function auditAssignments()
    {
        return $this->hasMany(AuditAssignment::class, 'analyst_id');
    }
}
