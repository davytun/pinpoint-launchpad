<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\AnalystAssignedMail;
use App\Mail\AuditStatusUpdatedMail;
use App\Models\AuditAssignment;
use App\Models\Founder;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class AdminFounderController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();

        $query = Founder::with([
            'payment',
            'diagnosticSession',
            'auditAssignment.analyst',
        ]);

        if ($user->isAnalyst()) {
            $founderIds = AuditAssignment::where('analyst_id', $user->id)->pluck('founder_id');
            $query->whereIn('id', $founderIds);
        }

        $founders = $query->latest()->paginate(20)->through(fn ($f) => [
            'id'               => $f->id,
            'full_name'        => $f->full_name,
            'company_name'     => $f->company_name,
            'email'            => $f->email,
            'score'            => $f->score,
            'score_band'       => $f->score_band,
            'tier'             => $f->tier,
            'audit_status'     => $f->payment?->audit_status,
            'assigned_analyst' => $f->auditAssignment?->analyst
                ? ['id' => $f->auditAssignment->analyst->id, 'name' => $f->auditAssignment->analyst->name]
                : null,
            'created_at'       => $f->created_at->format('d M Y'),
        ]);

        $analysts = $user->isSuperAdmin()
            ? User::where('role', 'analyst')->select('id', 'name', 'email')->get()
            : collect();

        return Inertia::render('Admin/Founders/Index', [
            'founders'  => $founders,
            'analysts'  => $analysts,
            'user_role' => $user->role,
        ]);
    }

    public function show(Founder $founder): Response
    {
        $user = Auth::user();

        if (!$user->canAccessFounder($founder->id)) {
            abort(403);
        }

        $founder->load([
            'diagnosticSession',
            'payment',
            'signature',
            'profile.badges',
            'documents',
            'messageThread.messages',
            'auditAssignment.analyst',
        ]);

        $analysts = $user->isSuperAdmin()
            ? User::where('role', 'analyst')->select('id', 'name', 'email')->get()
            : collect();

        return Inertia::render('Admin/Founders/Show', [
            'founder'   => [
                'id'           => $founder->id,
                'full_name'    => $founder->full_name,
                'company_name' => $founder->company_name,
                'email'        => $founder->email,
                'phone'        => $founder->phone,
                'created_at'   => $founder->created_at->format('d M Y'),
                'last_login_at'=> $founder->last_login_at?->format('d M Y, H:i'),
                'score'        => $founder->score,
                'score_band'   => $founder->score_band,
                'tier'         => $founder->tier,
                'pillar_scores'=> $founder->diagnosticSession?->pillar_scores,
            ],
            'payment'   => $founder->payment ? [
                'id'            => $founder->payment->id,
                'tier'          => $founder->payment->tier,
                'total_amount'  => $founder->payment->total_amount,
                'currency'      => $founder->payment->currency,
                'status'        => $founder->payment->status,
                'audit_status'  => $founder->payment->audit_status,
                'paid_at'       => $founder->payment->paid_at?->format('d M Y'),
                'paystack_reference' => $founder->payment->paystack_reference,
            ] : null,
            'signature' => $founder->signature ? [
                'id'          => $founder->signature->id,
                'status'      => $founder->signature->status,
                'signed_at'   => $founder->signature->signed_at?->format('d M Y'),
                'signer_name' => $founder->signature->signer_name,
            ] : null,
            'documents' => $founder->documents->map(fn ($d) => [
                'id'               => $d->id,
                'original_filename'=> $d->original_filename,
                'type'             => $d->type,
                'reviewed'         => $d->reviewed,
                'created_at'       => $d->created_at->format('d M Y'),
            ]),
            'message_thread' => $founder->messageThread ? [
                'id'            => $founder->messageThread->id,
                'total_messages'=> $founder->messageThread->messages->count(),
                'unread_count'  => $founder->messageThread->admin_unread_count,
            ] : null,
            'profile' => $founder->profile ? [
                'id'       => $founder->profile->id,
                'is_live'  => $founder->profile->is_live,
                'is_public'=> $founder->profile->is_public,
                'slug'     => $founder->profile->slug,
            ] : null,
            'assignment' => $founder->auditAssignment ? [
                'analyst_id'   => $founder->auditAssignment->analyst_id,
                'analyst_name' => $founder->auditAssignment->analyst?->name,
                'assigned_at'  => $founder->auditAssignment->assigned_at?->format('d M Y'),
                'notes'        => $founder->auditAssignment->notes,
            ] : null,
            'analysts'  => $analysts,
            'user_role' => $user->role,
        ]);
    }

    public function assign(Request $request, Founder $founder): RedirectResponse
    {
        $request->validate([
            'analyst_id' => ['required', 'exists:users,id'],
            'notes'      => ['nullable', 'string', 'max:500'],
        ]);

        $analyst = User::findOrFail($request->analyst_id);

        if (!$analyst->isAnalyst()) {
            return back()->withErrors(['analyst_id' => 'Selected user is not an analyst.']);
        }

        AuditAssignment::updateOrCreate(
            ['founder_id' => $founder->id],
            [
                'analyst_id'  => $request->analyst_id,
                'assigned_by' => Auth::id(),
                'assigned_at' => now(),
                'notes'       => $request->notes,
            ]
        );

        Mail::to($analyst->email)->queue(new AnalystAssignedMail($analyst, $founder));

        return back()->with('success', 'Analyst assigned successfully.');
    }

    public function updateAuditStatus(Request $request, Founder $founder): RedirectResponse
    {
        $user = Auth::user();

        if (!$user->canAccessFounder($founder->id)) {
            abort(403);
        }

        $request->validate([
            'audit_status' => ['required', 'in:pending,in_progress,needs_info,on_hold,complete'],
        ]);

        if (!$founder->payment) {
            return back()->withErrors(['audit_status' => 'No payment record found for this founder.']);
        }

        $founder->payment->audit_status = $request->audit_status;
        $founder->payment->save();

        Mail::to($founder->email)->queue(new AuditStatusUpdatedMail($founder, $request->audit_status));

        return back()->with('success', 'Audit status updated.');
    }
}
