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
use App\Notifications\IntroductionCompletedNotification;
use App\Notifications\IntroductionScheduledNotification;
use App\Notifications\InvestorDataRoomRevokedNotification;
use App\Notifications\InvestorInterestDecisionNotification;
use App\Notifications\InvestorInterestReceivedNotification;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class InvestorInterestWorkflowService
{
    public function submit(Investor $investor, FounderProfile $profile, array $data, ?string $ipAddress, ?string $userAgent): InvestorInterest
    {
        return DB::transaction(function () use ($investor, $profile, $data, $ipAddress, $userAgent) {
            $interest = InvestorInterest::updateOrCreate(
                ['investor_id' => $investor->id, 'profile_id' => $profile->id],
                array_merge($data, [
                    'status' => 'pending',
                    'founder_decision' => null,
                    'reviewed_at' => null,
                    'reviewed_by_founder' => null,
                    'scheduled_at' => null,
                    'completed_at' => null,
                ]),
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

            if ($interest->type === 'founder_call') {
                AuditLog::create([
                    'event' => 'introduction.requested',
                    'actor_type' => $investor::class,
                    'actor_id' => $investor->id,
                    'auditable_type' => $interest::class,
                    'auditable_id' => $interest->id,
                    'metadata' => ['profile_id' => $profile->id],
                    'ip_address' => $ipAddress,
                    'user_agent' => $userAgent,
                ]);
            }

            DB::afterCommit(function () use ($interest) {
                $interest->loadMissing(['investor.profile', 'profile.founder']);
                $interest->profile->founder->notify(new InvestorInterestReceivedNotification($interest));
                $this->notifyDealflowStaff(new DealflowAdminNotification('interest_submitted', $interest));
            });

            return $interest;
        });
    }

    /**
     * Founder provides authorization or confirmation to Pinpoint Admin.
     * Crucial: Founder does NOT grant access directly to Investor. Admin must confirm/activate.
     */
    public function review(InvestorInterest $interest, Founder $founder, string $decision, ?string $ipAddress, ?string $userAgent): InvestorInterest
    {
        return DB::transaction(function () use ($interest, $founder, $decision, $ipAddress, $userAgent) {
            $normalizedDecision = in_array($decision, ['denied', 'declined']) ? 'declined' : 'approved';

            $interest->update([
                'founder_decision' => $normalizedDecision,
                'reviewed_by_founder' => $founder->id,
                'reviewed_at' => now(),
            ]);

            $event = $normalizedDecision === 'approved' ? 'investor.founder_authorized' : 'investor.founder_declined';

            AuditLog::create([
                'event' => $event,
                'actor_type' => $founder::class,
                'actor_id' => $founder->id,
                'auditable_type' => $interest::class,
                'auditable_id' => $interest->id,
                'metadata' => [
                    'profile_id' => $interest->profile_id,
                    'type' => $interest->type,
                    'founder_decision' => $normalizedDecision,
                ],
                'ip_address' => $ipAddress,
                'user_agent' => $userAgent,
            ]);

            if ($interest->type === 'founder_call') {
                $introEvent = $normalizedDecision === 'approved' ? 'introduction.founder_confirmed' : 'introduction.founder_declined';
                AuditLog::create([
                    'event' => $introEvent,
                    'actor_type' => $founder::class,
                    'actor_id' => $founder->id,
                    'auditable_type' => $interest::class,
                    'auditable_id' => $interest->id,
                    'metadata' => ['profile_id' => $interest->profile_id],
                    'ip_address' => $ipAddress,
                    'user_agent' => $userAgent,
                ]);
            }

            DB::afterCommit(function () use ($interest, $normalizedDecision) {
                $interest->loadMissing(['investor.profile', 'profile.founder']);
                $adminEvent = $normalizedDecision === 'approved' ? 'founder_authorized' : 'founder_declined';
                $this->notifyDealflowStaff(new DealflowAdminNotification($adminEvent, $interest, $normalizedDecision));
            });

            return $interest;
        });
    }

    /**
     * Admin finalizes decision and activates Data Room clearance or confirms call workflow.
     */
    public function reviewByAdmin(InvestorInterest $interest, User $admin, string $status, ?string $ipAddress, ?string $userAgent): InvestorInterest
    {
        return DB::transaction(function () use ($interest, $admin, $status, $ipAddress, $userAgent) {
            $founderId = $interest->profile?->founder_id;

            $interest->update([
                'status' => $status,
                'reviewed_at' => $interest->reviewed_at ?? now(),
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

            if ($interest->type === 'founder_call') {
                $introEvent = $status === 'approved' ? 'introduction.approved' : 'introduction.rejected';
                AuditLog::create([
                    'event' => $introEvent,
                    'actor_type' => $admin::class,
                    'actor_id' => $admin->id,
                    'auditable_type' => $interest::class,
                    'auditable_id' => $interest->id,
                    'metadata' => ['profile_id' => $interest->profile_id, 'decided_by' => 'admin'],
                    'ip_address' => $ipAddress,
                    'user_agent' => $userAgent,
                ]);
            }

            DB::afterCommit(function () use ($interest, $status, $grant) {
                $interest->loadMissing(['investor.profile', 'profile.founder']);
                $interest->investor?->notify(new InvestorInterestDecisionNotification($interest, $status, $grant !== null));
                $this->notifyDealflowStaff(new DealflowAdminNotification('interest_decided', $interest, $status));
            });

            return $interest;
        });
    }

    public function scheduleIntroduction(
        InvestorInterest $interest,
        User|Founder $actor,
        Carbon|string $scheduledAt,
        ?string $meetingLink = null,
        ?string $notes = null,
        ?string $ipAddress = null,
        ?string $userAgent = null
    ): InvestorInterest {
        return DB::transaction(function () use ($interest, $actor, $scheduledAt, $meetingLink, $notes, $ipAddress, $userAgent) {
            $parsedDate = is_string($scheduledAt) ? Carbon::parse($scheduledAt) : $scheduledAt;

            $updateData = [
                'scheduled_at' => $parsedDate,
                'meeting_link' => $meetingLink,
                'status' => 'approved',
            ];

            if ($actor instanceof User) {
                if ($notes) {
                    $updateData['admin_notes'] = $notes;
                }
            } else {
                if ($notes) {
                    $updateData['founder_notes'] = $notes;
                }
            }

            $interest->update($updateData);

            AuditLog::create([
                'event' => 'introduction.scheduled',
                'actor_type' => $actor::class,
                'actor_id' => $actor->id,
                'auditable_type' => $interest::class,
                'auditable_id' => $interest->id,
                'metadata' => [
                    'profile_id' => $interest->profile_id,
                    'scheduled_at' => $parsedDate->toISOString(),
                    'meeting_link' => $meetingLink,
                ],
                'ip_address' => $ipAddress,
                'user_agent' => $userAgent,
            ]);

            DB::afterCommit(function () use ($interest) {
                $interest->loadMissing(['investor.profile', 'profile.founder']);

                // Notify both investor and founder with Pinpoint-mediated notification
                $interest->investor?->notify(new IntroductionScheduledNotification($interest));
                $interest->profile?->founder?->notify(new IntroductionScheduledNotification($interest));

                // Notify staff
                $this->notifyDealflowStaff(new DealflowAdminNotification('introduction_scheduled', $interest));
            });

            return $interest;
        });
    }

    public function completeIntroduction(
        InvestorInterest $interest,
        User|Founder $actor,
        ?string $notes = null,
        ?string $ipAddress = null,
        ?string $userAgent = null
    ): InvestorInterest {
        return DB::transaction(function () use ($interest, $actor, $notes, $ipAddress, $userAgent) {
            $updateData = [
                'completed_at' => now(),
            ];

            if ($actor instanceof User && $notes) {
                $updateData['admin_notes'] = $notes;
            } elseif ($actor instanceof Founder && $notes) {
                $updateData['founder_notes'] = $notes;
            }

            $interest->update($updateData);

            AuditLog::create([
                'event' => 'introduction.completed',
                'actor_type' => $actor::class,
                'actor_id' => $actor->id,
                'auditable_type' => $interest::class,
                'auditable_id' => $interest->id,
                'metadata' => [
                    'profile_id' => $interest->profile_id,
                    'completed_at' => now()->toISOString(),
                ],
                'ip_address' => $ipAddress,
                'user_agent' => $userAgent,
            ]);

            DB::afterCommit(function () use ($interest) {
                $interest->loadMissing(['investor.profile', 'profile.founder']);

                $interest->investor?->notify(new IntroductionCompletedNotification($interest));
                $interest->profile?->founder?->notify(new IntroductionCompletedNotification($interest));

                $this->notifyDealflowStaff(new DealflowAdminNotification('introduction_completed', $interest));
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
