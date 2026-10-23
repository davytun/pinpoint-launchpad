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

        $staff = Auth::guard('web')->user();
        $founder = Auth::guard('founder')->user();
        $investor = Auth::guard('investor')->user();
        $founderProfile = $founder?->profile;

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'seo' => Seo::forRequest($request),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $staff,
                'founder' => $founder?->only(['id', 'email', 'full_name', 'company_name', 'avatar']),
                'investor' => $investor?->only(['id', 'email', 'account_status', 'kyc_status']),
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'info' => $request->session()->get('info'),
                'agreement_url' => $request->session()->get('agreement_url'),
            ],
            'admin_unread_messages' => $staff?->canAccessFounderAdmin()
                ? $staff->adminUnreadMessagesCount()
                : null,
            'unread_messages_count' => $founder
                ? (int) ($founder->messageThread?->founder_unread_count ?? 0)
                : null,
            'founder_portal' => $founder ? [
                'spotlight_ready' => $founderProfile !== null,
                'pending_diligence_count' => $founderProfile
                    ? (int) $founderProfile->diligenceRequests()->where('status', 'waiting_for_founder')->count()
                    : 0,
            ] : null,
            'platform_unread_notifications' => [
                'admin' => $staff ? (int) $staff->unreadNotifications()->count() : 0,
                'founder' => $founder ? (int) $founder->unreadNotifications()->count() : 0,
                'investor' => $investor ? (int) $investor->unreadNotifications()->count() : 0,
            ],
            'platform_recent_notifications' => [
                'founder' => $founder
                    ? NotificationPresenter::collection($founder->notifications()->latest()->take(5)->get())
                    : [],
                'investor' => $investor
                    ? NotificationPresenter::collection($investor->notifications()->latest()->take(5)->get())
                    : [],
            ],
            'csrf_token' => csrf_token(),
        ];
    }
}
