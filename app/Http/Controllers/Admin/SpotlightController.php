<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\FounderProfile;
use App\Models\SpotlightEntry;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SpotlightController extends Controller
{
    public function index(): Response
    {
        $profiles = FounderProfile::with(['founder:id,company_name', 'spotlightEntry'])
            ->withCount(['badges as verified_badges_count' => fn ($query) => $query->where('is_verified', true)])
            ->whereNotNull('spotlight_one_liner')
            ->whereNotNull('spotlight_summary')
            ->latest('verified_at')
            ->get()
            ->map(fn (FounderProfile $profile) => [
                'id' => $profile->id,
                'company_name' => $profile->founder?->company_name,
                'sector' => $profile->sector,
                'overall_score' => $profile->overall_score,
                'spotlight_one_liner' => $profile->spotlight_one_liner,
                'spotlight_summary' => $profile->spotlight_summary,
                'has_reviewed_pitch_deck' => $profile->founder?->documents()->where('visibility', 'spotlight')->where('is_reviewed', true)->exists() ?? false,
                'is_published' => $profile->spotlightEntry?->published_at !== null,
                'verified_badges_count' => $profile->verified_badges_count,
            ]);

        return Inertia::render('Admin/Spotlight/Index', ['profiles' => $profiles]);
    }

    public function update(Request $request, FounderProfile $profile): RedirectResponse
    {
        $data = $request->validate([
            'publish' => ['sometimes', 'boolean'],
            'spotlight_one_liner' => ['sometimes', 'nullable', 'string', 'max:120'],
            'spotlight_summary' => ['sometimes', 'nullable', 'string', 'max:500'],
        ]);

        abort_unless(array_key_exists('publish', $data) || array_key_exists('spotlight_one_liner', $data) || array_key_exists('spotlight_summary', $data), 422, 'Choose content to update or a publishing action.');

        $content = array_intersect_key($data, array_flip(['spotlight_one_liner', 'spotlight_summary']));

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

        if (! array_key_exists('publish', $data)) {
            return back()->with('success', 'Spotlight content updated.');
        }

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
            'event' => $shouldPublish ? 'spotlight.published' : 'spotlight.unpublished',
            'actor_type' => $request->user()::class,
            'actor_id' => $request->user()->id,
            'auditable_type' => $entry::class,
            'auditable_id' => $entry->id,
            'metadata' => ['profile_id' => $profile->id],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return back()->with('success', $shouldPublish ? 'Startup published to Spotlight.' : 'Startup removed from Spotlight.');
    }
}
