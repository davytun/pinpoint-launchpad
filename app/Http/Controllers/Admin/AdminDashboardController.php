<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditAssignment;
use App\Models\DiagnosticSession;
use App\Models\Founder;
use App\Models\FounderProfile;
use App\Models\Investor;
use App\Models\InvestorInterest;
use App\Models\Message;
use App\Models\MessageThread;
use App\Models\Payment;
use App\Models\PiaApplication;
use App\Models\SpotlightEntry;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function index(): Response
    {
        return $this->dashboard('platform');
    }

    public function founder(): Response
    {
        return $this->dashboard('founder');
    }

    public function investors(): Response
    {
        return $this->dashboard('investors');
    }

    private function dashboard(string $desk): Response
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

        $showFounder = in_array($desk, ['platform', 'founder'], true);
        $showInvestors = in_array($desk, ['platform', 'investors'], true);
        $showPlatform = $desk === 'platform';

        if ($showFounder) {
            $metrics['my_open_messages'] = $user->adminUnreadMessagesCount();

            if ($user->canManageAudit()) {
                if ($user->isSuperAdmin()) {
                    $metrics['total_founders'] = Founder::when($startDate, fn ($q) => $q->where('created_at', '>=', $startDate))->count();
                    $metrics['active_audits'] = Payment::where('audit_status', 'in_progress')->count();
                    $metrics['pending_audits'] = Payment::where('audit_status', 'pending')->count();
                    $metrics['complete_audits'] = Payment::where('audit_status', 'complete')->count();
                    $metrics['high_scorers'] = DiagnosticSession::where('score', '>', 85)->when($startDate, fn ($q) => $q->where('completed_at', '>=', $startDate))->count();
                    $metrics['needs_info_count'] = Payment::where('audit_status', 'needs_info')->count();
                } else {
                    $assignedFounderIds = AuditAssignment::where('analyst_id', $user->id)->pluck('founder_id');
                    $metrics['my_assigned'] = $assignedFounderIds->count();
                    $metrics['active_audits'] = Founder::whereIn('id', $assignedFounderIds)->whereHas('payment', fn ($q) => $q->where('audit_status', 'in_progress'))->count();
                    $metrics['needs_info_count'] = Founder::whereIn('id', $assignedFounderIds)->whereHas('payment', fn ($q) => $q->where('audit_status', 'needs_info'))->count();
                }
            }

            if ($user->canManageAudit() && $user->isSuperAdmin()) {
                $metrics['audit_breakdown'] = [
                    ['label' => 'Pending',     'value' => Payment::where('audit_status', 'pending')->count(),     'color' => '#64748b'],
                    ['label' => 'In Progress', 'value' => Payment::where('audit_status', 'in_progress')->count(), 'color' => '#f59e0b'],
                    ['label' => 'Needs Info',  'value' => Payment::where('audit_status', 'needs_info')->count(),  'color' => '#ef4444'],
                    ['label' => 'On Hold',     'value' => Payment::where('audit_status', 'on_hold')->count(),     'color' => '#f97316'],
                    ['label' => 'Complete',    'value' => Payment::where('audit_status', 'complete')->count(),    'color' => '#10b981'],
                ];

                $metrics['funnel'] = [
                    'signed_up' => Founder::count(),
                    'completed_diagnostic' => Founder::whereNotNull('diagnostic_session_id')->count(),
                    'uploaded_documents' => Founder::has('documents')->count(),
                    'audit_complete' => Founder::whereHas('payment', fn ($q) => $q->where('audit_status', 'complete'))->count(),
                ];
            }
        }

        if ($showInvestors && ($user->isSuperAdmin() || $user->isCompliance() || $user->isInvestorRelations())) {
            $metrics['pending_kyc'] = Investor::where('kyc_status', Investor::KYC_STATUS_PENDING)->count();
            $metrics['approved_kyc'] = Investor::where('kyc_status', Investor::KYC_STATUS_APPROVED)->count();
            $metrics['rejected_kyc'] = Investor::where('kyc_status', Investor::KYC_STATUS_REJECTED)->count();
            $metrics['active_investors'] = Investor::where('account_status', Investor::ACCOUNT_STATUS_ACTIVE)->count();
            $metrics['pending_interests'] = InvestorInterest::where('status', 'pending')->count();
            $metrics['scheduled_founder_calls'] = InvestorInterest::where('type', 'founder_call')
                ->whereNotNull('scheduled_at')
                ->whereNull('completed_at')
                ->count();
        }

        if ($showPlatform && $user->canAccessFinancials()) {
            $metrics['total_revenue'] = Payment::where('status', 'paid')->when($startDate, fn ($q) => $q->where('paid_at', '>=', $startDate))->sum('total_amount');
            $metrics['revenue_by_currency'] = self::revenueByCurrency($startDate);
            $metrics['revenue_this_month'] = Payment::where('status', 'paid')
                ->whereMonth('paid_at', now()->month)
                ->whereYear('paid_at', now()->year)
                ->sum('total_amount');
            $metrics['revenue_by_tier'] = [
                'foundation' => Payment::where('status', 'paid')->where('tier', 'foundation')->when($startDate, fn ($q) => $q->where('paid_at', '>=', $startDate))->sum('total_amount'),
                'growth' => Payment::where('status', 'paid')->where('tier', 'growth')->when($startDate, fn ($q) => $q->where('paid_at', '>=', $startDate))->sum('total_amount'),
                'institutional' => Payment::where('status', 'paid')->where('tier', 'institutional')->when($startDate, fn ($q) => $q->where('paid_at', '>=', $startDate))->sum('total_amount'),
            ];

            $monthly = [];
            for ($i = 5; $i >= 0; $i--) {
                $date = now()->subMonths($i);
                $monthly[] = [
                    'month' => $date->format('M'),
                    'revenue' => (int) Payment::where('status', 'paid')
                        ->whereMonth('paid_at', $date->month)
                        ->whereYear('paid_at', $date->year)
                        ->sum('total_amount'),
                ];
            }
            $metrics['monthly_revenue'] = $monthly;
        }

        $needsAttention = [];
        $systemAlerts = [];

        if ($showFounder) {
            $pendingPiaCount = PiaApplication::query()
                ->whereIn('status', ['pending', 'contacted'])
                ->count();
            if ($pendingPiaCount > 0) {
                $needsAttention[] = [
                    'id' => 'pending_pia',
                    'title' => 'PIA payment requests',
                    'description' => 'Founders waiting for payment confirmation.',
                    'count' => $pendingPiaCount,
                    'action_url' => $desk === 'founder' ? '/admin/founder/pia-requests?status=pending' : '/admin/pia-requests?status=pending',
                    'icon' => 'solar:card-send-bold-duotone',
                    'color' => 'amber',
                ];
            }

            $unreadMessagesCount = $user->adminUnreadMessagesCount();
            if ($unreadMessagesCount > 0) {
                $needsAttention[] = [
                    'id' => 'unread_messages',
                    'title' => 'Unread Messages',
                    'description' => 'Founders are waiting for a response.',
                    'count' => $unreadMessagesCount,
                    'action_url' => '/admin/founder/messages',
                    'icon' => 'solar:letter-unread-bold-duotone',
                    'color' => 'blue',
                ];
            }
        }

        if ($showInvestors && ($user->isSuperAdmin() || $user->isCompliance())) {
            $pendingKycCount = Investor::where('kyc_status', 'pending')->count();
            if ($pendingKycCount > 0) {
                $needsAttention[] = [
                    'id' => 'pending_kyc',
                    'title' => 'Pending KYC Reviews',
                    'description' => 'Investor accounts waiting for KYC verification.',
                    'count' => $pendingKycCount,
                    'action_url' => '/admin/investors/accounts?kyc_status=pending',
                    'icon' => 'solar:shield-warning-bold-duotone',
                    'color' => 'amber',
                ];
            }

            $stuckKycCount = Investor::where('kyc_status', 'pending')
                ->where('updated_at', '<', now()->subHours(48))
                ->count();

            if ($stuckKycCount > 0) {
                $systemAlerts[] = [
                    'id' => 'stuck_kyc',
                    'title' => 'Stuck KYC Checks',
                    'description' => "{$stuckKycCount} pending KYC check".($stuckKycCount > 1 ? 's' : '').' stuck for >48 hours.',
                    'action_url' => '/admin/investors/accounts?kyc_status=pending',
                    'type' => 'warning',
                ];
            }
        }

        if ($showInvestors && ($user->isSuperAdmin() || $user->isInvestorRelations())) {
            $pendingInterestsCount = InvestorInterest::where('status', 'pending')->count();
            if ($pendingInterestsCount > 0) {
                $needsAttention[] = [
                    'id' => 'pending_interests',
                    'title' => 'Dealflow Requests',
                    'description' => 'Investor interest and data room requests pending decision.',
                    'count' => $pendingInterestsCount,
                    'action_url' => '/admin/investors/dealflow/interests?status=pending',
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
                    'action_url' => '/admin/investors/dealflow/interests?call_status=scheduled',
                    'icon' => 'solar:phone-calling-bold-duotone',
                    'color' => 'emerald',
                ];
            }
        }

        if ($showFounder && $user->canManageAudit()) {
            $pendingAuditsCount = Payment::where('audit_status', 'pending')->count();
            if ($pendingAuditsCount > 0) {
                $needsAttention[] = [
                    'id' => 'pending_audits',
                    'title' => 'Pending Audits',
                    'description' => "New audits that haven't been started.",
                    'count' => $pendingAuditsCount,
                    'action_url' => '/admin/founder/founders?status=pending',
                    'icon' => 'solar:document-add-bold-duotone',
                    'color' => 'emerald',
                ];
            }
        }

        if ($showPlatform && $user->isSuperAdmin()) {
            $failedPaymentsCount = Payment::where('status', 'failed')
                ->where('created_at', '>=', now()->subHours(24))
                ->count();

            if ($failedPaymentsCount > 0) {
                $systemAlerts[] = [
                    'id' => 'failed_payments',
                    'title' => 'Failed Payments',
                    'description' => "{$failedPaymentsCount} payment".($failedPaymentsCount > 1 ? 's' : '').' failed in the last 24 hours.',
                    'action_url' => '/admin/revenue',
                    'type' => 'error',
                ];
            }
        }

        $recentActivity = match ($desk) {
            'investors' => $this->getInvestorDeskActivity($user),
            'founder' => $this->getRecentActivity($user),
            default => $user->isSuperAdmin() ? $this->getRecentActivity($user) : [],
        };

        // Dealflow handoff strip is investor-desk context only — not on Founder desk.
        $dealflowHandoff = null;
        if (
            ($desk === 'platform' && $user->isSuperAdmin())
            || ($desk === 'investors' && ($user->isSuperAdmin() || $user->isInvestorRelations()))
        ) {
            $dealflowHandoff = $this->dealflowHandoff();
        }

        $pendingPiaRequests = [];
        if ($desk === 'founder' && $user->canManageAudit()) {
            $pendingPiaRequests = PiaApplication::query()
                ->whereIn('status', ['pending', 'contacted'])
                ->latest()
                ->limit(8)
                ->get()
                ->map(fn (PiaApplication $application) => [
                    'id' => $application->id,
                    'name' => $application->name,
                    'email' => $application->email,
                    'company' => $application->company,
                    'selected_tier' => $application->selected_tier,
                    'status' => $application->status,
                    'created_at' => $application->created_at?->diffForHumans(),
                ])
                ->all();
        }

        return Inertia::render('Admin/Dashboard', [
            'metrics' => $metrics,
            'recent_activity' => $recentActivity,
            'needs_attention' => $needsAttention,
            'system_alerts' => $systemAlerts,
            'dealflow_handoff' => $dealflowHandoff,
            'pending_pia_requests' => $pendingPiaRequests,
            'user_role' => $user->role,
            'date_range' => $dateRange,
            'desk' => $desk,
        ]);
    }

    /**
     * Founder audit → Spotlight publish → investor dealflow bridge counts.
     *
     * @return array{audit_complete: int, ready_to_publish: int, published: int, pending_interests: int}
     */
    private function dealflowHandoff(): array
    {
        $readyToPublish = FounderProfile::query()
            ->where('is_public', true)
            ->whereNotNull('verified_at')
            ->where(function ($query) {
                $query->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->whereNotNull('spotlight_one_liner')
            ->where('spotlight_one_liner', '!=', '')
            ->whereNotNull('spotlight_summary')
            ->where('spotlight_summary', '!=', '')
            ->whereDoesntHave('spotlightEntry', fn ($query) => $query->whereNotNull('published_at'))
            ->whereHas(
                'founder.documents',
                fn ($query) => $query->where('visibility', 'spotlight')->where('is_reviewed', true)
            )
            ->count();

        return [
            'audit_complete' => Payment::where('audit_status', 'complete')->count(),
            'ready_to_publish' => $readyToPublish,
            'published' => SpotlightEntry::whereNotNull('published_at')->count(),
            'pending_interests' => InvestorInterest::where('status', 'pending')->count(),
        ];
    }

    public function revenue(): Response
    {
        $currency = strtoupper((string) request('currency', 'NGN'));
        $currency = in_array($currency, ['NGN', 'USD'], true) ? $currency : 'NGN';

        return Inertia::render('Admin/Revenue', [
            'metrics' => self::revenueMetrics($currency),
            'currency' => $currency,
            'user_role' => Auth::user()->role,
        ]);
    }

    public static function revenueMetrics(string $currency = 'NGN'): array
    {
        $paidPayments = fn () => Payment::query()
            ->where('status', 'paid')
            ->where('currency', $currency);

        return [
            'total_revenue' => (int) $paidPayments()->sum('total_amount'),
            'revenue_by_currency' => self::revenueByCurrency(),
            'revenue_this_month' => (int) $paidPayments()
                ->whereMonth('paid_at', now()->month)
                ->whereYear('paid_at', now()->year)
                ->sum('total_amount'),
            'revenue_last_month' => (int) $paidPayments()
                ->whereMonth('paid_at', now()->subMonth()->month)
                ->whereYear('paid_at', now()->subMonth()->year)
                ->sum('total_amount'),
            'revenue_by_tier' => [
                'foundation' => (int) $paidPayments()->where('tier', 'foundation')->sum('total_amount'),
                'growth' => (int) $paidPayments()->where('tier', 'growth')->sum('total_amount'),
                'institutional' => (int) $paidPayments()->where('tier', 'institutional')->sum('total_amount'),
            ],
            'monthly_revenue' => collect(range(5, 0))->map(function ($i) use ($currency) {
                $date = now()->subMonths($i);

                return [
                    'month' => $date->format('M'),
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
                    'id' => $p->id,
                    'customer_email' => $p->customer_email,
                    'tier' => $p->tier,
                    'total_amount' => $p->total_amount,
                    'currency' => $p->currency,
                    'paid_at' => $p->paid_at?->format('d M Y'),
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

    private function getInvestorDeskActivity($user): array
    {
        if (! ($user->isSuperAdmin() || $user->isCompliance() || $user->isInvestorRelations())) {
            return [];
        }

        $activity = [];

        if ($user->isSuperAdmin() || $user->isCompliance()) {
            Investor::query()
                ->with('profile')
                ->whereIn('kyc_status', [Investor::KYC_STATUS_PENDING, Investor::KYC_STATUS_APPROVED, Investor::KYC_STATUS_REJECTED])
                ->latest('updated_at')
                ->limit(8)
                ->get()
                ->each(function (Investor $investor) use (&$activity) {
                    $activity[] = [
                        'type' => 'kyc',
                        'description' => 'KYC '.$investor->kyc_status.' — '.($investor->profile?->full_name ?? $investor->email),
                        'time' => $investor->updated_at?->diffForHumans() ?? '',
                        'email' => $investor->email,
                    ];
                });
        }

        if ($user->isSuperAdmin() || $user->isInvestorRelations()) {
            InvestorInterest::query()
                ->with(['investor.profile', 'profile.founder'])
                ->latest()
                ->limit(8)
                ->get()
                ->each(function (InvestorInterest $interest) use (&$activity) {
                    $company = $interest->profile?->founder?->company_name ?? 'a startup';
                    $investorName = $interest->investor?->profile?->full_name ?? 'Investor';
                    $activity[] = [
                        'type' => 'interest',
                        'description' => "{$investorName} · {$interest->type} · {$company} ({$interest->status})",
                        'time' => $interest->created_at?->diffForHumans() ?? '',
                        'email' => $interest->investor?->email,
                    ];
                });
        }

        return array_slice($activity, 0, 12);
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
                    'type' => 'diagnostic',
                    'description' => "Diagnostic completed — score {$s->score}",
                    'time' => $s->completed_at?->diffForHumans(),
                    'email' => $s->email,
                ];
            }

            // Recent payments
            $payments = Payment::where('status', 'paid')->with('diagnosticSession:id,email')->latest('paid_at')->limit(5)->get();
            foreach ($payments as $p) {
                $activity[] = [
                    'type' => 'payment',
                    'description' => "Payment received — {$p->tier} tier",
                    'time' => $p->paid_at?->diffForHumans(),
                    'email' => $p->customer_email,
                ];
            }

            // Recent messages
            $messages = Message::where('sender_type', 'founder')->latest()->limit(5)->get();
            foreach ($messages as $m) {
                $activity[] = [
                    'type' => 'message',
                    'description' => 'New founder message',
                    'time' => $m->created_at->diffForHumans(),
                    'email' => null,
                ];
            }
        } else {
            // Analyst: assigned founders' audit status + recent thread activity
            $assignedFounderIds = AuditAssignment::where('analyst_id', $user->id)->pluck('founder_id');

            Founder::query()
                ->with(['payment', 'messageThread'])
                ->whereIn('id', $assignedFounderIds)
                ->latest('updated_at')
                ->limit(8)
                ->get()
                ->each(function (Founder $founder) use (&$activity) {
                    $status = $founder->payment?->audit_status ?? 'unpaid';
                    $activity[] = [
                        'type' => 'message',
                        'description' => ($founder->company_name ?: $founder->full_name).' — audit '.$status,
                        'time' => $founder->updated_at?->diffForHumans() ?? '',
                        'email' => $founder->email,
                    ];
                });

            MessageThread::query()
                ->with('founder:id,email,company_name,full_name')
                ->whereIn('founder_id', $assignedFounderIds)
                ->whereNotNull('last_message_at')
                ->latest('last_message_at')
                ->limit(8)
                ->get()
                ->each(function (MessageThread $thread) use (&$activity) {
                    $label = $thread->admin_unread_count > 0
                        ? 'Unread message from '.($thread->founder?->company_name ?? 'assigned founder')
                        : 'Recent message with '.($thread->founder?->company_name ?? 'assigned founder');

                    $activity[] = [
                        'type' => 'message',
                        'description' => $label,
                        'time' => $thread->last_message_at?->diffForHumans() ?? '',
                        'email' => $thread->founder?->email,
                    ];
                });
        }

        // Sort by most recent first (they're already roughly sorted but mixed)
        return array_slice($activity, 0, 15);
    }
}
