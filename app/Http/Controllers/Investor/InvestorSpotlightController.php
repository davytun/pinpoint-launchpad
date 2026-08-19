<?php

namespace App\Http\Controllers\Investor;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\SpotlightEntry;
use App\Services\DocumentService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class InvestorSpotlightController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Investor/Spotlight/Index', [
            'entries' => SpotlightEntry::published()
                ->with(['profile.founder:id,company_name', 'profile.badges'])
                ->latest('published_at')
                ->get()
                ->map(fn (SpotlightEntry $entry) => $this->entryCard($entry)),
        ]);
    }

    public function show(string $slug): Response
    {
        $entry = $this->entryForSlug($slug);
        $investor = Auth::guard('investor')->user();
        $pitchDeck = $entry->profile->founder->documents()->where('visibility', 'spotlight')->where('is_reviewed', true)->latest()->first();

        return Inertia::render('Investor/Spotlight/Show', [
            'entry' => array_merge($this->entryCard($entry), [
                'summary' => $entry->profile->spotlight_summary,
                'radar_data' => $entry->profile->radar_data,
                'badges' => $entry->profile->badges()->where('is_verified', true)->get(['id', 'label', 'badge_type']),
                'pitch_deck' => $pitchDeck ? ['original_filename' => $pitchDeck->original_filename] : null,
                'can_view_pitch_deck' => $investor->hasApprovedKyc(),
            ]),
        ]);
    }

    public function downloadPitchDeck(string $slug, DocumentService $documents): StreamedResponse
    {
        $investor = Auth::guard('investor')->user();
        abort_unless($investor->hasApprovedKyc(), 403, 'KYC approval is required to download a pitch deck.');

        $entry = $this->entryForSlug($slug);
        $document = $entry->profile->founder->documents()->where('visibility', 'spotlight')->where('is_reviewed', true)->latest()->firstOrFail();

        AuditLog::create([
            'event' => 'spotlight.pitch_deck_downloaded',
            'actor_type' => $investor::class,
            'actor_id' => $investor->id,
            'auditable_type' => $document::class,
            'auditable_id' => $document->id,
            'metadata' => ['profile_id' => $entry->profile_id],
        ]);

        return $documents->download($document);
    }

    private function entryForSlug(string $slug): SpotlightEntry
    {
        return SpotlightEntry::published()->with(['profile.founder', 'profile.badges'])->whereHas('profile', fn ($query) => $query->where('slug', $slug))->firstOrFail();
    }

    private function entryCard(SpotlightEntry $entry): array
    {
        $profile = $entry->profile;

        return [
            'slug' => $profile->slug,
            'company_name' => $profile->founder?->company_name,
            'spotlight_one_liner' => $profile->spotlight_one_liner,
            'sector' => $profile->sector,
            'batch' => $profile->batch,
            'overall_score' => $profile->overall_score,
            'verified_badges_count' => $profile->badges->where('is_verified', true)->count(),
        ];
    }
}
