<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\SendPlatformAnnouncement;
use App\Models\PlatformAnnouncement;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PlatformAnnouncementController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Announcements/Index');
    }

    public function store(Request $request)
    {
        $data = $request->validate(['type' => ['required', 'in:fundraise,investment,community_event'], 'audience' => ['required', 'in:active_investors,kyc_approved_investors,founders,staff'], 'title' => ['required', 'string', 'max:140'], 'body' => ['required', 'string', 'max:1000'], 'destination_url' => ['nullable', 'url', 'max:2048']]);
        $announcement = PlatformAnnouncement::create([...$data, 'published_by' => $request->user()->id, 'published_at' => now()]);
        SendPlatformAnnouncement::dispatch($announcement);

        return back()->with('success', 'Announcement published.');
    }
}
