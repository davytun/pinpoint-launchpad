<?php

namespace App\Http\Controllers\Founder;

use App\Http\Controllers\Controller;
use App\Http\Requests\Founder\SubmitFounderDiligenceResponseRequest;
use App\Models\DiligenceRequest;
use App\Models\Founder;
use App\Services\DiligenceWorkflowService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class FounderDiligenceController extends Controller
{
    public function index(): Response
    {
        /** @var Founder $founder */
        $founder = Auth::guard('founder')->user();
        $profile = $founder->profile;

        $requests = $profile
            ? $profile->diligenceRequests()
                ->whereIn('status', ['waiting_for_founder', 'founder_responded', 'resolved', 'under_review', 'submitted'])
                ->latest()
                ->get()
                ->map(function ($req) {
                    return [
                        'id' => $req->id,
                        'category' => $req->category,
                        'subject' => $req->subject,
                        'request_details' => $req->request_details,
                        'admin_instructions_for_founder' => $req->admin_instructions_for_founder,
                        'founder_notes_to_admin' => $req->founder_notes_to_admin,
                        'status' => $req->status,
                        'founder_facing_status' => $req->getFounderFacingStatus(),
                        'created_at' => $req->created_at->toISOString(),
                        'founder_responded_at' => $req->founder_responded_at?->toISOString(),
                        'resolved_at' => $req->resolved_at?->toISOString(),
                    ];
                })
            : collect();

        return Inertia::render('Founder/Diligence/Index', [
            'diligence_requests' => $requests,
        ]);
    }

    public function respond(
        SubmitFounderDiligenceResponseRequest $request,
        DiligenceRequest $diligenceRequest,
        DiligenceWorkflowService $workflow
    ): RedirectResponse {
        /** @var Founder $founder */
        $founder = Auth::guard('founder')->user();

        if ($diligenceRequest->profile?->founder_id !== $founder->id) {
            abort(403, 'Unauthorized access to diligence request.');
        }

        $workflow->submitFounderResponse(
            $diligenceRequest,
            $founder,
            $request->validated('founder_notes_to_admin'),
            $request->ip(),
            $request->userAgent()
        );

        return back()->with('success', 'Your response has been securely submitted to Pinpoint Investor Relations for review.');
    }
}
