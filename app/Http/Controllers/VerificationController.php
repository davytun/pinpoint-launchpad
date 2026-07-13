<?php

namespace App\Http\Controllers;

use App\Mail\InvestorAccessRequestMail;
use App\Models\FounderDocument;
use App\Models\FounderProfile;
use App\Models\InvestorAccessRequest;
use App\Services\DocumentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class VerificationController extends Controller
{
    public function show(Request $request, string $slug): Response
    {
        $profile = FounderProfile::where('slug', $slug)
            ->with([
                'founder:id,full_name,company_name',
                'badges',
                'payment:id,tier',
            ])
            ->first();

        if (! $profile) {
            abort(404);
        }

        if (! $profile->is_public) {
            return Inertia::render('Verification/NotLive');
        }

        if ($profile->isExpired()) {
            return Inertia::render('Verification/Expired');
        }

        $verifiedBadges = $profile->badges->where('is_verified', true)->values();

        // Access token verification
        $token = $request->query('token');
        $isUnlocked = false;
        $unlockedDocuments = [];

        if ($token) {
            $accessRequest = $profile->investorAccessRequests()
                ->where('token', $token)
                ->where('status', 'approved')
                ->first();

            if ($accessRequest) {
                $isUnlocked = true;
                $unlockedDocuments = $profile->founder->documents()
                    ->where('is_reviewed', true)
                    ->get()
                    ->map(fn ($doc) => [
                        'id'        => $doc->id,
                        'name'      => $doc->original_filename,
                        'category'  => $doc->categoryLabel(),
                        'size'      => $doc->fileSizeForHumans(),
                        'extension' => $doc->extension,
                    ]);
            }
        }

        return Inertia::render('Verification/Show', [
            'profile_id'           => $profile->id,
            'founder_name'         => $profile->founder->full_name,
            'company_name'         => $profile->founder->company_name,
            'sector'               => $profile->sector,
            'batch'                => $profile->batch,
            'overall_score'        => $profile->overall_score,
            'radar_data'           => $profile->radar_data,
            'analyst_summary'      => $profile->analyst_summary,
            'badges'               => $verifiedBadges,
            'tier'                 => $profile->payment?->tier,
            'verified_at'          => $profile->verified_at?->format('d M Y'),
            'expires_at'           => $profile->expires_at?->format('d M Y'),
            'days_until_expiry'    => $profile->daysUntilExpiry(),
            'access_request_count' => $profile->investorAccessRequests()->count(),
            'is_sample'            => false,
            'slug'                 => $profile->slug,
            'is_unlocked'          => $isUnlocked,
            'token'                => $token,
            'unlocked_documents'   => $unlockedDocuments,
        ]);
    }

    public function sample(): Response
    {
        return Inertia::render('Verification/Show', [
            'profile_id'        => null,
            'founder_name'      => 'SampleUnicorn AI',
            'company_name'      => 'SampleUnicorn AI',
            'sector'            => 'B2B SaaS / Infrastructure',
            'batch'             => 'Spring 2026',
            'overall_score'     => 88,
            'radar_data'        => [
                'potential'  => 90,
                'agility'    => 85,
                'risk'       => 80,
                'alignment'  => 95,
                'governance' => 85,
                'operations' => 88,
                'network'    => 90,
            ],
            'analyst_summary'   => 'SampleUnicorn AI demonstrates exceptional Agility and Operations metrics. Their proprietary LLM-orchestration layer has 18 months of IP-protection runway. We have verified their Cap Table as Clean with 85% founder retention. The primary growth lever is their 4.2x LTV/CAC ratio, verified via 6 months of historical Stripe data.',
            'badges'            => [
                ['badge_type' => 'legal',          'label' => 'LEGAL: VERIFIED',          'is_verified' => true],
                ['badge_type' => 'financial',      'label' => 'FINANCING: VERIFIED',       'is_verified' => true],
                ['badge_type' => 'tech_stack',     'label' => 'TECH STACK: AUDITED',       'is_verified' => true],
                ['badge_type' => 'cap_table',      'label' => 'CAP TABLE: CLEAN',          'is_verified' => true],
                ['badge_type' => 'ip_ownership',   'label' => 'IP OWNERSHIP: CONFIRMED',   'is_verified' => true],
                ['badge_type' => 'unit_economics', 'label' => 'UNIT ECONOMICS: VERIFIED',  'is_verified' => true],
                ['badge_type' => 'market_size',    'label' => 'MARKET SIZE: VALIDATED',    'is_verified' => true],
            ],
            'tier'              => 'institutional',
            'verified_at'       => '01 Feb 2026',
            'expires_at'        => '02 May 2026',
            'days_until_expiry' => 4,
            'is_sample'         => true,
            'access_request_count' => 0,
            'slug'              => 'sample-unicorn',
            'is_unlocked'       => false,
            'token'             => null,
            'unlocked_documents' => [],
        ]);
    }

    public function requestAccess(Request $request, string $slug): RedirectResponse
    {
        $validated = $request->validate([
            'investor_name'  => ['required', 'string', 'max:100'],
            'investor_email' => ['required', 'email'],
            'firm_name'      => ['nullable', 'string', 'max:150'],
            'linkedin_url'   => ['nullable', 'url', 'max:255'],
            'message'        => ['nullable', 'string', 'max:500'],
        ]);

        $profile = FounderProfile::where('slug', $slug)->first();

        if (! $profile) {
            abort(404);
        }

        if (! $profile->isLive()) {
            abort(403);
        }

        $existing = InvestorAccessRequest::where('profile_id', $profile->id)
            ->where('investor_email', $validated['investor_email'])
            ->exists();

        if ($existing) {
            return back()->with('info', 'You have already requested access to this data room.');
        }

        $accessRequest = InvestorAccessRequest::create([
            'profile_id'     => $profile->id,
            'investor_name'  => $validated['investor_name'],
            'investor_email' => $validated['investor_email'],
            'firm_name'      => $validated['firm_name'] ?? null,
            'linkedin_url'   => $validated['linkedin_url'] ?? null,
            'message'        => $validated['message'] ?? null,
            'ip_address'     => $request->ip(),
            'token'          => Str::random(32),
            'status'         => 'pending',
        ]);

        $founder = $profile->founder;

        Mail::to($founder->email)->send(new InvestorAccessRequestMail(
            $founder,
            $profile,
            $validated['investor_name'],
            $validated['firm_name'] ?? null,
            $validated['investor_email']
        ));

        $accessRequest->update(['notified_founder_at' => now()]);

        return back()->with('success', 'Your request has been submitted. The founder will be in touch shortly.');
    }

    public function downloadDocument(Request $request, string $slug, FounderDocument $document): StreamedResponse
    {
        $profile = FounderProfile::where('slug', $slug)->firstOrFail();
        $token = $request->query('token');

        if (! $token) {
            abort(403, 'Unauthorized access: token missing.');
        }

        $accessRequest = $profile->investorAccessRequests()
            ->where('token', $token)
            ->where('status', 'approved')
            ->first();

        if (! $accessRequest) {
            abort(403, 'Unauthorized access: invalid or unapproved token.');
        }

        if ($document->founder_id !== $profile->founder_id) {
            abort(403, 'Unauthorized access: document mismatch.');
        }

        /** @var DocumentService $documentService */
        $documentService = app(DocumentService::class);

        return $documentService->download($document);
    }
}
