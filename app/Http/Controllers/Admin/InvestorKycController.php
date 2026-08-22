<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ReviewInvestorKycRequest;
use App\Models\AuditLog;
use App\Models\Investor;
use App\Models\InvestorKycSubmission;
use App\Notifications\InvestorKycReviewedNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Throwable;

class InvestorKycController extends Controller
{
    public function review(ReviewInvestorKycRequest $request, InvestorKycSubmission $submission): RedirectResponse
    {
        $data = $request->validated();

        $reviewedInvestor = DB::transaction(function () use ($data, $request, $submission): ?Investor {
            $lockedSubmission = InvestorKycSubmission::query()->lockForUpdate()->findOrFail($submission->id);

            if (! $lockedSubmission->isPending()) {
                return null;
            }

            $investor = $lockedSubmission->investor()->lockForUpdate()->firstOrFail();
            $reviewedAt = now();

            $lockedSubmission->update([
                'status' => $data['status'],
                'reviewed_by' => $request->user()->id,
                'reviewed_at' => $reviewedAt,
                'review_notes' => $data['review_notes'] ?? null,
            ]);

            $investor->update([
                'kyc_status' => $data['status'] === InvestorKycSubmission::STATUS_APPROVED
                    ? Investor::KYC_STATUS_APPROVED
                    : Investor::KYC_STATUS_REJECTED,
                'kyc_approved_at' => $data['status'] === InvestorKycSubmission::STATUS_APPROVED ? $reviewedAt : null,
            ]);

            AuditLog::create([
                'event' => "investor.kyc_{$data['status']}",
                'actor_type' => $request->user()::class,
                'actor_id' => $request->user()->id,
                'auditable_type' => $lockedSubmission::class,
                'auditable_id' => $lockedSubmission->id,
                'metadata' => ['notes' => $data['review_notes'] ?? null],
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return $investor;
        });

        if (! $reviewedInvestor) {
            return back()->withErrors(['status' => 'This KYC submission has already been reviewed.']);
        }

        $reviewedInvestor->loadMissing('profile');
        $reviewedInvestor->notify(new InvestorKycReviewedNotification($data['status'], $data['review_notes'] ?? null));

        return back()->with('success', 'KYC submission reviewed.');
    }

    public function download(Request $request, InvestorKycSubmission $submission): HttpResponse
    {
        return $this->documentResponse($request, $submission, 'attachment', 'investor.kyc_downloaded');
    }

    public function preview(Request $request, InvestorKycSubmission $submission): HttpResponse
    {
        return $this->documentResponse($request, $submission, 'inline', 'investor.kyc_viewed');
    }

    private function documentResponse(Request $request, InvestorKycSubmission $submission, string $disposition, string $auditEvent): HttpResponse
    {
        $disk = Storage::disk('local');

        abort_unless($disk->exists($submission->storage_path), 404);

        try {
            $contents = Crypt::decryptString($disk->get($submission->storage_path));
        } catch (Throwable) {
            abort(404);
        }

        $filename = trim(str_replace(["\0", "\r", "\n", '"'], '', basename(str_replace('\\', '/', $submission->original_name))));
        $filename = $filename !== '' ? $filename : 'kyc-document';
        $mimeType = in_array($submission->mime_type, ['application/pdf', 'image/jpeg', 'image/png'], true)
            ? $submission->mime_type
            : 'application/octet-stream';

        AuditLog::create([
            'event' => $auditEvent,
            'actor_type' => $request->user()::class,
            'actor_id' => $request->user()->id,
            'auditable_type' => $submission::class,
            'auditable_id' => $submission->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response($contents, 200, [
            'Content-Type' => $mimeType,
            'Content-Disposition' => "{$disposition}; filename=\"{$filename}\"",
        ]);
    }
}
