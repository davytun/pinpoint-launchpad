<?php

namespace App\Http\Controllers\Investor;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Notifications/Index', ['notifications' => Auth::guard('investor')->user()->notifications()->latest()->paginate(25), 'read_all_url' => route('investor.notifications.read-all'), 'read_url_template' => route('investor.notifications.read', '__notification__')]);
    }

    public function read(string $notification): RedirectResponse
    {
        Auth::guard('investor')->user()->notifications()->whereKey($notification)->firstOrFail()->markAsRead();
        return back();
    }

    public function readAll(): RedirectResponse
    {
        Auth::guard('investor')->user()->unreadNotifications->markAsRead();
        return back();
    }
}
