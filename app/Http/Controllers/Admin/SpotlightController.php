<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\FounderDocument;
use App\Models\FounderProfile;
use App\Models\Investor;
use App\Models\SpotlightEntry;
use App\Notifications\SpotlightPublishedNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SpotlightController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->string('status')->toString();
        $search = trim($request->string('search')->toString());
        $sector = $request->string('sector')->toString();

        $allProfiles = FounderProfile::with([
            'founder:id,company_name,full_name,email',
            'spotlightEntry',
            'founder.documents',
            'badges',
        ])
            ->withCount(['badges as verified_badges_count' => fn ($query) => $query->where('is_verified', true)])
            ->where(function ($query) {
                $query->whereNotNull('spotlight_one_liner')
                    ->orWhereNotNull('spotlight_summary')
                    ->orWhere(fn ($liveProfiles) => $liveProfiles->where('is_public', true)->whereNotNull('verified_at'));
            })
            ->latest('verified_at')
            ->get()
            ->map(function (FounderProfile $profile) {
                $pitchDeck = $profile->founder?->documents?->where('visibility', 'spotlight')->first();
                $hasReviewedPitchDeck = $pitchDeck?->is_reviewed ?? false;

                $requirements = collect([
                    ! $profile->isLive() ? 'PARAGON verification pending' : null,
                    ! $profile->spotlight_one_liner ? 'One-liner is required' : null,
                    ! $profile->spotlight_summary ? 'Summary is required' : null,
                    ! $hasReviewedPitchDeck ? 'Spotlight pitch deck needs review' : null,
                ])->filter()->values();

                $isPublished = $profile->spotlightEntry?->published_at !== null;
                $isReady = $requirements->isEmpty() && ! $isPublished;
                $needsReview = $requirements->isNotEmpty();

                return [
                    'id'                      => $profile->id,
                    'founder_id'              => $profile->founder_id,
                    'slug'                    => $profile->slug,
                    'company_name'            => $profile->founder?->company_name ?? 'Unnamed Company',
                    'founder_name'            => $profile->founder?->full_name ?? '',
                    'founder_email'           => $profile->founder?->email ?? '',
                    'sector'                  => $profile->sector ?? 'General',
                    'batch'                   => $profile->batch,
                    'overall_score'           => $profile->overall_score,
                    'is_live'                 => $profile->isLive(),
                    'spotlight_one_liner'     => $profile->spotlight_one_liner ?? '',
                    'spotlight_summary'       => $profile->spotlight_summary ?? '',
                    'has_reviewed_pitch_deck' => $hasReviewedPitchDeck,
                    'is_published'            => $isPublished,
                    'published_at'            => $profile->spotlightEntry?->published_at?->format('d M Y'),
                    'is_ready'                => $isReady,
                    'needs_review'            => $needsReview,
                    'verified_badges_count'   => $profile->verified_badges_count,
                    'publish_requirements'    => $requirements->all(),
                    'badges'                  => $profile->badges->where('is_verified', true)->map(fn ($b) => [
                        'id'         => $b->id,
                        'label'      => $b->label,
                        'badge_type' => $b->badge_type,
                    ])->values()->all(),
                    'pitch_deck'              => $pitchDeck ? [
                        'id'                => $pitchDeck->id,
                        'original_filename' => $pitchDeck->original_filename,
                        'is_reviewed'       => $pitchDeck->is_reviewed,
                        'file_size'         => $pitchDeck->file_size,
                        'analyst_note'      => $pitchDeck->analyst_note,
                        'download_url'      => route('admin.documents.download', [$profile->founder_id, $pitchDeck->id]),
                        'preview_url'       => route('admin.documents.preview', [$profile->founder_id, $pitchDeck->id]),
                    ] : null,
                ];
            });

        // Compute totals before local filtering
        $totals = [
            'all'          => $allProfiles->count(),
            'published'    => $allProfiles->where('is_published', true)->count(),
            'ready'        => $allProfiles->where('is_ready', true)->count(),
            'needs_review' => $allProfiles->where('needs_review', true)->count(),
        ];

        // Sectors list for dropdown filter
        $sectors = $allProfiles->pluck('sector')->filter()->unique()->values()->all();

        // Apply tab, search, and sector filters
        $filtered = $allProfiles
            ->when($status === 'published', fn ($c) => $c->where('is_published', true))
            ->when($status === 'ready', fn ($c) => $c->where('is_ready', true))
            ->when($status === 'needs_review', fn ($c) => $c->where('needs_review', true))
            ->when($sector !== '' && $sector !== 'all', fn ($c) => $c->where('sector', $sector))
            ->when($search !== '', function ($c) use ($search) {
                $term = mb_strtolower($search);
                return $c->filter(function ($item) use ($term) {
                    return str_contains(mb_strtolower($item['company_name'] ?? ''), $term)
                        || str_contains(mb_strtolower($item['spotlight_one_liner'] ?? ''), $term)
                        || str_contains(mb_strtolower($item['sector'] ?? ''), $term);
                });
            })
            ->values();

        return Inertia::render('Admin/Spotlight/Index', [
            'profiles'     => $filtered,
            'activeStatus' => $status ?: 'all',
            'activeSector' => $sector ?: 'all',
            'search'       => $search,
            'sectors'      => $sectors,
            'totals'       => $totals,
        ]);
    }

    public function update(Request $request, FounderProfile $profile): RedirectResponse
    {
        $data = $request->validate([
            'publish'             => ['sometimes', 'boolean'],
            'sector'              => ['sometimes', 'nullable', 'string', 'max:50'],
            'batch'               => ['sometimes', 'nullable', 'string', 'max:50'],
            'spotlight_one_liner' => ['sometimes', 'nullable', 'string', 'max:120'],
            'spotlight_summary'   => ['sometimes', 'nullable', 'string', 'max:500'],
            'mark_deck_reviewed'  => ['sometimes', 'boolean'],
        ]);

        abort_unless(
            array_key_exists('publish', $data) || array_key_exists('spotlight_one_liner', $data) || array_key_exists('spotlight_summary', $data) || array_key_exists('mark_deck_reviewed', $data) || array_key_exists('sector', $data) || array_key_exists('batch', $data),
            422,
            'Choose content to update or a publishing action.'
        );

        if ($request->boolean('mark_deck_reviewed')) {
            $deck = $profile->founder?->documents()?->where('visibility', 'spotlight')->first();
            if ($deck) {
                $deck->update([
                    'is_reviewed' => true,
                    'reviewed_at' => now(),
                    'reviewed_by' => $request->user()?->id,
                ]);
            }
        }

        $content = array_intersect_key($data, array_flip(['spotlight_one_liner', 'spotlight_summary', 'sector', 'batch']));

        if ($content !== []) {
            $profile->update($content);

            AuditLog::create([
                'event'          => 'spotlight.content_updated',
                'actor_type'     => $request->user()::class,
                'actor_id'       => $request->user()->id,
                'auditable_type' => $profile::class,
                'auditable_id'   => $profile->id,
                'metadata'       => ['profile_id' => $profile->id, 'fields' => array_keys($content)],
                'ip_address'     => $request->ip(),
                'user_agent'     => $request->userAgent(),
            ]);
        }

        if (array_key_exists('publish', $data)) {
            $shouldPublish = $data['publish'];

            if ($shouldPublish) {
                abort_unless($profile->isLive(), 422, 'Only PARAGON-complete, live profiles can be published to Spotlight.');
                abort_unless($profile->spotlight_one_liner && $profile->spotlight_summary, 422, 'Founder Spotlight content is incomplete.');
                abort_unless($profile->founder->documents()->where('visibility', 'spotlight')->where('is_reviewed', true)->exists(), 422, 'A reviewed pitch deck is required before publishing.');
            }

            $entry = SpotlightEntry::updateOrCreate(['profile_id' => $profile->id], [
                'published_at' => $shouldPublish ? now() : null,
                'published_by' => $shouldPublish ? $request->user()->id : null,
            ]);
            $profile->update(['is_featured_in_spotlight' => $shouldPublish]);

            AuditLog::create([
                'event'          => $shouldPublish ? 'spotlight.published' : 'spotlight.unpublished',
                'actor_type'     => $request->user()::class,
                'actor_id'       => $request->user()->id,
                'auditable_type' => $entry::class,
                'auditable_id'   => $entry->id,
                'metadata'       => ['profile_id' => $profile->id],
                'ip_address'     => $request->ip(),
                'user_agent'     => $request->userAgent(),
            ]);

            if ($shouldPublish) {
                Investor::where('account_status', Investor::ACCOUNT_STATUS_ACTIVE)->each(
                    fn (Investor $investor) => $investor->notify(new SpotlightPublishedNotification($profile))
                );
            }

            return back()->with('success', $shouldPublish ? 'Startup published to Spotlight.' : 'Startup removed from Spotlight.');
        }

        return back()->with('success', 'Spotlight updated successfully.');
    }
}
