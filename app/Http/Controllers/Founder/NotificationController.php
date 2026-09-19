<?php

namespace App\Http\Controllers\Founder;

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
        $founder = Auth::guard('founder')->user();
        $paginator = $founder->notifications()->latest()->paginate(25);

        return Inertia::render('Notifications/Index', [
            'audience' => 'founder',
            'founder' => $founder->only(['id', 'email', 'full_name', 'company_name', 'avatar']),
            'notifications' => [
                'data' => NotificationPresenter::collection($paginator->getCollection()),
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
            'unread_count' => $founder->unreadNotifications()->count(),
            'read_all_url' => route('founder.notifications.read-all'),
            'read_url_template' => route('founder.notifications.read', ['notification' => '__notification__']),
        ]);
    }

    public function read(string $notification): RedirectResponse
    {
        Auth::guard('founder')->user()->notifications()->whereKey($notification)->firstOrFail()->markAsRead();

        return back();
    }

    public function readAll(): RedirectResponse
    {
        Auth::guard('founder')->user()->unreadNotifications->markAsRead();

        return back();
    }
}
