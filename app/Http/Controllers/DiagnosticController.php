<?php

namespace App\Http\Controllers;

use App\Models\DiagnosticQuestion;
use App\Models\DiagnosticSession;
use App\Models\Setting;
use App\Services\ScoringService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DiagnosticController extends Controller
{
    private const BAND_MESSAGES = [
        'low'      => 'You are in the Build phase. Focus on your MVP. Come back to Pinpoint when you have 10 active users.',
        'mid_low'  => 'You have a foundation, but you are hitting Red Flag territory. You aren\'t ready for the PIN Network yet, but our PIA Assessment can fix this.',
        'mid_high' => 'Investment Ready Candidate. You have the fundamentals. To bridge the gap to a Top-Tier Seed round, you need the PARAGON Certification. Proceed to Application.',
        'high'     => 'High Velocity Candidate. Your profile is exceptional. We want to fast-track your PIA. An analyst will contact you within 72 hours.',
    ];

    public function index(Request $request): Response|RedirectResponse
    {
        $email = $request->session()->get('diagnostic_email');

        if ($email) {
            $latest = DiagnosticSession::byEmail($email)
                ->latest('completed_at')
                ->first();

            if ($latest && $latest->isOnCooldown()) {
                return redirect()->route('diagnostic.blocked');
            }
        }

        $questions = DiagnosticQuestion::active()->get();

        return Inertia::render('Diagnostic/Index', [
            'questions'       => $questions,
            'total_questions' => $questions->count(),
        ]);
    }

    public function submit(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'answers'   => ['required', 'array', 'min:1'],
            'answers.*' => ['required'],
        ]);

        /** @var ScoringService $scorer */
        $scorer = app(ScoringService::class);
        $result = $scorer->calculate($validated['answers']);

        $request->session()->put('diagnostic_result', $result);

        return redirect()->route('diagnostic.email-gate');
    }

    public function emailGate(Request $request): Response|RedirectResponse
    {
        if (! $request->session()->has('diagnostic_result')) {
            return redirect()->route('diagnostic.index');
        }

        $result = $request->session()->get('diagnostic_result');

        return Inertia::render('Diagnostic/EmailGate', [
            'blurred_score' => $result['total_score'],
        ]);
    }

    public function captureEmail(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $email = $validated['email'];

        $existing = DiagnosticSession::byEmail($email)
            ->latest('completed_at')
            ->first();

        if ($existing && $existing->isOnCooldown()) {
            $request->session()->put('diagnostic_email', $email);

            return redirect()->route('diagnostic.blocked');
        }

        $result      = $request->session()->get('diagnostic_result');
        $scoreBand   = $result['score_band'];
        $cooldownDays = (int) Setting::get('diagnostic_cooldown_days', 30);

        $cooldownUntil = in_array($scoreBand, ['low', 'mid_low'])
            ? now()->addDays($cooldownDays)
            : null;

        $session = DiagnosticSession::create([
            'email'          => $email,
            'answers'        => $result['answers'],
            'score'          => $result['total_score'],
            'score_band'     => $scoreBand,
            'pillar_scores'  => $result['pillar_scores'],
            'cooldown_until' => $cooldownUntil,
            'completed_at'   => now(),
            'ip_address'     => $request->ip(),
        ]);

        $request->session()->put('diagnostic_email', $email);
        $request->session()->put('diagnostic_session_id', $session->id);
        $request->session()->forget('diagnostic_result');

        return redirect()->route('diagnostic.result');
    }

    public function result(Request $request): Response|RedirectResponse
    {
        $sessionId = $request->session()->get('diagnostic_session_id');

        if (! $sessionId) {
            return redirect()->route('diagnostic.index');
        }

        $session = DiagnosticSession::findOrFail($sessionId);

        return Inertia::render('Diagnostic/Result', [
            'score'              => $session->score,
            'score_band'         => $session->score_band,
            'pillar_scores'      => $session->pillar_scores,
            'score_band_label'   => $session->getScoreBandLabel(),
            'score_band_message' => self::BAND_MESSAGES[$session->score_band],
            'next_action'        => $this->nextAction($session->score_band),
            'completed_at'       => $session->completed_at->toIso8601String(),
        ]);
    }

    public function blocked(Request $request): Response|RedirectResponse
    {
        $email = $request->session()->get('diagnostic_email');

        if (! $email) {
            return redirect()->route('diagnostic.index');
        }

        $session = DiagnosticSession::byEmail($email)
            ->latest('completed_at')
            ->first();

        return Inertia::render('Diagnostic/Blocked', [
            'days_remaining' => $session ? $session->daysRemainingOnCooldown() : 0,
            'score_band'     => $session?->score_band,
            'score_band_label' => $session?->getScoreBandLabel(),
        ]);
    }

    private function nextAction(string $band): string
    {
        return match ($band) {
            'low'      => 'build',
            'mid_low'  => 'pia_assessment',
            'mid_high' => 'paragon_certification',
            'high'     => 'fast_track',
            default    => 'build',
        };
    }
}
