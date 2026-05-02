<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditAssignment;
use App\Models\DiagnosticSession;
use App\Models\Founder;
use App\Models\Message;
use App\Models\MessageThread;
use App\Models\Payment;
use App\Models\WaitlistEntry;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();
        $metrics = [];

        // All roles
        $metrics['my_open_messages'] = MessageThread::where('admin_unread_count', '>', 0)->count();

        if ($user->canManageAudit()) {
            if ($user->isSuperAdmin()) {
                $metrics['total_founders']   = Founder::count();
                $metrics['active_audits']    = Payment::where('audit_status', 'in_progress')->count();
                $metrics['pending_audits']   = Payment::where('audit_status', 'pending')->count();
                $metrics['complete_audits']  = Payment::where('audit_status', 'complete')->count();
                $metrics['high_scorers']     = DiagnosticSession::where('score', '>', 85)->count();
                $metrics['needs_info_count'] = Payment::where('audit_status', 'needs_info')->count();
            } else {
                $assignedFounderIds = AuditAssignment::where('analyst_id', $user->id)->pluck('founder_id');
                $metrics['my_assigned']      = $assignedFounderIds->count();
                $metrics['active_audits']    = Payment::whereIn('founder_id', $assignedFounderIds)->where('audit_status', 'in_progress')->count();
                $metrics['needs_info_count'] = Payment::whereIn('founder_id', $assignedFounderIds)->where('audit_status', 'needs_info')->count();
            }
        }

        if ($user->canAccessFinancials()) {
            $metrics['total_revenue']        = Payment::where('status', 'paid')->sum('total_amount');
            $metrics['revenue_this_month']   = Payment::where('status', 'paid')
                ->whereMonth('paid_at', now()->month)
                ->whereYear('paid_at', now()->year)
                ->sum('total_amount');
            $metrics['revenue_by_tier'] = [
                'foundation'   => Payment::where('status', 'paid')->where('tier', 'foundation')->sum('total_amount'),
                'growth'       => Payment::where('status', 'paid')->where('tier', 'growth')->sum('total_amount'),
                'institutional'=> Payment::where('status', 'paid')->where('tier', 'institutional')->sum('total_amount'),
            ];
            $metrics['waitlist_count'] = [
                'founders'  => WaitlistEntry::where('type', 'founder')->count(),
                'investors' => WaitlistEntry::where('type', 'investor')->count(),
            ];

            // Last 6 months revenue for sparkline
            $monthly = [];
            for ($i = 5; $i >= 0; $i--) {
                $date = now()->subMonths($i);
                $monthly[] = [
                    'month'   => $date->format('M'),
                    'revenue' => (int) Payment::where('status', 'paid')
                        ->whereMonth('paid_at', $date->month)
                        ->whereYear('paid_at', $date->year)
                        ->sum('total_amount'),
                ];
            }
            $metrics['monthly_revenue'] = $monthly;
        }

        if ($user->canManageAudit() && $user->isSuperAdmin()) {
            $metrics['audit_breakdown'] = [
                ['label' => 'Pending',     'value' => Payment::where('audit_status', 'pending')->count(),     'color' => '#64748b'],
                ['label' => 'In Progress', 'value' => Payment::where('audit_status', 'in_progress')->count(), 'color' => '#f59e0b'],
                ['label' => 'Needs Info',  'value' => Payment::where('audit_status', 'needs_info')->count(),  'color' => '#ef4444'],
                ['label' => 'On Hold',     'value' => Payment::where('audit_status', 'on_hold')->count(),     'color' => '#f97316'],
                ['label' => 'Complete',    'value' => Payment::where('audit_status', 'complete')->count(),    'color' => '#10b981'],
            ];
        }

        $recentActivity = $this->getRecentActivity($user);

        return Inertia::render('Admin/Dashboard', [
            'metrics'         => $metrics,
            'recent_activity' => $recentActivity,
            'user_role'       => $user->role,
        ]);
    }

    public function revenue(): Response
    {
        return Inertia::render('Admin/Revenue', [
            'metrics'   => self::revenueMetrics(),
            'user_role' => Auth::user()->role,
        ]);
    }

    public static function revenueMetrics(): array
    {
        return [
            'total_revenue'      => Payment::where('status', 'paid')->sum('total_amount'),
            'revenue_this_month' => Payment::where('status', 'paid')
                ->whereMonth('paid_at', now()->month)
                ->whereYear('paid_at', now()->year)
                ->sum('total_amount'),
            'revenue_last_month' => Payment::where('status', 'paid')
                ->whereMonth('paid_at', now()->subMonth()->month)
                ->whereYear('paid_at', now()->subMonth()->year)
                ->sum('total_amount'),
            'revenue_by_tier' => [
                'foundation'    => Payment::where('status', 'paid')->where('tier', 'foundation')->sum('total_amount'),
                'growth'        => Payment::where('status', 'paid')->where('tier', 'growth')->sum('total_amount'),
                'institutional' => Payment::where('status', 'paid')->where('tier', 'institutional')->sum('total_amount'),
            ],
            'monthly_revenue' => collect(range(5, 0))->map(function ($i) {
                $date = now()->subMonths($i);
                return [
                    'month'   => $date->format('M'),
                    'revenue' => (int) Payment::where('status', 'paid')
                        ->whereMonth('paid_at', $date->month)
                        ->whereYear('paid_at', $date->year)
                        ->sum('total_amount'),
                ];
            })->values()->all(),
            'recent_payments' => Payment::where('status', 'paid')
                ->with('diagnosticSession:id,email')
                ->latest('paid_at')
                ->limit(20)
                ->get()
                ->map(fn ($p) => [
                    'id'                 => $p->id,
                    'customer_email'     => $p->customer_email,
                    'tier'               => $p->tier,
                    'total_amount'       => $p->total_amount,
                    'currency'           => $p->currency,
                    'paid_at'            => $p->paid_at?->format('d M Y'),
                    'paystack_reference' => $p->paystack_reference,
                ]),
        ];
    }

    private function getRecentActivity($user): array
    {
        $activity = [];

        if ($user->isSuperAdmin()) {
            // Recent diagnostic completions
            $sessions = DiagnosticSession::whereNotNull('completed_at')
                ->latest('completed_at')
                ->limit(5)
                ->get();
            foreach ($sessions as $s) {
                $activity[] = [
                    'type'        => 'diagnostic',
                    'description' => "Diagnostic completed — score {$s->score}",
                    'time'        => $s->completed_at?->diffForHumans(),
                    'email'       => $s->email,
                ];
            }

            // Recent payments
            $payments = Payment::where('status', 'paid')->with('diagnosticSession:id,email')->latest('paid_at')->limit(5)->get();
            foreach ($payments as $p) {
                $activity[] = [
                    'type'        => 'payment',
                    'description' => "Payment received — {$p->tier} tier",
                    'time'        => $p->paid_at?->diffForHumans(),
                    'email'       => $p->customer_email,
                ];
            }

            // Recent messages
            $messages = Message::where('sender_type', 'founder')->latest()->limit(5)->get();
            foreach ($messages as $m) {
                $activity[] = [
                    'type'        => 'message',
                    'description' => 'New founder message',
                    'time'        => $m->created_at->diffForHumans(),
                    'email'       => null,
                ];
            }
        } else {
            // Analyst: only their assigned founders' activity
            $assignedFounderIds = AuditAssignment::where('analyst_id', $user->id)->pluck('founder_id');
            $messages = MessageThread::whereIn('founder_id', $assignedFounderIds)
                ->where('admin_unread_count', '>', 0)
                ->latest('last_message_at')
                ->limit(10)
                ->get();
            foreach ($messages as $t) {
                $activity[] = [
                    'type'        => 'message',
                    'description' => 'Unread message from assigned founder',
                    'time'        => $t->last_message_at?->diffForHumans(),
                    'email'       => null,
                ];
            }
        }

        // Sort by most recent first (they're already roughly sorted but mixed)
        return array_slice($activity, 0, 15);
    }
}
