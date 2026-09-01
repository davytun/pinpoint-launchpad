<?php

namespace App\Http\Controllers\Founder;

use App\Http\Controllers\Controller;
use App\Http\Requests\Founder\UpdateFounderSpotlightRequest;
use App\Models\AuditLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class FounderSpotlightController extends Controller
{
    public function edit(): Response
    {
        $founder = Auth::guard('founder')->user()->load('profile');
        abort_unless($founder->profile, 404);

        return Inertia::render('Founder/Spotlight', [
            'founder' => $founder->only(['id', 'full_name', 'company_name', 'email']),
            'profile' => [
                'spotlight_one_liner' => $founder->profile->spotlight_one_liner,
                'spotlight_summary' => $founder->profile->spotlight_summary,
                'is_featured_in_spotlight' => $founder->profile->is_featured_in_spotlight,
            ],
            'pitch_decks' => $founder->documents()
                ->where(function ($q) {
                    $q->where('category', 'pitch_deck')
                      ->orWhere('visibility', 'spotlight');
                })
                ->latest()
                ->get(['id', 'original_filename', 'is_reviewed', 'created_at']),
            'audit_status' => $founder->payment?->audit_status ?? 'pending',
        ]);
    }

    public function update(UpdateFounderSpotlightRequest $request): RedirectResponse
    {
        $founder = Auth::guard('founder')->user()->load('profile');
        abort_unless($founder->profile, 404);

        $founder->profile->update($request->validated());
        AuditLog::create([
            'event' => 'founder.spotlight_updated',
            'actor_type' => $founder::class,
            'actor_id' => $founder->id,
            'auditable_type' => $founder->profile::class,
            'auditable_id' => $founder->profile->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return back()->with('success', 'Your Spotlight content has been saved for Pinpoint review.');
    }
}
