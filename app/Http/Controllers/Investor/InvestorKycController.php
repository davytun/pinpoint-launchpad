<?php

namespace App\Http\Controllers\Investor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Investor\StoreInvestorKycSubmissionRequest;
use App\Models\AuditLog;
use App\Models\Investor;
use App\Models\InvestorKycSubmission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class InvestorKycController extends Controller
{
    public function create(Request $request): Response
    {
        return Inertia::render('Investor/Kyc', ['investor' => $request->user('investor')->load('profile', 'kycSubmissions')]);
    }

    public function store(StoreInvestorKycSubmissionRequest $request): RedirectResponse
    {
        $investor = $request->user('investor');

        if ($investor->hasApprovedKyc()) {
            return back()->withErrors([
                'document' => 'Your KYC is already verified and approved. Additional document submissions are not permitted.',
            ]);
        }

        if ($investor->hasPendingKyc() || $investor->kycSubmissions()->where('status', InvestorKycSubmission::STATUS_PENDING)->exists()) {
            return back()->withErrors([
                'document' => 'Your KYC document is already under review. Please wait for a decision before submitting another one.',
            ]);
        }

        $file = $request->file('document');
        $documentType = $investor->profile->investor_type === 'corporate' ? 'company_certificate' : 'valid_id';
        $path = "investor-kyc/{$investor->id}/".str()->uuid().'.enc';
        $originalName = trim(str_replace(["\0", "\r", "\n"], '', basename(str_replace('\\', '/', $file->getClientOriginalName()))));
        $originalName = $originalName !== '' ? $originalName : 'kyc-document';
        $isResubmission = $investor->kycSubmissions()->exists();

        if (! Storage::disk('local')->put($path, Crypt::encryptString(file_get_contents($file->getRealPath())))) {
            return back()->withErrors(['document' => 'We could not store your KYC document. Please try again.']);
        }

        try {
            DB::transaction(function () use ($investor, $documentType, $path, $originalName, $file, $request, $isResubmission): void {
                $submission = InvestorKycSubmission::create([
                    'investor_id' => $investor->id,
                    'document_type' => $documentType,
                    'storage_path' => $path,
                    'original_name' => $originalName,
                    'mime_type' => $file->getMimeType() ?: 'application/octet-stream',
                    'size_bytes' => $file->getSize(),
                ]);

                $investor->update([
                    'kyc_status' => Investor::KYC_STATUS_PENDING,
                    'kyc_approved_at' => null,
                ]);

                AuditLog::create([
                    'event' => $isResubmission ? 'investor.kyc_resubmitted' : 'investor.kyc_submitted',
                    'actor_type' => $investor::class,
                    'actor_id' => $investor->id,
                    'auditable_type' => $submission::class,
                    'auditable_id' => $submission->id,
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]);
            });
        } catch (Throwable $exception) {
            Storage::disk('local')->delete($path);

            throw $exception;
        }

        return back()->with('success', $isResubmission
            ? 'Your replacement KYC document has been submitted for review.'
            : 'Your KYC document has been submitted for review.');
    }
}
