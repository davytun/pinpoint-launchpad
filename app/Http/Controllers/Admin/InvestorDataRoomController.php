<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\InvestorDataRoomGrant;
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
        ]);
    }

    public function revoke(Request $request, InvestorDataRoomGrant $grant): RedirectResponse
    {
        $grant->update(['revoked_at' => now()]);

        AuditLog::create([
            'event' => 'admin.data_room_revoked',
            'actor_type' => $request->user()::class,
            'actor_id' => $request->user()->id,
            'auditable_type' => $grant::class,
            'auditable_id' => $grant->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return back()->with('success', 'Data room access revoked successfully.');
    }
}
