<?php

namespace App\Http\Controllers\Investor;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\FounderDocument;
use App\Models\InvestorDataRoomGrant;
use App\Services\DocumentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class InvestorDataRoomController extends Controller
{
    public function index(): Response
    {
        $investor = Auth::guard('investor')->user();
        abort_unless($investor->canAccessProtectedInvestorContent(), 403, 'KYC approval is required to access data rooms.');

        $grants = $investor->dataRoomGrants()
            ->with('profile.founder:id,company_name')
            ->whereNull('revoked_at')
            ->latest('granted_at')
            ->get()
            ->map(fn (InvestorDataRoomGrant $grant) => [
                'slug' => $grant->profile->slug,
                'company_name' => $grant->profile->founder?->company_name,
                'granted_at' => $grant->granted_at?->toISOString(),
            ]);

        return Inertia::render('Investor/DataRooms/Index', [
            'grants' => $grants,
        ]);
    }

    public function show(string $slug): Response
    {
        $investor = Auth::guard('investor')->user();
        abort_unless($investor->canAccessProtectedInvestorContent(), 403, 'KYC approval is required to access data rooms.');

        $grant = $investor->dataRoomGrants()
            ->whereNull('revoked_at')
            ->whereHas('profile', fn ($q) => $q->where('slug', $slug))
            ->with('profile.founder:id,company_name')
            ->firstOrFail();

        $documents = $grant->profile->founder->documents()
            ->where('visibility', 'data_room')
            ->where('is_reviewed', true)
            ->latest()
            ->get(['id', 'original_filename', 'size_bytes', 'created_at']);

        return Inertia::render('Investor/DataRooms/Show', [
            'company_name' => $grant->profile->founder?->company_name,
            'slug' => $grant->profile->slug,
            'documents' => $documents,
        ]);
    }

    public function download(string $slug, FounderDocument $document, DocumentService $documents): StreamedResponse
    {
        $investor = Auth::guard('investor')->user();
        abort_unless($investor->canAccessProtectedInvestorContent(), 403, 'KYC approval is required to download data room documents.');

        $grant = $investor->dataRoomGrants()
            ->whereNull('revoked_at')
            ->whereHas('profile', fn ($q) => $q->where('slug', $slug))
            ->firstOrFail();

        abort_unless($document->founder_id === $grant->profile->founder_id, 404);
        abort_unless($document->visibility === 'data_room' && $document->is_reviewed, 403, 'Document is not available in the data room.');

        AuditLog::create([
            'event' => 'data_room.document_downloaded',
            'actor_type' => $investor::class,
            'actor_id' => $investor->id,
            'auditable_type' => $document::class,
            'auditable_id' => $document->id,
            'metadata' => ['profile_id' => $grant->profile_id],
        ]);

        return $documents->download($document);
    }
}
