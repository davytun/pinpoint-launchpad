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
        $founder = Auth::guard('founder')->user()->load('profile:id,founder_id');

        $diligenceRequests = $founder->profile
            ? $founder->profile->diligenceRequests()
                ->whereIn('status', ['waiting_for_founder', 'founder_responded', 'resolved', 'declined'])
                ->latest()
                ->get()
                ->map(fn (DiligenceRequest $request) => [
                    'id' => $request->id,
                    'category' => $request->category,
                    'subject' => $request->subject,
                    'request_details' => $request->request_details,
                    'admin_instructions_for_founder' => $request->admin_instructions_for_founder,
                    'founder_notes_to_admin' => $request->founder_notes_to_admin,
                    'status' => $request->status,
                    'founder_facing_status' => $request->getFounderFacingStatus(),
                    'created_at' => $request->created_at?->toISOString(),
                    'founder_responded_at' => $request->founder_responded_at?->toISOString(),
                    'resolved_at' => $request->resolved_at?->toISOString(),
                ])
                ->values()
                ->all()
            : [];

        return Inertia::render('Founder/Diligence/Index', [
            'founder' => [
                'id' => $founder->id,
                'email' => $founder->email,
                'full_name' => $founder->full_name,
                'company_name' => $founder->company_name,
                'avatar' => $founder->avatar,
            ],
            'diligence_requests' => $diligenceRequests,
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

        return redirect()
            ->route('founder.diligence.index')
            ->with('success', 'Response submitted to Pinpoint.');
    }
}
