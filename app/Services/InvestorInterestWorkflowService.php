<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Founder;
use App\Models\FounderProfile;
use App\Models\Investor;
use App\Models\InvestorDataRoomGrant;
use App\Models\InvestorInterest;
use App\Models\User;
use App\Notifications\DealflowAdminNotification;
use App\Notifications\InvestorDataRoomRevokedNotification;
use App\Notifications\InvestorInterestDecisionNotification;
use App\Notifications\InvestorInterestReceivedNotification;
use Illuminate\Support\Facades\DB;

class InvestorInterestWorkflowService
{
    public function submit(Investor $investor, FounderProfile $profile, array $data, ?string $ipAddress, ?string $userAgent): InvestorInterest
    {
        return DB::transaction(function () use ($investor, $profile, $data, $ipAddress, $userAgent) {
            $interest = InvestorInterest::updateOrCreate(
                ['investor_id' => $investor->id, 'profile_id' => $profile->id],
                array_merge($data, ['status' => 'pending', 'reviewed_at' => null, 'reviewed_by_founder' => null]),
            );

            AuditLog::create([
                'event' => 'investor.interest_submitted',
                'actor_type' => $investor::class,
                'actor_id' => $investor->id,
                'auditable_type' => $interest::class,
                'auditable_id' => $interest->id,
                'metadata' => ['profile_id' => $profile->id, 'type' => $interest->type],
                'ip_address' => $ipAddress,
                'user_agent' => $userAgent,
            ]);

            DB::afterCommit(function () use ($interest) {
                $interest->loadMissing(['investor.profile', 'profile.founder']);
                $interest->profile->founder->notify(new InvestorInterestReceivedNotification($interest));
                $this->notifyDealflowStaff(new DealflowAdminNotification('interest_submitted', $interest));
            });

            return $interest;
        });
    }

    public function review(InvestorInterest $interest, Founder $founder, string $status, ?string $ipAddress, ?string $userAgent): InvestorInterest
    {
        return DB::transaction(function () use ($interest, $founder, $status, $ipAddress, $userAgent) {
            $interest->update([
                'status' => $status,
                'reviewed_by_founder' => $founder->id,
                'reviewed_at' => now(),
            ]);

            $grant = null;

            if ($status === 'approved' && $interest->type === 'data_room_access') {
                $grant = InvestorDataRoomGrant::updateOrCreate(
                    ['investor_id' => $interest->investor_id, 'profile_id' => $interest->profile_id],
                    ['granted_by_founder' => $founder->id, 'granted_at' => now(), 'revoked_at' => null],
                );

                AuditLog::create([
                    'event' => 'data_room.granted',
                    'actor_type' => $founder::class,
                    'actor_id' => $founder->id,
                    'auditable_type' => $grant::class,
                    'auditable_id' => $grant->id,
                    'metadata' => ['interest_id' => $interest->id, 'profile_id' => $interest->profile_id],
                    'ip_address' => $ipAddress,
                    'user_agent' => $userAgent,
                ]);
            }

            AuditLog::create([
                'event' => "investor.interest_{$status}",
                'actor_type' => $founder::class,
                'actor_id' => $founder->id,
                'auditable_type' => $interest::class,
                'auditable_id' => $interest->id,
                'metadata' => [
                    'profile_id' => $interest->profile_id,
                    'type' => $interest->type,
                    'data_room_grant_id' => $grant?->id,
                ],
                'ip_address' => $ipAddress,
                'user_agent' => $userAgent,
            ]);

            DB::afterCommit(function () use ($interest, $status, $grant) {
                $interest->loadMissing(['investor.profile', 'profile.founder']);
                $interest->investor->notify(new InvestorInterestDecisionNotification($interest, $status, $grant !== null));
                $this->notifyDealflowStaff(new DealflowAdminNotification('interest_decided', $interest, $status));
            });

            return $interest;
        });
    }

    public function reviewByAdmin(InvestorInterest $interest, User $admin, string $status, ?string $ipAddress, ?string $userAgent): InvestorInterest
    {
        return DB::transaction(function () use ($interest, $admin, $status, $ipAddress, $userAgent) {
            $founderId = $interest->profile?->founder_id;

            $interest->update([
                'status' => $status,
                'reviewed_by_founder' => $founderId,
                'reviewed_at' => now(),
            ]);

            $grant = null;

            if ($status === 'approved' && $interest->type === 'data_room_access') {
                $grant = InvestorDataRoomGrant::updateOrCreate(
                    ['investor_id' => $interest->investor_id, 'profile_id' => $interest->profile_id],
                    ['granted_by_founder' => $founderId, 'granted_at' => now(), 'revoked_at' => null],
                );

                AuditLog::create([
                    'event' => 'data_room.granted_by_admin',
                    'actor_type' => $admin::class,
                    'actor_id' => $admin->id,
                    'auditable_type' => $grant::class,
                    'auditable_id' => $grant->id,
                    'metadata' => ['interest_id' => $interest->id, 'profile_id' => $interest->profile_id],
                    'ip_address' => $ipAddress,
                    'user_agent' => $userAgent,
                ]);
            }

            AuditLog::create([
                'event' => "investor.interest_{$status}_by_admin",
                'actor_type' => $admin::class,
                'actor_id' => $admin->id,
                'auditable_type' => $interest::class,
                'auditable_id' => $interest->id,
                'metadata' => [
                    'profile_id' => $interest->profile_id,
                    'type' => $interest->type,
                    'data_room_grant_id' => $grant?->id,
                ],
                'ip_address' => $ipAddress,
                'user_agent' => $userAgent,
            ]);

            DB::afterCommit(function () use ($interest, $status, $grant) {
                $interest->loadMissing(['investor.profile', 'profile.founder']);
                $interest->investor?->notify(new InvestorInterestDecisionNotification($interest, $status, $grant !== null));
                $this->notifyDealflowStaff(new DealflowAdminNotification('interest_decided', $interest, $status));
            });

            return $interest;
        });
    }

    public function revoke(InvestorDataRoomGrant $grant, User $actor, ?string $ipAddress, ?string $userAgent): void
    {
        if ($grant->revoked_at !== null) {
            return;
        }

        DB::transaction(function () use ($grant, $actor, $ipAddress, $userAgent) {
            $grant->update(['revoked_at' => now()]);

            AuditLog::create([
                'event' => 'data_room.revoked',
                'actor_type' => $actor::class,
                'actor_id' => $actor->id,
                'auditable_type' => $grant::class,
                'auditable_id' => $grant->id,
                'metadata' => ['profile_id' => $grant->profile_id, 'investor_id' => $grant->investor_id],
                'ip_address' => $ipAddress,
                'user_agent' => $userAgent,
            ]);

            DB::afterCommit(function () use ($grant) {
                $grant->loadMissing(['investor.profile', 'profile.founder']);
                $grant->investor->notify(new InvestorDataRoomRevokedNotification($grant));
                $this->notifyDealflowStaff(new DealflowAdminNotification('access_revoked', null, null, $grant));
            });
        });
    }

    public function reinstate(InvestorDataRoomGrant $grant, User $actor, ?string $ipAddress, ?string $userAgent): void
    {
        if ($grant->revoked_at === null) {
            return;
        }

        DB::transaction(function () use ($grant, $actor, $ipAddress, $userAgent) {
            $grant->update([
                'revoked_at' => null,
                'granted_at' => now(),
            ]);

            AuditLog::create([
                'event' => 'data_room.reinstated',
                'actor_type' => $actor::class,
                'actor_id' => $actor->id,
                'auditable_type' => $grant::class,
                'auditable_id' => $grant->id,
                'metadata' => ['profile_id' => $grant->profile_id, 'investor_id' => $grant->investor_id],
                'ip_address' => $ipAddress,
                'user_agent' => $userAgent,
            ]);

            DB::afterCommit(function () use ($grant) {
                $grant->loadMissing(['investor.profile', 'profile.founder']);
                $this->notifyDealflowStaff(new DealflowAdminNotification('data_room_granted', null, null, $grant));
            });
        });
    }

    private function notifyDealflowStaff(DealflowAdminNotification $notification): void
    {
        User::query()
            ->whereIn('role', ['superadmin', 'investor_relations'])
            ->each(fn (User $user) => $user->notify($notification));
    }
}
