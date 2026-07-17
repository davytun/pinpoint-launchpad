<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\InvestorApplication;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AdminInvestorApplicationController extends Controller
{
    private const SORTABLE = ['name', 'email', 'investor_type', 'created_at', 'status'];

    public function index(Request $request): Response
    {
        $status = $request->query('status');
        $type   = $request->query('type');
        $search = trim($request->query('search', ''));
        $sort   = in_array($request->query('sort'), self::SORTABLE) ? $request->query('sort') : 'created_at';
        $dir    = $request->query('dir') === 'asc' ? 'asc' : 'desc';

        $query = InvestorApplication::query()
            ->when($status, fn ($q) => $q->where('status', $status))
            ->when($type, fn ($q) => $q->where('investor_type', $type))
            ->when($search !== '', fn ($q) => $q->where(fn ($q2) => $q2
                ->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('organisation', 'like', "%{$search}%")
            ));

        $applications = $query->orderBy($sort, $dir)
            ->paginate(15)
            ->withQueryString();

        $totals = [
            'all'               => InvestorApplication::count(),
            'pending'           => InvestorApplication::where('status', 'pending')->count(),
            'approved'          => InvestorApplication::where('status', 'approved')->count(),
            'rejected'          => InvestorApplication::where('status', 'rejected')->count(),
            'request_more_info' => InvestorApplication::where('status', 'request_more_info')->count(),
        ];

        return Inertia::render('Admin/Investors/Index', [
            'applications' => $applications,
            'activeStatus' => $status ?? 'all',
            'activeType'   => $type ?? 'all',
            'search'       => $search,
            'sort'         => $sort,
            'dir'          => $dir,
            'totals'       => $totals,
        ]);
    }

    public function show(InvestorApplication $application): Response
    {
        return Inertia::render('Admin/Investors/Show', [
            'application' => $application,
        ]);
    }

    public function updateStatus(Request $request, InvestorApplication $application): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:pending,approved,rejected,request_more_info'],
        ]);

        $application->update([
            'status' => $validated['status'],
        ]);

        $statusLabels = [
            'pending' => 'pending',
            'approved' => 'approved',
            'rejected' => 'rejected',
            'request_more_info' => 'request more info',
        ];

        return back()->with('success', "Application for {$application->name} marked as {$statusLabels[$validated['status']]}.");
    }
}
