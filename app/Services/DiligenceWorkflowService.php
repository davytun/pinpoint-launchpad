<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\DiligenceRequest;
use App\Models\Founder;
use App\Models\FounderProfile;
use App\Models\Investor;
use App\Models\InvestorInterest;
use App\Models\User;
use App\Notifications\DealflowAdminNotification;
use App\Notifications\FounderDiligenceRequestedNotification;
use App\Notifications\InvestorDiligenceResponseReadyNotification;
use Illuminate\Support\Facades\DB;

class DiligenceWorkflowService
{
    /**
     * Investor submits a post-introduction diligence inquiry to Pinpoint.
     */
    public function submitRequest(
        Investor $investor,
        FounderProfile $profile,
        array $data,
        ?string $ipAddress = null,
        ?string $userAgent = null
    ): DiligenceRequest {
        return DB::transaction(function () use ($investor, $profile, $data, $ipAddress, $userAgent) {
            $interest = InvestorInterest::query()
                ->where('investor_id', $investor->id)
                ->where('profile_id', $profile->id)
                ->first();

            $diligence = DiligenceRequest::create([
                'investor_id' => $investor->id,
                'profile_id' => $profile->id,
                'interest_id' => $interest?->id,
                'category' => $data['category'] ?? 'general_clarification',
                'subject' => $data['subject'],
                'request_details' => $data['request_details'],
                'data_room_required' => (bool) ($data['data_room_required'] ?? false),
                'status' => 'submitted',
            ]);

            AuditLog::create([
                'event' => 'diligence.request_submitted',
                'actor_type' => $investor::class,
                'actor_id' => $investor->id,
                'auditable_type' => $diligence::class,
                'auditable_id' => $diligence->id,
                'metadata' => [
                    'profile_id' => $profile->id,
                    'category' => $diligence->category,
                    'interest_id' => $interest?->id,
                ],
                'ip_address' => $ipAddress,
                'user_agent' => $userAgent,
            ]);

            DB::afterCommit(function () use ($diligence) {
                $diligence->loadMissing(['investor.profile', 'profile.founder']);
                $this->notifyDealflowStaff(new DealflowAdminNotification('diligence_submitted', null, null, null, $diligence));
            });

            return $diligence;
        });
    }

    /**
     * Admin coordinates with Founder requesting confidential input.
     */
    public function requestFounderResponse(
        DiligenceRequest $request,
        User $admin,
        ?string $instructions = null,
        ?string $ipAddress = null,
        ?string $userAgent = null
    ): DiligenceRequest {
        return DB::transaction(function () use ($request, $admin, $instructions, $ipAddress, $userAgent) {
            $request->update([
                'status' => 'waiting_for_founder',
                'admin_instructions_for_founder' => $instructions,
            ]);

            AuditLog::create([
                'event' => 'diligence.founder_response_requested',
                'actor_type' => $admin::class,
                'actor_id' => $admin->id,
                'auditable_type' => $request::class,
                'auditable_id' => $request->id,
                'metadata' => [
                    'profile_id' => $request->profile_id,
                    'instructions' => $instructions,
                ],
                'ip_address' => $ipAddress,
                'user_agent' => $userAgent,
            ]);

            DB::afterCommit(function () use ($request) {
                $request->loadMissing(['profile.founder']);
                $request->profile?->founder?->notify(new FounderDiligenceRequestedNotification($request));
            });

            return $request;
        });
    }

    /**
     * Founder submits response directly to Pinpoint IR (never direct to investor).
     */
    public function submitFounderResponse(
        DiligenceRequest $request,
        Founder $founder,
        string $responseContent,
        ?string $ipAddress = null,
        ?string $userAgent = null
    ): DiligenceRequest {
        return DB::transaction(function () use ($request, $founder, $responseContent, $ipAddress, $userAgent) {
            $request->update([
                'founder_notes_to_admin' => $responseContent,
                'founder_responded_at' => now(),
                'status' => 'founder_responded',
            ]);

            AuditLog::create([
                'event' => 'diligence.founder_responded',
                'actor_type' => $founder::class,
                'actor_id' => $founder->id,
                'auditable_type' => $request::class,
                'auditable_id' => $request->id,
                'metadata' => [
                    'profile_id' => $request->profile_id,
                ],
                'ip_address' => $ipAddress,
                'user_agent' => $userAgent,
            ]);

            DB::afterCommit(function () use ($request) {
                $request->loadMissing(['investor.profile', 'profile.founder']);
                $this->notifyDealflowStaff(new DealflowAdminNotification('diligence_founder_responded', null, null, null, $request));
            });

            return $request;
        });
    }

    /**
     * Admin approves and releases sanitized/formatted response to Investor.
     */
    public function releaseApprovedResponse(
        DiligenceRequest $request,
        User $admin,
        string $investorResponse,
        bool $markResolved = true,
        ?string $adminNotes = null,
        ?string $ipAddress = null,
        ?string $userAgent = null
    ): DiligenceRequest {
        return DB::transaction(function () use ($request, $admin, $investorResponse, $markResolved, $adminNotes, $ipAddress, $userAgent) {
            $status = $markResolved ? 'resolved' : 'under_review';
            $resolvedAt = $markResolved ? now() : null;

            $updateData = [
                'investor_visible_response' => $investorResponse,
                'status' => $status,
                'resolved_at' => $resolvedAt,
            ];

            if ($adminNotes !== null) {
                $updateData['admin_notes'] = $adminNotes;
            }

            $request->update($updateData);

            AuditLog::create([
                'event' => 'diligence.response_released',
                'actor_type' => $admin::class,
                'actor_id' => $admin->id,
                'auditable_type' => $request::class,
                'auditable_id' => $request->id,
                'metadata' => [
                    'profile_id' => $request->profile_id,
                    'status' => $status,
                ],
                'ip_address' => $ipAddress,
                'user_agent' => $userAgent,
            ]);

            if ($markResolved) {
                AuditLog::create([
                    'event' => 'diligence.resolved',
                    'actor_type' => $admin::class,
                    'actor_id' => $admin->id,
                    'auditable_type' => $request::class,
                    'auditable_id' => $request->id,
                    'metadata' => ['profile_id' => $request->profile_id],
                    'ip_address' => $ipAddress,
                    'user_agent' => $userAgent,
                ]);
            }

            DB::afterCommit(function () use ($request) {
                $request->loadMissing(['investor.profile', 'profile.founder']);
                $request->investor?->notify(new InvestorDiligenceResponseReadyNotification($request));
            });

            return $request;
        });
    }

    /**
     * Admin declines a diligence request.
     */
    public function declineRequest(
        DiligenceRequest $request,
        User $admin,
        ?string $reason = null,
        ?string $ipAddress = null,
        ?string $userAgent = null
    ): DiligenceRequest {
        return DB::transaction(function () use ($request, $admin, $reason, $ipAddress, $userAgent) {
            $request->update([
                'status' => 'declined',
                'investor_visible_response' => $reason ?? 'Pinpoint is unable to fulfill this diligence request.',
                'resolved_at' => now(),
            ]);

            AuditLog::create([
                'event' => 'diligence.declined',
                'actor_type' => $admin::class,
                'actor_id' => $admin->id,
                'auditable_type' => $request::class,
                'auditable_id' => $request->id,
                'metadata' => [
                    'profile_id' => $request->profile_id,
                    'reason' => $reason,
                ],
                'ip_address' => $ipAddress,
                'user_agent' => $userAgent,
            ]);

            DB::afterCommit(function () use ($request) {
                $request->loadMissing(['investor.profile', 'profile.founder']);
                $request->investor?->notify(new InvestorDiligenceResponseReadyNotification($request));
            });

            return $request;
        });
    }

    /**
     * Admin updates the overall deal / engagement progression stage.
     */
    public function updateDealStage(
        InvestorInterest $interest,
        User $admin,
        string $stage,
        ?string $notes = null,
        ?string $ipAddress = null,
        ?string $userAgent = null
    ): InvestorInterest {
        return DB::transaction(function () use ($interest, $admin, $stage, $notes, $ipAddress, $userAgent) {
            $previousStage = $interest->getEngagementStage();

            $updateData = ['deal_stage' => $stage];
            if ($notes) {
                $updateData['admin_notes'] = $notes;
            }

            $interest->update($updateData);

            AuditLog::create([
                'event' => 'engagement.stage_changed',
                'actor_type' => $admin::class,
                'actor_id' => $admin->id,
                'auditable_type' => $interest::class,
                'auditable_id' => $interest->id,
                'metadata' => [
                    'profile_id' => $interest->profile_id,
                    'previous_stage' => $previousStage,
                    'new_stage' => $stage,
                ],
                'ip_address' => $ipAddress,
                'user_agent' => $userAgent,
            ]);

            return $interest;
        });
    }

    private function notifyDealflowStaff(DealflowAdminNotification $notification): void
    {
        User::query()
            ->whereIn('role', ['superadmin', 'investor_relations'])
            ->each(fn (User $user) => $user->notify($notification));
    }
}
