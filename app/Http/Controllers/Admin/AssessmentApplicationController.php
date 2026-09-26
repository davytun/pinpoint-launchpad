<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PiaApplication;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AssessmentApplicationController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->string('status')->value();

        $applications = $this->assessmentQuery()
            ->when(in_array($status, ['pending', 'contacted', 'replied'], true), fn ($query) => $query->where('status', $status))
            ->latest()
            ->paginate(20)
            ->through(fn (PiaApplication $application) => [
                'id' => $application->id,
                'name' => $application->name,
                'email' => $application->email,
                'company' => $application->company,
                'country' => $application->country,
                'stage' => $application->stage,
                'raise_target' => $application->raise_target,
                'message' => $application->message,
                'status' => $application->status,
                'created_at' => $application->created_at->toIso8601String(),
            ]);

        $desk = str_starts_with($request->path(), 'admin/founder') ? 'founder' : 'platform';

        return Inertia::render('Admin/Assessments/Index', [
            'applications' => $applications,
            'activeStatus' => in_array($status, ['pending', 'contacted', 'replied'], true) ? $status : 'all',
            'statusCounts' => [
                'all' => $this->assessmentQuery()->count(),
                'pending' => $this->assessmentQuery()->where('status', 'pending')->count(),
                'contacted' => $this->assessmentQuery()->where('status', 'contacted')->count(),
                'replied' => $this->assessmentQuery()->where('status', 'replied')->count(),
            ],
            'desk' => $desk,
        ]);
    }

    public function markInReview(PiaApplication $application): RedirectResponse
    {
        $this->ensureAssessment($application);

        if ($application->status === 'pending') {
            $application->update(['status' => 'contacted']);
        }

        return back()->with('success', "{$application->company} is in review.");
    }

    public function markScopeSent(PiaApplication $application): RedirectResponse
    {
        $this->ensureAssessment($application);

        if ($application->status === 'replied') {
            return back()->with('info', 'Scope and fee were already marked as sent.');
        }

        if ($application->status !== 'contacted') {
            return back()->with('error', 'Mark the application in review before sending scope and fee.');
        }

        $application->update(['status' => 'replied']);

        return back()->with('success', "Scope and fee marked as sent for {$application->company}.");
    }

    private function assessmentQuery()
    {
        return PiaApplication::query()->where('source', 'assessment_page');
    }

    private function ensureAssessment(PiaApplication $application): void
    {
        abort_unless($application->source === 'assessment_page', 404);
    }
}
