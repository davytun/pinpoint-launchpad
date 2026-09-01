<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditAssignment;
use App\Models\DiagnosticSession;
use App\Models\Founder;
use App\Models\Investor;
use App\Models\InvestorInterest;
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

        $dateRange = request('date_range', 'all');
        $startDate = match ($dateRange) {
            '7d' => now()->subDays(7),
            '30d' => now()->subDays(30),
            'ytd' => now()->startOfYear(),
            '12m' => now()->subMonths(12),
            default => null,
        };

        // All roles
        $metrics['my_open_messages'] = MessageThread::where('admin_unread_count', '>', 0)->count();

        if ($user->canManageAudit()) {
            if ($user->isSuperAdmin()) {
                $metrics['total_founders']   = Founder::when($startDate, fn($q) => $q->where('created_at', '>=', $startDate))->count();
                $metrics['active_audits']    = Payment::where('audit_status', 'in_progress')->count();
                $metrics['pending_audits']   = Payment::where('audit_status', 'pending')->count();
                $metrics['complete_audits']  = Payment::where('audit_status', 'complete')->count();
                $metrics['high_scorers']     = DiagnosticSession::where('score', '>', 85)->when($startDate, fn($q) => $q->where('completed_at', '>=', $startDate))->count();
                $metrics['needs_info_count'] = Payment::where('audit_status', 'needs_info')->count();
            } else {
                $assignedFounderIds = AuditAssignment::where('analyst_id', $user->id)->pluck('founder_id');
                $metrics['my_assigned']      = $assignedFounderIds->count();
                $metrics['active_audits']    = Founder::whereIn('id', $assignedFounderIds)->whereHas('payment', fn ($q) => $q->where('audit_status', 'in_progress'))->count();
                $metrics['needs_info_count'] = Founder::whereIn('id', $assignedFounderIds)->whereHas('payment', fn ($q) => $q->where('audit_status', 'needs_info'))->count();
            }
        }

        if ($user->canAccessFinancials()) {
            $metrics['total_revenue']        = Payment::where('status', 'paid')->when($startDate, fn($q) => $q->where('paid_at', '>=', $startDate))->sum('total_amount');
            $metrics['revenue_by_currency']  = self::revenueByCurrency($startDate);
            $metrics['revenue_this_month']   = Payment::where('status', 'paid')
                ->whereMonth('paid_at', now()->month)
                ->whereYear('paid_at', now()->year)
                ->sum('total_amount');
            $metrics['revenue_by_tier'] = [
                'foundation'   => Payment::where('status', 'paid')->where('tier', 'foundation')->when($startDate, fn($q) => $q->where('paid_at', '>=', $startDate))->sum('total_amount'),
                'growth'       => Payment::where('status', 'paid')->where('tier', 'growth')->when($startDate, fn($q) => $q->where('paid_at', '>=', $startDate))->sum('total_amount'),
                'institutional'=> Payment::where('status', 'paid')->where('tier', 'institutional')->when($startDate, fn($q) => $q->where('paid_at', '>=', $startDate))->sum('total_amount'),
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

            // Funnel Metrics
            $metrics['funnel'] = [
                'signed_up' => Founder::count(),
                'completed_diagnostic' => Founder::whereNotNull('diagnostic_session_id')->count(),
                'uploaded_documents' => Founder::has('documents')->count(),
                'audit_complete' => Founder::whereHas('payment', fn($q) => $q->where('audit_status', 'complete'))->count(),
            ];
        }

        $needsAttention = [];
        $systemAlerts = [];

        // 1. Unread Messages (Everyone)
        $unreadMessagesCount = MessageThread::where('admin_unread_count', '>', 0)->count();
        if ($unreadMessagesCount > 0) {
            $needsAttention[] = [
                'id' => 'unread_messages',
                'title' => 'Unread Messages',
                'description' => 'Founders are waiting for a response.',
                'count' => $unreadMessagesCount,
                'action_url' => '/admin/messages',
                'icon' => 'solar:letter-unread-bold-duotone',
                'color' => 'blue',
            ];
        }

        // 2. Pending KYC (Superadmin & Compliance)
        if ($user->isSuperAdmin() || $user->isCompliance()) {
            $pendingKycCount = Investor::where('kyc_status', 'pending')->count();
            if ($pendingKycCount > 0) {
                $needsAttention[] = [
                    'id' => 'pending_kyc',
                    'title' => 'Pending KYC Reviews',
                    'description' => 'Investor accounts waiting for KYC verification.',
                    'count' => $pendingKycCount,
                    'action_url' => '/admin/investor-accounts?kyc_status=pending',
                    'icon' => 'solar:shield-warning-bold-duotone',
                    'color' => 'amber',
                ];
            }

            // Stuck KYC Alert
            $stuckKycCount = Investor::where('kyc_status', 'pending')
                ->where('updated_at', '<', now()->subHours(48))
                ->count();

            if ($stuckKycCount > 0) {
                $systemAlerts[] = [
                    'id' => 'stuck_kyc',
                    'title' => 'Stuck KYC Checks',
                    'description' => "{$stuckKycCount} pending KYC check" . ($stuckKycCount > 1 ? 's' : '') . ' stuck for >48 hours.',
                    'action_url' => '/admin/investor-accounts?kyc_status=pending',
                    'type' => 'warning',
                ];
            }
        }

        // 3. Dealflow & Introductions (Superadmin & Investor Relations)
        if ($user->isSuperAdmin() || $user->isInvestorRelations()) {
            $pendingInterestsCount = InvestorInterest::where('status', 'pending')->count();
            if ($pendingInterestsCount > 0) {
                $needsAttention[] = [
                    'id' => 'pending_interests',
                    'title' => 'Dealflow Requests',
                    'description' => 'Investor interest and data room requests pending decision.',
                    'count' => $pendingInterestsCount,
                    'action_url' => '/admin/dealflow/interests?status=pending',
                    'icon' => 'solar:folder-with-files-bold-duotone',
                    'color' => 'blue',
                ];
            }

            $scheduledCallsCount = InvestorInterest::where('type', 'founder_call')
                ->whereNotNull('scheduled_at')
                ->whereNull('completed_at')
                ->count();

            if ($scheduledCallsCount > 0) {
                $needsAttention[] = [
                    'id' => 'scheduled_founder_calls',
                    'title' => 'Scheduled Founder Calls',
                    'description' => 'Upcoming coordinated investor-founder calls.',
                    'count' => $scheduledCallsCount,
                    'action_url' => '/admin/dealflow/interests?call_status=scheduled',
                    'icon' => 'solar:phone-calling-bold-duotone',
                    'color' => 'emerald',
                ];
            }
        }

        // 4. Pending Audits (Superadmin & Analysts)
        if ($user->canManageAudit()) {
            $pendingAuditsCount = Payment::where('audit_status', 'pending')->count();
            if ($pendingAuditsCount > 0) {
                $needsAttention[] = [
                    'id' => 'pending_audits',
                    'title' => 'Pending Audits',
                    'description' => "New audits that haven't been started.",
                    'count' => $pendingAuditsCount,
                    'action_url' => '/admin/founders?status=pending',
                    'icon' => 'solar:document-add-bold-duotone',
                    'color' => 'emerald',
                ];
            }

            // Failed Payments Alert (Superadmin only)
            if ($user->isSuperAdmin()) {
                $failedPaymentsCount = Payment::where('status', 'failed')
                    ->where('created_at', '>=', now()->subHours(24))
                    ->count();

                if ($failedPaymentsCount > 0) {
                    $systemAlerts[] = [
                        'id' => 'failed_payments',
                        'title' => 'Failed Payments',
                        'description' => "{$failedPaymentsCount} payment" . ($failedPaymentsCount > 1 ? 's' : '') . ' failed in the last 24 hours.',
                        'action_url' => '/admin/revenue',
                        'type' => 'error',
                    ];
                }
            }
        }

        $recentActivity = $this->getRecentActivity($user);

        return Inertia::render('Admin/Dashboard', [
            'metrics'         => $metrics,
            'recent_activity' => $recentActivity,
            'needs_attention' => $needsAttention,
            'system_alerts'   => $systemAlerts,
            'user_role'       => $user->role,
            'date_range'      => $dateRange,
        ]);
    }

    public function revenue(): Response
    {
        $currency = strtoupper((string) request('currency', 'NGN'));
        $currency = in_array($currency, ['NGN', 'USD'], true) ? $currency : 'NGN';

        return Inertia::render('Admin/Revenue', [
            'metrics'   => self::revenueMetrics($currency),
            'currency'  => $currency,
            'user_role' => Auth::user()->role,
        ]);
    }

    public static function revenueMetrics(string $currency = 'NGN'): array
    {
        $paidPayments = fn () => Payment::query()
            ->where('status', 'paid')
            ->where('currency', $currency);

        return [
            'total_revenue'      => (int) $paidPayments()->sum('total_amount'),
            'revenue_by_currency'=> self::revenueByCurrency(),
            'revenue_this_month' => (int) $paidPayments()
                ->whereMonth('paid_at', now()->month)
                ->whereYear('paid_at', now()->year)
                ->sum('total_amount'),
            'revenue_last_month' => (int) $paidPayments()
                ->whereMonth('paid_at', now()->subMonth()->month)
                ->whereYear('paid_at', now()->subMonth()->year)
                ->sum('total_amount'),
            'revenue_by_tier' => [
                'foundation'    => (int) $paidPayments()->where('tier', 'foundation')->sum('total_amount'),
                'growth'        => (int) $paidPayments()->where('tier', 'growth')->sum('total_amount'),
                'institutional' => (int) $paidPayments()->where('tier', 'institutional')->sum('total_amount'),
            ],
            'monthly_revenue' => collect(range(5, 0))->map(function ($i) use ($currency) {
                $date = now()->subMonths($i);
                return [
                    'month'   => $date->format('M'),
                    'revenue' => (int) Payment::where('status', 'paid')
                        ->where('currency', $currency)
                        ->whereMonth('paid_at', $date->month)
                        ->whereYear('paid_at', $date->year)
                        ->sum('total_amount'),
                ];
            })->values()->all(),
            'recent_payments' => Payment::where('status', 'paid')
                ->where('currency', $currency)
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

    /**
     * Amounts in different currencies must never be added together. Keep the
     * financial dashboard totals explicit until a reporting exchange-rate policy exists.
     */
    private static function revenueByCurrency($startDate = null): array
    {
        $totals = Payment::query()
            ->where('status', 'paid')
            ->when($startDate, fn ($query) => $query->where('paid_at', '>=', $startDate))
            ->selectRaw('UPPER(currency) as currency, SUM(total_amount) as total')
            ->groupBy('currency')
            ->pluck('total', 'currency');

        return [
            'NGN' => (int) ($totals['NGN'] ?? 0),
            'USD' => (int) ($totals['USD'] ?? 0),
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
