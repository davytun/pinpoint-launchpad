<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(): Response { return Inertia::render('Notifications/Index', ['notifications' => Auth::guard('web')->user()->notifications()->latest()->paginate(25), 'read_all_url' => route('admin.notifications.read-all'), 'read_url_template' => route('admin.notifications.read', '__notification__')]); }
    public function read(string $notification): RedirectResponse { Auth::guard('web')->user()->notifications()->whereKey($notification)->firstOrFail()->markAsRead(); return back(); }
    public function readAll(): RedirectResponse { Auth::guard('web')->user()->unreadNotifications->markAsRead(); return back(); }
}
