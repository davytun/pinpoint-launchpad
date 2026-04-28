<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Founder;
use App\Models\FounderDocument;
use App\Services\DocumentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminDocumentController extends Controller
{
    public function __construct(private readonly DocumentService $documents) {}

    public function index(Founder $founder): Response
    {
        $founder->load(['documents.reviewer', 'payment']);

        $documents = $founder->documents()
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn ($doc) => [
                'id'                => $doc->id,
                'category'          => $doc->category,
                'category_label'    => $doc->categoryLabel(),
                'original_filename' => $doc->original_filename,
                'file_size'         => $doc->fileSizeForHumans(),
                'extension'         => $doc->extension,
                'file_icon'         => $doc->fileIcon(),
                'mime_type'         => $doc->mime_type,
                'is_reviewed'       => $doc->is_reviewed,
                'reviewed_at'       => $doc->reviewed_at?->format('d M Y H:i'),
                'reviewed_by'       => $doc->reviewer?->name,
                'analyst_note'      => $doc->analyst_note,
                'created_at'        => $doc->created_at->format('d M Y H:i'),
            ]);

        return Inertia::render('Admin/Documents/Index', [
            'founder'      => [
                'id'           => $founder->id,
                'full_name'    => $founder->full_name,
                'company_name' => $founder->company_name,
                'email'        => $founder->email,
            ],
            'documents'    => $documents,
            'audit_status' => $founder->payment?->audit_status ?? 'pending',
        ]);
    }

    public function download(FounderDocument $document): StreamedResponse
    {
        return $this->documents->download($document);
    }

    public function markReviewed(FounderDocument $document): \Illuminate\Http\RedirectResponse
    {
        $isReviewed = !$document->is_reviewed;

        $document->update([
            'is_reviewed' => $isReviewed,
            'reviewed_at' => $isReviewed ? now() : null,
            'reviewed_by' => $isReviewed ? Auth::id() : null,
        ]);

        return back()->with('success', $isReviewed ? 'Document marked as reviewed.' : 'Document marked as unreviewed.');
    }

    public function addNote(Request $request, FounderDocument $document): \Illuminate\Http\RedirectResponse
    {
        $request->validate([
            'note' => ['required', 'string', 'max:500'],
        ]);

        $document->update(['analyst_note' => $request->input('note')]);

        return back()->with('success', 'Note saved.');
    }
}
