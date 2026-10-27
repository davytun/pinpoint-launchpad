<?php

namespace App\Http\Controllers\Founder;

use App\Http\Controllers\Controller;
use App\Mail\DocumentUploadedMail;
use App\Models\FounderDocument;
use App\Services\DocumentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FounderDocumentController extends Controller
{
    public function __construct(private readonly DocumentService $documents) {}

    public function index(): Response
    {
        /** @var Founder $founder */
        $founder = Auth::guard('founder')->user()->load('payment');

        $grouped = $founder->documents()->get()->groupBy('category');

        $mapDoc = fn (FounderDocument $doc) => [
            'id' => $doc->id,
            'original_filename' => $doc->original_filename,
            'file_size' => $doc->fileSizeForHumans(),
            'extension' => $doc->extension,
            'file_icon' => $doc->fileIcon(),
            'is_reviewed' => $doc->is_reviewed,
            'is_deletable' => $doc->isDeletable(),
            'created_at' => $doc->created_at->format('d M Y'),
        ];

        $categories = collect($this->categoryList())
            ->map(function (array $cat) use ($grouped, $mapDoc) {
                /** @var \Illuminate\Support\Collection $files */
                $files = $grouped->get($cat['value'], collect());

                return [
                    ...$cat,
                    'files' => $files->map($mapDoc)->values()->all(),
                ];
            })
            ->values()
            ->all();

        $totalCount = $founder->documents()->count();
        $auditStatus = $founder->payment?->audit_status ?? 'pending';
        $requiredTotal = collect($this->categoryList())->where('required', true)->count();
        $requiredDone = collect($categories)
            ->where('required', true)
            ->filter(fn (array $c) => count($c['files']) > 0)
            ->count();

        return Inertia::render('Founder/Documents/Index', [
            'founder' => [
                'id' => $founder->id,
                'email' => $founder->email,
                'full_name' => $founder->full_name,
                'company_name' => $founder->company_name,
            ],
            'categories' => $categories,
            'required_total' => $requiredTotal,
            'required_done' => $requiredDone,
            'can_upload' => $totalCount < 20,
            'audit_status' => $auditStatus,
            // Required slots lock once the analyst review has begun so evidence
            // can't be swapped mid-audit; "Other" stays open for extras.
            'locked' => in_array($auditStatus, ['in_progress', 'complete'], true),
            'total_count' => $totalCount,
            'max_files' => 20,
        ]);
    }

    public function store(Request $request): JsonResponse|RedirectResponse
    {
        $request->validate([
            'files' => ['required', 'array', 'min:1'],
            'files.*' => ['file'],
            'category' => ['required', 'in:cap_table,financial_forecast,bank_statement,pitch_deck,articles_of_incorporation,ip_assignment,customer_contracts,unit_economics,other'],
        ]);

        $founder = Auth::guard('founder')->user()->load('payment');

        $currentCount = $founder->documents()->count();
        $incoming = count($request->file('files'));

        if ($currentCount >= 20) {
            return $this->uploadError('You have reached the maximum of 20 documents.', $request);
        }

        if ($currentCount + $incoming > 20) {
            return $this->uploadError('Only '.(20 - $currentCount).' more document(s) can be uploaded.', $request);
        }

        $uploaded = 0;
        foreach ($request->file('files') as $file) {
            try {
                $this->documents->validateFile($file);
            } catch (ValidationException $e) {
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

    private function uploadError(string $message, Request $request): JsonResponse|RedirectResponse
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

    public function destroy(FounderDocument $document): RedirectResponse
    {
        $this->authorizeDocument($document);

        if (! $document->isDeletable()) {
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
        // Order matters: the checklist surfaces these top-to-bottom and treats the
        // first unfilled required slot as the founder's "next" action.
        return [
            ['value' => 'pitch_deck',                'label' => 'Pitch Deck',                'required' => true],
            ['value' => 'cap_table',                 'label' => 'Cap Table',                 'required' => true],
            ['value' => 'financial_forecast',        'label' => 'Financial Forecast',        'required' => true],
            ['value' => 'bank_statement',            'label' => 'Bank Statement',            'required' => true],
            ['value' => 'unit_economics',            'label' => 'Unit Economics Model',      'required' => true],
            ['value' => 'customer_contracts',        'label' => 'Customer Contracts / LOIs', 'required' => true],
            ['value' => 'ip_assignment',             'label' => 'IP Assignment',             'required' => true],
            ['value' => 'articles_of_incorporation', 'label' => 'Articles of Incorporation', 'required' => true],
            ['value' => 'other',                     'label' => 'Other documents',           'required' => false],
        ];
    }
}
