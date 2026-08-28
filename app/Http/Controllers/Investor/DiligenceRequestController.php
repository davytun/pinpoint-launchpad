<?php

namespace App\Http\Controllers\Investor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Investor\StoreDiligenceRequest;
use App\Models\FounderProfile;
use App\Models\Investor;
use App\Services\DiligenceWorkflowService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DiligenceRequestController extends Controller
{
    public function index(): Response
    {
        /** @var Investor $investor */
        $investor = Auth::guard('investor')->user();

        $requests = $investor->diligenceRequests()
            ->with(['profile.founder:id,company_name', 'profile:id,founder_id,slug,sector,spotlight_one_liner'])
            ->latest()
            ->get()
            ->map(function ($req) {
                return [
                    'id' => $req->id,
                    'category' => $req->category,
                    'subject' => $req->subject,
                    'request_details' => $req->request_details,
                    'status' => $req->status,
                    'investor_facing_status' => $req->getInvestorFacingStatus(),
                    'investor_visible_response' => $req->investor_visible_response,
                    'data_room_required' => $req->data_room_required,
                    'created_at' => $req->created_at->toISOString(),
                    'resolved_at' => $req->resolved_at?->toISOString(),
                    'profile' => [
                        'slug' => $req->profile?->slug,
                        'sector' => $req->profile?->sector,
                        'spotlight_one_liner' => $req->profile?->spotlight_one_liner,
                        'founder' => [
                            'company_name' => $req->profile?->founder?->company_name ?? 'PIN Startup',
                        ],
                    ],
                ];
            });

        return Inertia::render('Investor/Diligence/Index', [
            'diligence_requests' => $requests,
        ]);
    }

    public function store(
        StoreDiligenceRequest $request,
        string $slug,
        DiligenceWorkflowService $workflow
    ): RedirectResponse {
        /** @var Investor $investor */
        $investor = Auth::guard('investor')->user();
        abort_unless($investor->canAccessProtectedInvestorContent(), 403, 'KYC approval is required to submit diligence requests.');

        $profile = FounderProfile::where('slug', $slug)->firstOrFail();

        $workflow->submitRequest(
            $investor,
            $profile,
            $request->validated(),
            $request->ip(),
            $request->userAgent()
        );

        return back()->with('success', 'Your diligence inquiry has been submitted to Pinpoint Investor Relations for coordination.');
    }
}
