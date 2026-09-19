<?php

namespace App\Http\Controllers\Founder;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
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
