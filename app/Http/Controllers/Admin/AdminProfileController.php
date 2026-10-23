<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DiagnosticSession;
use App\Models\FounderProfile;
use App\Models\VerificationBadge;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AdminProfileController extends Controller
{
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $status = $request->string('status')->toString();
        $search = trim($request->string('search')->toString());

        if (! in_array($status, ['live', 'draft', 'expired'], true)) {
            $status = 'all';
        }

        $scoped = FounderProfile::query();

        if ($user->isAnalyst()) {
            $scoped->whereIn('founder_id', function ($sub) use ($user) {
                $sub->select('founder_id')
                    ->from('audit_assignments')
                    ->where('analyst_id', $user->id);
            });
        }

        $totals = [
            'all' => (clone $scoped)->count(),
            'live' => $this->applyProfileTab(clone $scoped, 'live')->count(),
            'draft' => $this->applyProfileTab(clone $scoped, 'draft')->count(),
            'expired' => $this->applyProfileTab(clone $scoped, 'expired')->count(),
        ];

        $list = $this->applyProfileTab(clone $scoped, $status);

        if ($search !== '') {
            $like = '%'.$search.'%';
            $list->whereHas('founder', function ($founder) use ($like) {
                $founder->where('company_name', 'like', $like)
                    ->orWhere('full_name', 'like', $like)
                    ->orWhere('email', 'like', $like);
            });
        }

        $profiles = $list
            ->with(['founder:id,full_name,company_name,email', 'spotlightEntry'])
            ->withCount(['badges as verified_badges_count' => fn ($q) => $q->where('is_verified', true)])
            ->latest('verified_at')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (FounderProfile $profile) => [
                'id' => $profile->id,
                'slug' => $profile->slug,
                'company_name' => $profile->founder?->company_name,
                'founder_name' => $profile->founder?->full_name,
                'founder_email' => $profile->founder?->email,
                'overall_score' => $profile->overall_score,
                'is_public' => $profile->is_public,
                'is_live' => $profile->isLive(),
                'is_published' => $profile->spotlightEntry?->published_at !== null,
                'is_expired' => $profile->isExpired(),
                'verified_badges_count' => $profile->verified_badges_count,
                'verified_at' => $profile->verified_at?->format('d M Y'),
                'expires_at' => $profile->expires_at?->format('d M Y'),
                'batch' => $profile->batch,
                'sector' => $profile->sector,
            ]);

        return Inertia::render('Admin/Profiles/Index', [
            'profiles' => $profiles,
            'totals' => $totals,
            'activeStatus' => $status,
            'search' => $search,
        ]);
    }

    public function show(FounderProfile $profile): Response
    {
        $this->authorizeProfile($profile);

        $profile->load([
            'founder:id,full_name,company_name,email',
            'badges',
            'investorInterests.investor.profile',
            'spotlightEntry',
        ]);

        $diagnosticSession = null;
        if ($profile->founder?->email) {
            $diagnosticSession = DiagnosticSession::byEmail($profile->founder->email)
                ->latest('completed_at')
                ->first(['id', 'email', 'score', 'score_band', 'pillar_scores', 'completed_at']);
        }

        $radarData = $profile->radar_data;
        $overallScore = $profile->overall_score;

        if ($diagnosticSession) {
            if (empty($radarData) && ! empty($diagnosticSession->pillar_scores)) {
                $radarData = $diagnosticSession->pillar_scores;
            }
            if ($overallScore === null) {
                $overallScore = $diagnosticSession->score;
            }
        }

        $investorInterests = $profile->investorInterests
            ->map(fn ($i) => [
                'id' => $i->id,
                'investor_name' => $i->investor?->profile?->full_name ?? 'Investor',
                'investor_email' => $i->investor?->email ?? '',
                'firm_name' => $i->investor?->profile?->company_name,
                'type' => $i->type,
                'message' => $i->message,
                'status' => $i->status,
                'created_at' => $i->created_at?->toISOString(),
            ])
            ->values()
            ->all();

        return Inertia::render('Admin/Profiles/Show', [
            'profile' => [
                'id' => $profile->id,
                'slug' => $profile->slug,
                'is_public' => $profile->is_public,
                'is_published' => $profile->spotlightEntry?->published_at !== null,
                'overall_score' => $overallScore,
                'radar_data' => $radarData,
                'analyst_summary' => $profile->analyst_summary,
                'batch' => $profile->batch,
                'sector' => $profile->sector,
                'verified_at' => $profile->verified_at?->toISOString(),
                'expires_at' => $profile->expires_at?->toISOString(),
            ],
            'founder' => [
                'id' => $profile->founder?->id,
                'full_name' => $profile->founder?->full_name,
                'company_name' => $profile->founder?->company_name,
                'email' => $profile->founder?->email,
            ],
            'badges' => $profile->badges,
            'investor_interests' => $investorInterests,
        ]);
    }

    public function update(Request $request, FounderProfile $profile): RedirectResponse
    {
        $this->authorizeProfile($profile);

        $validated = $request->validate([
            'analyst_summary' => ['nullable', 'string', 'max:2000'],
            'sector' => ['nullable', 'string', 'max:150'],
            'batch' => ['nullable', 'string', 'max:50'],
            'overall_score' => ['nullable', 'integer', 'min:0', 'max:100'],
            'radar_data' => ['nullable', 'array'],
            'radar_data.*' => ['nullable', 'integer', 'min:0', 'max:100'],
            'is_public' => ['nullable', 'boolean'],
        ]);

        $profile->update(array_filter($validated, fn ($v) => $v !== null));

        return back()->with('success', 'Profile updated successfully.');
    }

    public function updateBadge(Request $request, VerificationBadge $badge): RedirectResponse
    {
        $badge->loadMissing('founderProfile');

        if (! $badge->founderProfile) {
            abort(404);
        }

        $this->authorizeProfile($badge->founderProfile);

        $validated = $request->validate([
            'is_verified' => ['required', 'boolean'],
        ]);

        $badge->update([
            'is_verified' => $validated['is_verified'],
            'verified_at' => $validated['is_verified'] ? now() : null,
        ]);

        return back()->with('success', 'Badge updated.');
    }

    private function applyProfileTab(Builder $query, string $status): Builder
    {
        if ($status === 'live') {
            return $query->where('is_public', true)
                ->whereNotNull('verified_at')
                ->where(fn ($live) => $live->whereNull('expires_at')->orWhere('expires_at', '>', now()));
        }

        if ($status === 'expired') {
            return $query->where('is_public', true)
                ->whereNotNull('expires_at')
                ->where('expires_at', '<=', now());
        }

        if ($status === 'draft') {
            return $query->where(function ($draft) {
                $draft->where('is_public', false)
                    ->orWhere(function ($publicDraft) {
                        $publicDraft->where('is_public', true)
                            ->whereNull('verified_at')
                            ->where(fn ($open) => $open->whereNull('expires_at')->orWhere('expires_at', '>', now()));
                    });
            });
        }

        return $query;
    }

    private function authorizeProfile(FounderProfile $profile): void
    {
        if (! $profile->founder_id || ! Auth::user()->canAccessFounder((string) $profile->founder_id)) {
            abort(403, 'You are not assigned to this founder.');
        }
    }
}
