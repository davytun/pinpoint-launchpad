<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Support\NotificationPresenter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(): Response
    {
        $user = Auth::guard('web')->user();
        $paginator = $user->notifications()->latest()->paginate(25);

        return Inertia::render('Notifications/Index', [
            'audience' => 'admin',
            'notifications' => [
                'data' => NotificationPresenter::collection($paginator->getCollection()),
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
            'unread_count' => $user->unreadNotifications()->count(),
            'read_all_url' => route('admin.notifications.read-all'),
            'read_url_template' => route('admin.notifications.read', ['notification' => '__notification__']),
        ]);
    }

    public function read(string $notification): RedirectResponse
    {
        Auth::guard('web')->user()->notifications()->whereKey($notification)->firstOrFail()->markAsRead();

        return back();
    }

    public function readAll(): RedirectResponse
    {
        Auth::guard('web')->user()->unreadNotifications->markAsRead();

        return back();
    }
}
