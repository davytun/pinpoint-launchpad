<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\FounderProfile;
use App\Models\InvestorDataRoomGrant;
use App\Services\InvestorInterestWorkflowService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InvestorDataRoomController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->query('status', 'all'); // 'all', 'active', 'revoked'
        $search = trim((string) $request->query('search', ''));
        $tab = $request->query('tab', 'grants'); // 'grants', 'audit_trail'

        $query = InvestorDataRoomGrant::query()
            ->with([
                'investor.profile',
                'profile.founder:id,company_name,full_name,email',
                'grantor:id,company_name,full_name,email',
            ])
            ->latest('granted_at');

        if ($status === 'active') {
            $query->whereNull('revoked_at');
        } elseif ($status === 'revoked') {
            $query->whereNotNull('revoked_at');
        }

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->whereHas('investor', fn ($iq) => $iq->where('email', 'like', "%{$search}%")
                    ->orWhereHas('profile', fn ($pq) => $pq->where('full_name', 'like', "%{$search}%")
                        ->orWhere('company_name', 'like', "%{$search}%")))
                    ->orWhereHas('profile.founder', fn ($fq) => $fq->where('company_name', 'like', "%{$search}%")
                        ->orWhere('full_name', 'like', "%{$search}%"));
            });
        }

        $grantTotals = InvestorDataRoomGrant::query()->selectRaw('
            count(*) as total,
            sum(case when revoked_at is null then 1 else 0 end) as active,
            sum(case when revoked_at is not null then 1 else 0 end) as revoked,
            count(distinct case when revoked_at is null then profile_id end) as unique_startups
        ')->first();
        $totals = [
            'total' => (int) $grantTotals->total,
            'active' => (int) $grantTotals->active,
            'revoked' => (int) $grantTotals->revoked,
            'unique_startups' => (int) $grantTotals->unique_startups,
        ];

        $auditLogs = AuditLog::query()
            ->with('actor')
            ->where(function ($query) {
                $query->where('event', 'like', 'investor.interest_%')
                    ->orWhere('event', 'like', 'data_room.%');
            })
            ->latest()
            ->limit(40)
            ->get();

        $profileIds = $auditLogs
            ->map(fn (AuditLog $log) => is_array($log->metadata) ? ($log->metadata['profile_id'] ?? null) : null)
            ->filter()
            ->unique()
            ->values();

        $profilesMap = $profileIds->isEmpty()
            ? collect()
            : FounderProfile::query()
                ->whereIn('id', $profileIds)
                ->with('founder:id,company_name')
                ->get()
                ->keyBy('id')
                ->map(fn ($p) => $p->founder?->company_name ?? 'Startup Profile');

        $auditEvents = $auditLogs
            ->map(function (AuditLog $log) use ($profilesMap) {
                $profileId = is_array($log->metadata) ? ($log->metadata['profile_id'] ?? null) : null;
                $companyName = $profileId && isset($profilesMap[$profileId]) ? $profilesMap[$profileId] : null;

                return [
                    'id' => $log->id,
                    'event' => $log->event,
                    'created_at' => $log->created_at?->toISOString(),
                    'actor' => $log->actor?->full_name ?? $log->actor?->name ?? $log->actor?->email ?? 'System',
                    'profile_id' => $profileId,
                    'startup_name' => $companyName,
                    'metadata' => $log->metadata,
                    'ip_address' => $log->ip_address,
                ];
            });

        return Inertia::render('Admin/Dealflow/DataRooms', [
            'grants' => $query->paginate(15)->withQueryString(),
            'audit_events' => $auditEvents,
            'activeStatus' => $status,
            'activeTab' => $tab,
            'search' => $search,
            'totals' => $totals,
        ]);
    }

    public function revoke(Request $request, InvestorDataRoomGrant $grant, InvestorInterestWorkflowService $workflow): RedirectResponse
    {
        $workflow->revoke($grant, $request->user(), $request->ip(), $request->userAgent());

        return back()->with('success', 'Data room access revoked successfully.');
    }

    public function reinstate(Request $request, InvestorDataRoomGrant $grant, InvestorInterestWorkflowService $workflow): RedirectResponse
    {
        $workflow->reinstate($grant, $request->user(), $request->ip(), $request->userAgent());

        return back()->with('success', 'Data room access reinstated successfully.');
    }
}
