<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Collection;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
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

    public function isCompliance(): bool
    {
        return $this->role === 'compliance';
    }

    public function isInvestorRelations(): bool
    {
        return $this->role === 'investor_relations';
    }

    /**
     * Operable staff roles (support is retired from day-to-day admin access).
     */
    public function canOperateAdmin(): bool
    {
        return in_array($this->role, ['superadmin', 'analyst', 'compliance', 'investor_relations'], true);
    }

    /**
     * Legacy helper — now matches operable staff only.
     */
    public function isAdmin(): bool
    {
        return $this->canOperateAdmin();
    }

    public function isFounder(): bool
    {
        return false;
    }

    public function canAccessPlatformAdmin(): bool
    {
        return $this->isSuperAdmin();
    }

    public function canAccessFounderAdmin(): bool
    {
        return $this->isSuperAdmin() || $this->isAnalyst();
    }

    public function canAccessInvestorAdmin(): bool
    {
        return $this->isSuperAdmin() || $this->isCompliance() || $this->isInvestorRelations();
    }

    /**
     * Post-login home: specialists land on their desk dashboard; superadmin on platform.
     */
    public function defaultAdminHomeRoute(): string
    {
        if ($this->isAnalyst()) {
            return route('admin.founder.dashboard', absolute: false);
        }

        if ($this->isCompliance() || $this->isInvestorRelations()) {
            return route('admin.investors.dashboard', absolute: false);
        }

        if ($this->canAccessPlatformAdmin()) {
            return route('admin.dashboard', absolute: false);
        }

        return route('admin.login', absolute: false);
    }

    public function canAccessFinancials(): bool
    {
        return $this->isSuperAdmin();
    }

    public function canManageAudit(): bool
    {
        return in_array($this->role, ['superadmin', 'analyst'], true);
    }

    public function canAccessFounder(string $founderId): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        return AuditAssignment::where('analyst_id', $this->id)
            ->where('founder_id', $founderId)
            ->exists();
    }

    /**
     * Founder IDs this analyst is assigned to (empty for non-analysts).
     *
     * @return Collection<int, string>
     */
    public function assignedFounderIds()
    {
        return AuditAssignment::where('analyst_id', $this->id)->pluck('founder_id');
    }

    /**
     * Unread founder→admin message count for the current staff member's desk scope.
     */
    public function adminUnreadMessagesCount(): int
    {
        if ($this->isSuperAdmin()) {
            return (int) MessageThread::sum('admin_unread_count');
        }

        if ($this->isAnalyst()) {
            return (int) MessageThread::whereIn('founder_id', $this->assignedFounderIds())
                ->sum('admin_unread_count');
        }

        return 0;
    }

    public function auditAssignments()
    {
        return $this->hasMany(AuditAssignment::class, 'analyst_id');
    }
}
