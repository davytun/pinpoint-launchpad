<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\NotifyInvestorsOfSpotlight;
use App\Models\AuditLog;
use App\Models\FounderProfile;
use App\Models\SpotlightEntry;
use Illuminate\Database\Eloquent\Builder;
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

        if (! in_array($status, ['published', 'ready', 'needs_review'], true)) {
            $status = 'all';
        }

        $directory = $this->spotlightDirectory();

        $totals = [
            'all' => (clone $directory)->count(),
            'published' => $this->whereSpotlightPublished(clone $directory)->count(),
            'ready' => $this->whereSpotlightReady(clone $directory)->count(),
            'needs_review' => $this->whereSpotlightNeedsReview(clone $directory)->count(),
        ];

        $sectors = (clone $directory)
            ->whereNotNull('sector')
            ->where('sector', '!=', '')
            ->distinct()
            ->orderBy('sector')
            ->pluck('sector');

        if ((clone $directory)->where(fn ($query) => $query->whereNull('sector')->orWhere('sector', ''))->exists()) {
            $sectors->prepend('General');
        }

        $list = clone $directory;

        if ($status === 'published') {
            $this->whereSpotlightPublished($list);
        } elseif ($status === 'ready') {
            $this->whereSpotlightReady($list);
        } elseif ($status === 'needs_review') {
            $this->whereSpotlightNeedsReview($list);
        }

        if ($sector !== '' && $sector !== 'all') {
            if ($sector === 'General') {
                $list->where(fn ($query) => $query->where('sector', 'General')->orWhereNull('sector')->orWhere('sector', ''));
            } else {
                $list->where('sector', $sector);
            }
        }

        if ($search !== '') {
            $like = '%'.$search.'%';
            $list->where(function ($query) use ($like) {
                $query->where('spotlight_one_liner', 'like', $like)
                    ->orWhere('sector', 'like', $like)
                    ->orWhereHas('founder', fn ($founder) => $founder->where('company_name', 'like', $like));
            });
        }

        $profiles = $list
            ->with([
                'founder:id,company_name,full_name,email',
                'spotlightEntry',
                'founder.documents' => fn ($query) => $query->where('visibility', 'spotlight'),
                'badges',
            ])
            ->withCount(['badges as verified_badges_count' => fn ($query) => $query->where('is_verified', true)])
            ->latest('verified_at')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (FounderProfile $profile) => $this->spotlightRow($profile));

        return Inertia::render('Admin/Spotlight/Index', [
            'profiles' => $profiles,
            'activeStatus' => $status,
            'activeSector' => $sector !== '' ? $sector : 'all',
            'search' => $search,
            'sectors' => $sectors->unique()->values()->all(),
            'totals' => $totals,
        ]);
    }

    public function update(Request $request, FounderProfile $profile): RedirectResponse
    {
        $data = $request->validate([
            'publish' => ['sometimes', 'boolean'],
            'sector' => ['sometimes', 'nullable', 'string', 'max:50'],
            'batch' => ['sometimes', 'nullable', 'string', 'max:50'],
            'spotlight_one_liner' => ['sometimes', 'nullable', 'string', 'max:120'],
            'spotlight_summary' => ['sometimes', 'nullable', 'string', 'max:500'],
            'mark_deck_reviewed' => ['sometimes', 'boolean'],
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
                'event' => 'spotlight.content_updated',
                'actor_type' => $request->user()::class,
                'actor_id' => $request->user()->id,
                'auditable_type' => $profile::class,
                'auditable_id' => $profile->id,
                'metadata' => ['profile_id' => $profile->id, 'fields' => array_keys($content)],
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        }

        if (array_key_exists('publish', $data)) {
            $shouldPublish = $data['publish'];

            if ($shouldPublish) {
                abort_unless($profile->isLive(), 422, 'Only PARAGON-complete, live profiles can be published to Spotlight.');
                abort_unless($profile->spotlight_one_liner && $profile->spotlight_summary, 422, 'Founder Spotlight content is incomplete.');

                $placeholderCopy = [
                    'What your venture builds and solves, in one compelling sentence...',
                    'Describe the company, market opportunity, business model, and milestones achieved...',
                ];
                abort_if(
                    in_array(trim((string) $profile->spotlight_one_liner), $placeholderCopy, true)
                        || in_array(trim((string) $profile->spotlight_summary), $placeholderCopy, true),
                    422,
                    'Replace placeholder Spotlight copy with the real one-liner and summary before publishing.'
                );

                abort_unless(
                    $profile->founder->documents()->where('visibility', 'spotlight')->where('is_reviewed', true)->where('mime_type', 'application/pdf')->exists(),
                    422,
                    'A reviewed PDF pitch deck is required before publishing.'
                );
            }

            $entry = SpotlightEntry::updateOrCreate(['profile_id' => $profile->id], [
                'published_at' => $shouldPublish ? now() : null,
                'published_by' => $shouldPublish ? $request->user()->id : null,
            ]);
            $profile->update(['is_featured_in_spotlight' => $shouldPublish]);

            AuditLog::create([
                'event' => $shouldPublish ? 'spotlight.published' : 'spotlight.unpublished',
                'actor_type' => $request->user()::class,
                'actor_id' => $request->user()->id,
                'auditable_type' => $entry::class,
                'auditable_id' => $entry->id,
                'metadata' => ['profile_id' => $profile->id],
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            if ($shouldPublish) {
                NotifyInvestorsOfSpotlight::dispatch($profile);
            }

            return back()->with('success', $shouldPublish ? 'Startup published to Spotlight.' : 'Startup removed from Spotlight.');
        }

        return back()->with('success', 'Spotlight updated successfully.');
    }

    private function spotlightDirectory(): Builder
    {
        return FounderProfile::query()->where(function ($query) {
            $query->whereNotNull('spotlight_one_liner')
                ->orWhereNotNull('spotlight_summary')
                ->orWhere(fn ($liveProfiles) => $liveProfiles->where('is_public', true)->whereNotNull('verified_at'));
        });
    }

    private function whereSpotlightPublished(Builder $query): Builder
    {
        return $query->whereHas('spotlightEntry', fn ($entry) => $entry->whereNotNull('published_at'));
    }

    private function whereSpotlightReady(Builder $query): Builder
    {
        return $query
            ->where('is_public', true)
            ->whereNotNull('verified_at')
            ->where(fn ($live) => $live->whereNull('expires_at')->orWhere('expires_at', '>', now()))
            ->whereNotNull('spotlight_one_liner')
            ->where('spotlight_one_liner', '!=', '')
            ->whereNotNull('spotlight_summary')
            ->where('spotlight_summary', '!=', '')
            ->whereHas('founder.documents', fn ($documents) => $documents->where('visibility', 'spotlight')->where('is_reviewed', true))
            ->whereDoesntHave('spotlightEntry', fn ($entry) => $entry->whereNotNull('published_at'));
    }

    private function whereSpotlightNeedsReview(Builder $query): Builder
    {
        return $query->where(function ($query) {
            $query->where('is_public', false)
                ->orWhereNull('verified_at')
                ->orWhere(fn ($expired) => $expired->whereNotNull('expires_at')->where('expires_at', '<=', now()))
                ->orWhereNull('spotlight_one_liner')
                ->orWhere('spotlight_one_liner', '')
                ->orWhereNull('spotlight_summary')
                ->orWhere('spotlight_summary', '')
                ->orWhereDoesntHave('founder.documents', fn ($documents) => $documents->where('visibility', 'spotlight')->where('is_reviewed', true));
        });
    }

    /**
     * @return array<string, mixed>
     */
    private function spotlightRow(FounderProfile $profile): array
    {
        $pitchDeck = $profile->founder?->documents?->first();
        $hasReviewedPitchDeck = $pitchDeck?->is_reviewed ?? false;

        $requirements = collect([
            ! $profile->isLive() ? 'PARAGON verification pending' : null,
            ! $profile->spotlight_one_liner ? 'One-liner is required' : null,
            ! $profile->spotlight_summary ? 'Summary is required' : null,
            ! $hasReviewedPitchDeck ? 'Spotlight pitch deck needs review' : null,
        ])->filter()->values();

        $isPublished = $profile->spotlightEntry?->published_at !== null;

        return [
            'id' => $profile->id,
            'founder_id' => $profile->founder_id,
            'slug' => $profile->slug,
            'company_name' => $profile->founder?->company_name ?? 'Unnamed Company',
            'founder_name' => $profile->founder?->full_name ?? '',
            'founder_email' => $profile->founder?->email ?? '',
            'sector' => $profile->sector ?? 'General',
            'batch' => $profile->batch,
            'overall_score' => $profile->overall_score,
            'is_live' => $profile->isLive(),
            'spotlight_one_liner' => $profile->spotlight_one_liner ?? '',
            'spotlight_summary' => $profile->spotlight_summary ?? '',
            'has_reviewed_pitch_deck' => $hasReviewedPitchDeck,
            'is_published' => $isPublished,
            'published_at' => $profile->spotlightEntry?->published_at?->format('d M Y'),
            'is_ready' => $requirements->isEmpty() && ! $isPublished,
            'needs_review' => $requirements->isNotEmpty(),
            'verified_badges_count' => $profile->verified_badges_count,
            'publish_requirements' => $requirements->all(),
            'badges' => $profile->badges->where('is_verified', true)->map(fn ($badge) => [
                'id' => $badge->id,
                'label' => $badge->label,
                'badge_type' => $badge->badge_type,
            ])->values()->all(),
            'pitch_deck' => $pitchDeck ? [
                'id' => $pitchDeck->id,
                'original_filename' => $pitchDeck->original_filename,
                'is_reviewed' => $pitchDeck->is_reviewed,
                'file_size' => $pitchDeck->file_size,
                'analyst_note' => $pitchDeck->analyst_note,
                'download_url' => route('admin.documents.download', [$profile->founder_id, $pitchDeck->id]),
                'preview_url' => route('admin.documents.preview', [$profile->founder_id, $pitchDeck->id]),
            ] : null,
        ];
    }
}
