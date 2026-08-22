<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Founder;
use App\Models\Investor;
use App\Models\PlatformAnnouncement;
use App\Models\User;
use App\Notifications\PlatformAnnouncementNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PlatformAnnouncementController extends Controller
{
    public function index(): Response { return Inertia::render('Admin/Announcements/Index', ['announcements' => PlatformAnnouncement::latest('published_at')->get()]); }

    public function store(Request $request)
    {
        $data = $request->validate(['type' => ['required', 'in:fundraise,investment,community_event'], 'audience' => ['required', 'in:active_investors,kyc_approved_investors,founders,staff'], 'title' => ['required', 'string', 'max:140'], 'body' => ['required', 'string', 'max:1000'], 'destination_url' => ['nullable', 'url', 'max:2048']]);
        $announcement = PlatformAnnouncement::create([...$data, 'published_by' => $request->user()->id, 'published_at' => now()]);
        $recipients = match ($data['audience']) {
            'active_investors' => Investor::where('account_status', Investor::ACCOUNT_STATUS_ACTIVE)->get(),
            'kyc_approved_investors' => Investor::where('account_status', Investor::ACCOUNT_STATUS_ACTIVE)->where('kyc_status', Investor::KYC_STATUS_APPROVED)->get(),
            'founders' => Founder::all(),
            default => User::whereIn('role', ['superadmin', 'analyst', 'support', 'compliance', 'investor_relations'])->get(),
        };
        $recipients->each(fn ($recipient) => $recipient->notify(new PlatformAnnouncementNotification($announcement)));
        return back()->with('success', 'Announcement published.');
    }
}
