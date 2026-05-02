<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FounderProfile;
use App\Models\VerificationBadge;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminProfileController extends Controller
{
    public function index(): Response
    {
        $profiles = FounderProfile::with(['founder:id,full_name,company_name,email'])
            ->withCount(['badges as verified_badges_count' => fn ($q) => $q->where('is_verified', true)])
            ->latest('verified_at')
            ->get()
            ->map(fn ($p) => [
                'id'                   => $p->id,
                'slug'                 => $p->slug,
                'company_name'         => $p->founder?->company_name,
                'founder_name'         => $p->founder?->full_name,
                'founder_email'        => $p->founder?->email,
                'overall_score'        => $p->overall_score,
                'is_public'            => $p->is_public,
                'is_live'              => $p->isLive(),
                'is_expired'           => $p->isExpired(),
                'verified_badges_count'=> $p->verified_badges_count,
                'verified_at'          => $p->verified_at?->format('d M Y'),
                'expires_at'           => $p->expires_at?->format('d M Y'),
                'batch'                => $p->batch,
                'sector'               => $p->sector,
            ]);

        return Inertia::render('Admin/Profiles/Index', [
            'profiles' => $profiles,
        ]);
    }

    public function show(FounderProfile $profile): Response
    {
        $profile->load([
            'founder:id,full_name,company_name,email',
            'badges',
            'investorAccessRequests',
        ]);

        return Inertia::render('Admin/Profiles/Show', [
            'profile' => [
                'id'              => $profile->id,
                'slug'            => $profile->slug,
                'is_public'       => $profile->is_public,
                'overall_score'   => $profile->overall_score,
                'radar_data'      => $profile->radar_data,
                'analyst_summary' => $profile->analyst_summary,
                'batch'           => $profile->batch,
                'sector'          => $profile->sector,
                'verified_at'     => $profile->verified_at?->toISOString(),
                'expires_at'      => $profile->expires_at?->toISOString(),
            ],
            'founder' => [
                'id'           => $profile->founder?->id,
                'full_name'    => $profile->founder?->full_name,
                'company_name' => $profile->founder?->company_name,
                'email'        => $profile->founder?->email,
            ],
            'badges'           => $profile->badges,
            'access_requests'  => $profile->investorAccessRequests,
        ]);
    }

    public function update(Request $request, FounderProfile $profile): RedirectResponse
    {
        $validated = $request->validate([
            'analyst_summary' => ['nullable', 'string', 'max:2000'],
            'sector'          => ['nullable', 'string', 'max:150'],
            'batch'           => ['nullable', 'string', 'max:50'],
            'overall_score'   => ['nullable', 'integer', 'min:0', 'max:100'],
            'radar_data'      => ['nullable', 'array'],
            'radar_data.*'    => ['nullable', 'integer', 'min:0', 'max:100'],
            'is_public'       => ['nullable', 'boolean'],
        ]);

        $profile->update(array_filter($validated, fn ($v) => $v !== null));

        return back()->with('success', 'Profile updated successfully.');
    }

    public function updateBadge(Request $request, VerificationBadge $badge): RedirectResponse
    {
        $validated = $request->validate([
            'is_verified' => ['required', 'boolean'],
        ]);

        $badge->update([
            'is_verified' => $validated['is_verified'],
            'verified_at' => $validated['is_verified'] ? now() : null,
        ]);

        return back()->with('success', 'Badge updated.');
    }

    public function accessRequests(FounderProfile $profile): Response
    {
        $profile->load([
            'founder:id,full_name,company_name',
            'investorAccessRequests',
        ]);

        return Inertia::render('Admin/Profiles/AccessRequests', [
            'profile'         => [
                'id'           => $profile->id,
                'slug'         => $profile->slug,
                'company_name' => $profile->founder?->company_name,
            ],
            'access_requests' => $profile->investorAccessRequests,
        ]);
    }
}
