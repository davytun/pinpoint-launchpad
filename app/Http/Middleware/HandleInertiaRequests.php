<?php

namespace App\Http\Middleware;

use App\Support\NotificationPresenter;
use App\Support\Seo;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        return array_merge(parent::share($request), [
            ...parent::share($request),
            'name' => config('app.name'),
            'seo' => Seo::forRequest($request),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user(),
                'founder' => Auth::guard('founder')->check()
                    ? Auth::guard('founder')->user()->only(['id', 'email', 'full_name', 'company_name', 'avatar'])
                    : null,
                'investor' => Auth::guard('investor')->check()
                    ? Auth::guard('investor')->user()->only(['id', 'email', 'account_status', 'kyc_status'])
                    : null,
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'info' => $request->session()->get('info'),
            ],
            'admin_unread_messages' => ($admin = Auth::guard('web')->user())?->canAccessFounderAdmin()
                ? $admin->adminUnreadMessagesCount()
                : null,
            'unread_messages_count' => Auth::guard('founder')->check()
                ? (int) (Auth::guard('founder')->user()->messageThread?->founder_unread_count ?? 0)
                : null,
            'platform_unread_notifications' => [
                'admin' => Auth::guard('web')->check()
                    ? (Auth::guard('web')->user()->unreadNotifications()->count() ?? 0)
                    : 0,
                'founder' => Auth::guard('founder')->check()
                    ? (Auth::guard('founder')->user()->unreadNotifications()->count() ?? 0)
                    : 0,
                'investor' => Auth::guard('investor')->check()
                    ? (Auth::guard('investor')->user()->unreadNotifications()->count() ?? 0)
                    : 0,
            ],
            'platform_recent_notifications' => [
                'founder' => Auth::guard('founder')->check()
                    ? NotificationPresenter::collection(
                        Auth::guard('founder')->user()->notifications()->latest()->take(5)->get()
                    )
                    : [],
                'investor' => Auth::guard('investor')->check()
                    ? NotificationPresenter::collection(
                        Auth::guard('investor')->user()->notifications()->latest()->take(5)->get()
                    )
                    : [],
            ],
            'csrf_token' => csrf_token(),
        ]);
    }
}
