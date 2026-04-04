<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\SendWaitlistEmail;
use App\Models\WaitlistEntry;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Inertia\Inertia;

class WaitlistController extends Controller
{
    private const SORTABLE = ['name', 'email', 'type', 'created_at', 'email_sent_at', 'converted_at'];

    public function index(Request $request): \Inertia\Response
    {
        $type   = $request->query('type');
        $search = trim($request->query('search', ''));
        $sort   = in_array($request->query('sort'), self::SORTABLE) ? $request->query('sort') : 'created_at';
        $dir    = $request->query('dir') === 'asc' ? 'asc' : 'desc';

        $entries = WaitlistEntry::query()
            ->when(in_array($type, ['founder', 'investor']), fn ($q) => $q->where('type', $type))
            ->when($search !== '', fn ($q) => $q->where(fn ($q2) => $q2
                ->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('company_name', 'like', "%{$search}%")
                ->orWhere('firm_name', 'like', "%{$search}%")
            ))
            ->orderBy($sort, $dir)
            ->paginate(15)
            ->withQueryString();

        $allCount = WaitlistEntry::count();

        return Inertia::render('Admin/Waitlist/Index', [
            'entries'    => $entries,
            'activeType' => $type ?? 'all',
            'search'     => $search,
            'sort'       => $sort,
            'dir'        => $dir,
            'totals'     => [
                'all'        => $allCount,
                'founder'    => WaitlistEntry::where('type', 'founder')->count(),
                'investor'   => WaitlistEntry::where('type', 'investor')->count(),
                'email_sent' => WaitlistEntry::whereNotNull('email_sent_at')->count(),
                'converted'  => WaitlistEntry::whereNotNull('converted_at')->count(),
            ],
        ]);
    }

    public function export(): Response
    {
        $entries = WaitlistEntry::orderBy('created_at')->get();

        $headers = [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="waitlist-' . now()->format('Y-m-d') . '.csv"',
            'Pragma'              => 'no-cache',
            'Expires'             => '0',
        ];

        $columns = ['ID', 'Type', 'Name', 'Email', 'Company / Firm', 'Stage / Role', 'Signed Up', 'Email Sent', 'Converted'];
        $csv     = implode(',', $columns) . "\n";

        foreach ($entries as $entry) {
            $csv .= implode(',', [
                $entry->id,
                $entry->type,
                '"' . str_replace('"', '""', $entry->name) . '"',
                '"' . str_replace('"', '""', $entry->email) . '"',
                '"' . str_replace('"', '""', $entry->company_name ?? $entry->firm_name ?? '') . '"',
                $entry->stage ?? $entry->role ?? '',
                $entry->created_at->format('Y-m-d H:i'),
                $entry->email_sent_at?->format('Y-m-d H:i') ?? '',
                $entry->converted_at?->format('Y-m-d H:i') ?? '',
            ]) . "\n";
        }

        return response($csv, 200, $headers);
    }

    public function toggleConverted(WaitlistEntry $entry): RedirectResponse
    {
        $entry->update(['converted_at' => $entry->converted_at ? null : now()]);

        $msg = $entry->converted_at
            ? "{$entry->name} marked as converted."
            : "{$entry->name} conversion mark removed.";

        return back()->with('success', $msg);
    }

    public function resend(WaitlistEntry $entry): RedirectResponse
    {
        SendWaitlistEmail::dispatch($entry);

        return back()->with('success', "Email queued for {$entry->email}.");
    }

    public function destroy(WaitlistEntry $entry): RedirectResponse
    {
        $name = $entry->name;
        $entry->delete();

        return back()->with('success', "{$name} has been removed from the waitlist.");
    }
}
