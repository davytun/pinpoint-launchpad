<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\AnalystAssignedMail;
use App\Mail\AuditStatusUpdatedMail;
use App\Mail\NewMessageFounderMail;
use App\Models\AuditAssignment;
use App\Models\Founder;
use App\Models\MessageThread;
use App\Models\Payment;
use App\Models\User;
use App\Services\MessageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class AdminFounderController extends Controller
{
    public function __construct(private readonly MessageService $messageService) {}

    public function index(Request $request): Response
    {
        $user = Auth::user();
        $status = $request->query('status', 'all');
        $analystFilter = $request->query('analyst_id', 'all');
        $search = trim((string) $request->query('search', ''));

        $applyDeskScope = function ($builder) use ($user): void {
            if ($user->isAnalyst()) {
                $builder->whereIn('id', function ($sub) use ($user) {
                    $sub->select('founder_id')
                        ->from('audit_assignments')
                        ->where('analyst_id', $user->id);
                });
            }
        };

        $query = Founder::query()
            ->with([
                'payment',
                'diagnosticSession:id,score,score_band,pillar_scores',
                'profile',
                'signature',
                'messageThread',
                'auditAssignment.analyst',
            ])
            ->withCount('documents');

        $applyDeskScope($query);

        if ($status !== 'all') {
            $query->whereHas('payment', fn ($pq) => $pq->where('audit_status', $status));
        }

        if ($analystFilter !== 'all') {
            if ($analystFilter === 'unassigned') {
                $query->whereDoesntHave('auditAssignment');
            } else {
                $query->whereHas('auditAssignment', fn ($aq) => $aq->where('analyst_id', $analystFilter));
            }
        }

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                    ->orWhere('company_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $totalsQuery = Founder::query();
        $applyDeskScope($totalsQuery);
        $totals = [
            'total' => (clone $totalsQuery)->count(),
            'pending' => (clone $totalsQuery)->where(function ($q) {
                $q->whereHas('payment', fn ($pq) => $pq->where('audit_status', 'pending'))
                    ->orWhereDoesntHave('payment');
            })->count(),
            'in_progress' => (clone $totalsQuery)->whereHas('payment', fn ($pq) => $pq->where('audit_status', 'in_progress'))->count(),
            'needs_info' => (clone $totalsQuery)->whereHas('payment', fn ($pq) => $pq->where('audit_status', 'needs_info'))->count(),
            'on_hold' => (clone $totalsQuery)->whereHas('payment', fn ($pq) => $pq->where('audit_status', 'on_hold'))->count(),
            'complete' => (clone $totalsQuery)->whereHas('payment', fn ($pq) => $pq->where('audit_status', 'complete'))->count(),
            'unassigned' => (clone $totalsQuery)->whereDoesntHave('auditAssignment')->count(),
        ];

        $founders = $query->latest()->paginate(15)->withQueryString()->through(function ($f) {
            $score = $f->score ?? $f->profile?->overall_score;
            $scoreBand = $f->score_band ?? ($score ? ($score >= 85 ? 'high' : ($score >= 75 ? 'mid_high' : ($score >= 60 ? 'mid_low' : 'low'))) : null);
            $tier = $f->tier ?? ($score ? ($score >= 85 ? 'institutional' : ($score >= 70 ? 'growth' : 'foundation')) : 'foundation');

            return [
                'id' => $f->id,
                'full_name' => $f->full_name,
                'company_name' => $f->company_name,
                'email' => $f->email,
                'phone' => $f->phone,
                'score' => $score,
                'score_band' => $scoreBand,
                'tier' => $tier,
                'tier_label' => Payment::getTierLabel($tier),
                'audit_status' => $f->payment?->audit_status ?? 'pending',
                'assigned_analyst' => $f->auditAssignment?->analyst
                    ? [
                        'id' => $f->auditAssignment->analyst->id,
                        'name' => $f->auditAssignment->analyst->name,
                        'email' => $f->auditAssignment->analyst->email,
                    ]
                    : null,
                'assigned_at' => $f->auditAssignment?->assigned_at?->toISOString(),
                'audit_notes' => $f->auditAssignment?->notes,
                'documents_count' => (int) $f->documents_count,
                'signature' => $f->signature ? [
                    'status' => $f->signature->status,
                    'signed_at' => $f->signature->signed_at?->format('d M Y'),
                    'signer_name' => $f->signature->signer_name,
                ] : null,
                'message_thread_id' => $f->messageThread?->id,
                'unread_messages' => $f->messageThread?->admin_unread_count ?? 0,
                'pillar_scores' => $f->diagnosticSession?->pillar_scores,
                'profile' => $f->profile ? [
                    'id' => $f->profile->id,
                    'slug' => $f->profile->slug,
                    'sector' => $f->profile->sector,
                    'batch' => $f->profile->batch,
                    'is_public' => $f->profile->is_public,
                ] : null,
                'created_at' => $f->created_at->toISOString(),
                'created_at_human' => $f->created_at->format('d M Y'),
            ];
        });

        $analysts = $user->isSuperAdmin()
            ? User::where('role', 'analyst')->select('id', 'name', 'email')->get()
            : collect();

        return Inertia::render('Admin/Founders/Index', [
            'founders' => $founders,
            'analysts' => $analysts,
            'user_role' => $user->role,
            'activeStatus' => $status,
            'activeAnalyst' => $analystFilter,
            'search' => $search,
            'totals' => $totals,
        ]);
    }

    public function show(Founder $founder): Response
    {
        $user = Auth::user();

        if (! $user->canAccessFounder($founder->id)) {
            abort(403);
        }

        $founder->load([
            'diagnosticSession:id,score,score_band,pillar_scores',
            'payment',
            'signature',
            'profile.spotlightEntry',
            'auditAssignment.analyst',
        ]);
        $founder->loadCount('documents');

        $thread = $this->messageService->getOrCreateThread($founder);
        $this->messageService->markThreadRead($thread, 'admin');
        $thread->refresh();

        $analysts = $user->isSuperAdmin()
            ? User::where('role', 'analyst')->select('id', 'name', 'email')->get()
            : collect();

        return Inertia::render('Admin/Founders/Show', [
            'founder' => [
                'id' => $founder->id,
                'full_name' => $founder->full_name,
                'company_name' => $founder->company_name,
                'email' => $founder->email,
                'phone' => $founder->phone,
                'created_at' => $founder->created_at->format('d M Y'),
                'last_login_at' => $founder->last_login_at?->format('d M Y, H:i'),
                'score' => $founder->score ?? $founder->profile?->overall_score,
                'score_band' => $founder->score_band,
                'tier' => $founder->tier,
                'pillar_scores' => $founder->diagnosticSession?->pillar_scores,
            ],
            'payment' => $founder->payment ? [
                'id' => $founder->payment->id,
                'tier' => $founder->payment->tier,
                'total_amount' => $founder->payment->total_amount,
                'currency' => $founder->payment->currency,
                'status' => $founder->payment->status,
                'audit_status' => $founder->payment->audit_status,
                'paid_at' => $founder->payment->paid_at?->format('d M Y'),
                'paystack_reference' => $founder->payment->paystack_reference,
            ] : null,
            'signature' => $founder->signature ? [
                'id' => $founder->signature->id,
                'status' => $founder->signature->status,
                'signed_at' => $founder->signature->signed_at?->format('d M Y'),
                'signer_name' => $founder->signature->signer_name,
            ] : null,
            'documents_count' => (int) $founder->documents_count,
            'documents' => Inertia::defer(fn () => $this->documentPayload($founder)),
            'message_thread' => [
                'id' => $thread->id,
                'total_messages' => $thread->messages()->visible()->count(),
                'unread_count' => $thread->admin_unread_count,
            ],
            'thread_messages' => Inertia::defer(fn () => $this->messagePayload($founder, $thread)),
            'profile' => $founder->profile ? [
                'id' => $founder->profile->id,
                'is_live' => $founder->profile->isLive(),
                'is_public' => $founder->profile->is_public,
                'is_published' => $founder->profile->spotlightEntry?->published_at !== null,
                'slug' => $founder->profile->slug,
            ] : null,
            'assignment' => $founder->auditAssignment ? [
                'analyst_id' => $founder->auditAssignment->analyst_id,
                'analyst_name' => $founder->auditAssignment->analyst?->name,
                'assigned_at' => $founder->auditAssignment->assigned_at?->format('d M Y'),
                'notes' => $founder->auditAssignment->notes,
            ] : null,
            'analysts' => $analysts,
            'user_role' => $user->role,
        ]);
    }

    public function panel(Founder $founder): JsonResponse
    {
        $user = Auth::user();

        if (! $user->canAccessFounder($founder->id)) {
            abort(403);
        }

        $thread = $founder->messageThread;

        return response()->json([
            'documents' => $this->documentPayload($founder),
            'messages' => $thread ? $this->messagePayload($founder, $thread) : [],
            'message_thread_id' => $thread?->id,
            'unread_messages' => $thread?->admin_unread_count ?? 0,
        ]);
    }

    public function assign(Request $request, Founder $founder): RedirectResponse
    {
        $request->validate([
            'analyst_id' => ['nullable', 'exists:users,id'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        if (! $request->analyst_id) {
            AuditAssignment::where('founder_id', $founder->id)->delete();

            return back()->with('success', 'Analyst assignment cleared.');
        }

        $analyst = User::findOrFail($request->analyst_id);

        if (! $analyst->isAnalyst()) {
            return back()->withErrors(['analyst_id' => 'Selected user is not an analyst.']);
        }

        AuditAssignment::updateOrCreate(
            ['founder_id' => $founder->id],
            [
                'analyst_id' => $request->analyst_id,
                'assigned_by' => Auth::id(),
                'assigned_at' => now(),
                'notes' => $request->notes,
            ]
        );

        try {
            Mail::to($analyst->email)->queue(new AnalystAssignedMail($analyst, $founder));
        } catch (\Throwable $e) {
            // Queue mail safely
        }

        return back()->with('success', 'Analyst assigned successfully.');
    }

    public function updateAuditStatus(Request $request, Founder $founder): RedirectResponse
    {
        $user = Auth::user();

        if (! $user->canAccessFounder($founder->id)) {
            abort(403);
        }

        $request->validate([
            'audit_status' => ['required', 'in:pending,in_progress,needs_info,on_hold,complete'],
            'audit_notes' => ['nullable', 'string', 'max:2000'],
            'response_message' => ['nullable', 'string', 'max:2000'],
            'send_message_to_founder' => ['nullable', 'boolean'],
        ]);

        $payment = $founder->payment;
        if (! $payment) {
            return back()->withErrors([
                'audit_status' => 'This founder has no payment record. Confirm offline payment before updating audit status.',
            ]);
        }

        $payment->audit_status = $request->audit_status;
        $payment->save();

        // Update or record audit notes
        $notesToSave = $request->audit_notes ?? $request->response_message;
        if (! empty($notesToSave)) {
            AuditAssignment::updateOrCreate(
                ['founder_id' => $founder->id],
                [
                    'analyst_id' => $founder->auditAssignment?->analyst_id ?? ($user->isAnalyst() ? $user->id : null),
                    'assigned_by' => $founder->auditAssignment?->assigned_by ?? Auth::id(),
                    'assigned_at' => $founder->auditAssignment?->assigned_at ?? now(),
                    'notes' => $notesToSave,
                ]
            );
        }

        // Send direct message to founder if requested
        if ($request->send_message_to_founder && ! empty(trim((string) $request->response_message))) {
            $thread = $this->messageService->getOrCreateThread($founder);
            $message = $this->messageService->sendMessage(
                $thread,
                'admin',
                Auth::id(),
                $request->response_message
            );

            try {
                Mail::to($founder->email)->queue(new NewMessageFounderMail($founder, $message));
            } catch (\Throwable $e) {
                // Queue safely
            }
        }

        try {
            Mail::to($founder->email)->queue(new AuditStatusUpdatedMail($founder, $request->audit_status));
        } catch (\Throwable $e) {
            // Queue mail safely
        }

        return back()->with('success', 'Audit status updated and response processed successfully.');
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function documentPayload(Founder $founder): array
    {
        $founder->loadMissing('documents');

        return $founder->documents->map(fn ($document) => [
            'id' => $document->id,
            'original_filename' => $document->original_filename,
            'category' => $document->category,
            'category_label' => $document->categoryLabel(),
            'file_size' => $document->fileSizeForHumans(),
            'reviewed' => $document->is_reviewed,
            'analyst_note' => $document->analyst_note,
            'created_at' => $document->created_at->format('d M Y'),
        ])->values()->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function messagePayload(Founder $founder, MessageThread $thread): array
    {
        return $thread->messages()
            ->visible()
            ->oldest()
            ->get()
            ->map(fn ($message) => [
                'id' => $message->id,
                'sender_type' => $message->sender_type,
                'sender_name' => $message->senderName($founder),
                'body' => $message->body,
                'has_attachment' => $message->has_attachment,
                'attachment_filename' => $message->attachment_filename,
                'attachment_size' => $message->has_attachment ? $message->attachmentSizeForHumans() : null,
                'created_at' => $message->created_at->format('d M, H:i'),
                'created_at_date' => $message->created_at->format('Y-m-d'),
                'is_from_founder' => $message->isFromFounder(),
            ])
            ->values()
            ->all();
    }
}
