<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\InvestorDataRoomGrant;
use App\Services\InvestorInterestWorkflowService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InvestorDataRoomController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Dealflow/DataRooms', [
            'grants' => InvestorDataRoomGrant::with(['investor.profile', 'profile.founder:id,company_name'])
                ->latest()
                ->paginate(20),
            'audit_events' => AuditLog::query()
                ->with('actor')
                ->where(function ($query) {
                    $query->where('event', 'like', 'investor.interest_%')
                        ->orWhere('event', 'like', 'data_room.%');
                })
                ->latest()
                ->limit(20)
                ->get()
                ->map(fn (AuditLog $log) => [
                    'id' => $log->id,
                    'event' => $log->event,
                    'created_at' => $log->created_at?->toISOString(),
                    'actor' => $log->actor?->full_name ?? $log->actor?->name ?? $log->actor?->email ?? 'System',
                    'profile_id' => $log->metadata['profile_id'] ?? null,
                ]),
        ]);
    }

    public function revoke(Request $request, InvestorDataRoomGrant $grant, InvestorInterestWorkflowService $workflow): RedirectResponse
    {
        $workflow->revoke($grant, $request->user(), $request->ip(), $request->userAgent());

        return back()->with('success', 'Data room access revoked successfully.');
    }
}
