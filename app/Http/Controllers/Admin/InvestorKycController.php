<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ReviewInvestorKycRequest;
use App\Models\AuditLog;
use App\Models\InvestorKycSubmission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class InvestorKycController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/InvestorKyc/Index', ['submissions' => InvestorKycSubmission::with('investor.profile')->where('status', 'pending')->latest()->paginate(20)]);
    }

    public function review(ReviewInvestorKycRequest $request, InvestorKycSubmission $submission): RedirectResponse
    {
        $data = $request->validated();
        $submission->update(['status' => $data['status'], 'reviewed_by' => $request->user()->id, 'reviewed_at' => now(), 'review_notes' => $data['review_notes'] ?? null]);
        $submission->investor->update(['kyc_status' => $data['status'], 'kyc_approved_at' => $data['status'] === 'approved' ? now() : null]);
        AuditLog::create(['event' => "investor.kyc_{$data['status']}", 'actor_type' => $request->user()::class, 'actor_id' => $request->user()->id, 'auditable_type' => $submission::class, 'auditable_id' => $submission->id, 'metadata' => ['notes' => $data['review_notes'] ?? null], 'ip_address' => $request->ip(), 'user_agent' => $request->userAgent()]);

        return back()->with('success', 'KYC submission reviewed.');
    }

    public function download(Request $request, InvestorKycSubmission $submission): HttpResponse
    {
        $contents = Crypt::decryptString(Storage::disk('local')->get($submission->storage_path));
        $filename = str_replace(['"', "\r", "\n"], '', $submission->original_name);

        AuditLog::create([
            'event' => 'investor.kyc_downloaded',
            'actor_type' => $request->user()::class,
            'actor_id' => $request->user()->id,
            'auditable_type' => $submission::class,
            'auditable_id' => $submission->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response($contents, 200, [
            'Content-Type' => $submission->mime_type,
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }
}
