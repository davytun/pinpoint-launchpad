<?php

namespace App\Http\Controllers\Investor;

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
        $investor = Auth::guard('investor')->user();
        $paginator = $investor->notifications()->latest()->paginate(25);

        return Inertia::render('Notifications/Index', [
            'audience' => 'investor',
            'notifications' => [
                'data' => NotificationPresenter::collection($paginator->getCollection()),
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
            'unread_count' => $investor->unreadNotifications()->count(),
            'read_all_url' => route('investor.notifications.read-all'),
            'read_url_template' => route('investor.notifications.read', ['notification' => '__notification__']),
        ]);
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
