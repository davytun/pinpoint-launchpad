<?php

namespace App\Http\Controllers\Founder;

use App\Http\Controllers\Controller;
use App\Mail\DocumentUploadedMail;
use App\Models\FounderDocument;
use App\Services\DocumentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FounderDocumentController extends Controller
{
    public function __construct(private readonly DocumentService $documents) {}

    public function index(): Response
    {
        $founder = Auth::guard('founder')->user()->load(['documents', 'payment']);

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
                'is_reviewed'       => $doc->is_reviewed,
                'is_deletable'      => $doc->isDeletable(),
                'created_at'        => $doc->created_at->format('d M Y'),
            ]);

        $totalCount  = $founder->documents()->count();
        $canUpload   = $totalCount < 20;
        $auditStatus = $founder->payment?->audit_status ?? 'pending';

        return Inertia::render('Founder/Documents/Index', [
            'founder' => [
                'id'           => $founder->id,
                'email'        => $founder->email,
                'full_name'    => $founder->full_name,
                'company_name' => $founder->company_name,
            ],
            'documents'    => $documents,
            'can_upload'   => $canUpload,
            'audit_status' => $auditStatus,
            'categories'   => $this->categoryList(),
            'total_count'  => $totalCount,
            'max_files'    => 20,
        ]);
    }

    public function store(Request $request): \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
    {
        $request->validate([
            'files'    => ['required', 'array', 'min:1'],
            'files.*'  => ['file'],
            'category' => ['required', 'in:cap_table,financial_forecast,bank_statement,pitch_deck,articles_of_incorporation,ip_assignment,customer_contracts,unit_economics,other'],
        ]);

        $founder = Auth::guard('founder')->user()->load('payment');

        if ($founder->payment?->audit_status === 'complete') {
            return $this->uploadError('Your audit is complete. No further documents can be uploaded.', $request);
        }

        $currentCount = $founder->documents()->count();
        $incoming     = count($request->file('files'));

        if ($currentCount >= 20) {
            return $this->uploadError('You have reached the maximum of 20 documents.', $request);
        }

        if ($currentCount + $incoming > 20) {
            return $this->uploadError('Only ' . (20 - $currentCount) . ' more document(s) can be uploaded.', $request);
        }

        $uploaded = 0;
        foreach ($request->file('files') as $file) {
            try {
                $this->documents->validateFile($file);
            } catch (\Illuminate\Validation\ValidationException $e) {
                $msg = collect($e->errors())->flatten()->first() ?? 'Invalid file.';
                return $this->uploadError($msg, $request);
            }

            $document = $this->documents->store($file, $founder, $request->input('category'));

            Mail::to(config('mail.admin_address'))->queue(
                new DocumentUploadedMail($founder, $document)
            );

            $uploaded++;
        }

        $msg = $uploaded === 1 ? 'Document uploaded successfully.' : "{$uploaded} documents uploaded successfully.";

        if ($request->expectsJson()) {
            return response()->json(['message' => $msg]);
        }

        return back()->with('success', $msg);
    }

    private function uploadError(string $message, Request $request): \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
    {
        if ($request->expectsJson()) {
            return response()->json(['errors' => ['files' => $message]], 422);
        }

        return back()->withErrors(['files' => $message]);
    }

    public function download(FounderDocument $document): StreamedResponse
    {
        $this->authorizeDocument($document);

        return $this->documents->download($document);
    }

    public function destroy(FounderDocument $document): \Illuminate\Http\RedirectResponse
    {
        $this->authorizeDocument($document);

        if (!$document->isDeletable()) {
            return back()->withErrors(['file' => 'Documents cannot be deleted once your audit has begun.']);
        }

        $this->documents->delete($document);

        return back()->with('success', 'Document removed successfully.');
    }

    private function authorizeDocument(FounderDocument $document): void
    {
        if ($document->founder_id !== Auth::guard('founder')->user()->id) {
            abort(403, 'Unauthorized');
        }
    }

    private function categoryList(): array
    {
        return [
            ['value' => 'cap_table',                 'label' => 'Cap Table'],
            ['value' => 'financial_forecast',         'label' => 'Financial Forecast'],
            ['value' => 'bank_statement',             'label' => 'Bank Statement'],
            ['value' => 'pitch_deck',                 'label' => 'Pitch Deck'],
            ['value' => 'articles_of_incorporation',  'label' => 'Articles of Incorporation'],
            ['value' => 'ip_assignment',              'label' => 'IP Assignment'],
            ['value' => 'customer_contracts',         'label' => 'Customer Contracts / LOIs'],
            ['value' => 'unit_economics',             'label' => 'Unit Economics Model'],
            ['value' => 'other',                      'label' => 'Other'],
        ];
    }
}
