<?php

namespace App\Http\Controllers\Investor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Investor\StoreInvestorKycSubmissionRequest;
use App\Models\AuditLog;
use App\Models\InvestorKycSubmission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class InvestorKycController extends Controller
{
    public function create(Request $request): Response
    {
        return Inertia::render('Investor/Kyc', ['investor' => $request->user('investor')->load('profile', 'kycSubmissions')]);
    }

    public function store(StoreInvestorKycSubmissionRequest $request): RedirectResponse
    {
        $investor = $request->user('investor');
        $file = $request->file('document');
        $documentType = $investor->profile->investor_type === 'corporate' ? 'company_certificate' : 'valid_id';
        $path = "investor-kyc/{$investor->id}/".str()->uuid().'.enc';

        Storage::disk('local')->put($path, Crypt::encryptString(file_get_contents($file->getRealPath())));
        $submission = InvestorKycSubmission::create(['investor_id' => $investor->id, 'document_type' => $documentType, 'storage_path' => $path, 'original_name' => $file->getClientOriginalName(), 'mime_type' => $file->getMimeType(), 'size_bytes' => $file->getSize()]);
        $investor->update(['kyc_status' => 'pending']);
        AuditLog::create(['event' => 'investor.kyc_submitted', 'actor_type' => $investor::class, 'actor_id' => $investor->id, 'auditable_type' => $submission::class, 'auditable_id' => $submission->id, 'ip_address' => $request->ip(), 'user_agent' => $request->userAgent()]);

        return back()->with('success', 'Your KYC document has been submitted for review.');
    }
}
