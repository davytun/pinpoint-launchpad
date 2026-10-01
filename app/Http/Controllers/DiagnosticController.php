<?php

namespace App\Http\Controllers;

use App\Mail\DiagnosticResultAdminMail;
use App\Mail\DiagnosticResultMail;
use App\Mail\PathwayAMail;
use App\Mail\PathwayBEmail1Mail;
use App\Mail\PathwayBEmail2Mail;
use App\Mail\PathwayBEmail3Mail;
use App\Mail\PathwayCFounderMail;
use App\Mail\UnicornAlertMail;
use App\Models\DiagnosticQuestion;
use App\Models\DiagnosticSession;
use App\Models\Founder;
use App\Models\Payment;
use App\Models\Setting;
use App\Services\DiagnosticProgress;
use App\Services\ScoringService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class DiagnosticController extends Controller
{
    public function __construct(private DiagnosticProgress $progress) {}

    private const BAND_MESSAGES = [
        'low' => 'Raising now would waste your time and your reputation. That is not a judgement on the idea. It is a judgement on the state of the company around it — and every item is fixable.',
        'mid_low' => 'There is something here, but it is not yet an investable proposition. Do not start a raise from this position. You will burn your best introductions on a package that is not ready.',
        'mid_high' => 'The business is fundable. The package is not — yet. This is the most common band, and the most fixable. The two dimensions below are what is costing you.',
        'high' => 'You are in the top band. The gap now is polish, not repair. Companies scoring here are usually one focused sprint away from a credible process.',
    ];

    public function index(Request $request): Response|RedirectResponse
    {
        // Quiz is scored, but the email is not saved yet. Keep them on that step.
        if ($request->session()->has('diagnostic_result')) {
            return redirect()->route('diagnostic.email-gate');
        }

        $saved = $this->progress->resolve($request);

        if ($saved && $this->progress->shouldResume($saved)) {
            return $this->progress->redirectToProgress($request, $saved);
        }

        $questions = DiagnosticQuestion::active()->get();

        return Inertia::render('Diagnostic/Index', [
            'questions' => $questions,
            'total_questions' => $questions->count(),
        ]);
    }

    public function submit(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'answers' => ['required', 'array', 'min:1'],
            'answers.*' => ['required'], // ScoringService normalises the value; boolean legacy format is handled there
            'company_name' => ['required', 'string', 'max:255'],
            'country' => ['required', 'string', 'max:255'],
            'sector' => ['required', 'string', 'max:255'],
            'growth_stage' => ['required', 'string', 'max:255'],
            'describe_you' => ['required', 'string', 'max:255'],
            'looking_to_raise' => ['required', 'string', 'max:255'],
        ]);

        $stageText = $validated['growth_stage'] ?? '';
        $stage = 'seed';
        if (str_starts_with(strtolower($stageText), 'concept')) {
            $stage = 'concept';
        } elseif (str_starts_with(strtolower($stageText), 'growth')) {
            $stage = 'growth';
        }

        /** @var ScoringService $scorer */
        $scorer = app(ScoringService::class);
        $result = $scorer->calculate($validated['answers'], $stage);

        $request->session()->put('diagnostic_result', $result);
        $request->session()->put('diagnostic_basics', [
            'company_name' => $validated['company_name'],
            'country' => $validated['country'],
            'sector' => $validated['sector'],
            'growth_stage' => $validated['growth_stage'],
            'describe_you' => $validated['describe_you'],
            'looking_to_raise' => $validated['looking_to_raise'],
        ]);

        return redirect()->route('diagnostic.email-gate');
    }

    public function emailGate(Request $request): Response|RedirectResponse
    {
        if (! $request->session()->has('diagnostic_result')) {
            $saved = $this->progress->resolve($request);

            if ($saved) {
                return $this->progress->redirectToProgress($request, $saved);
            }

            return redirect()->route('diagnostic.index')->with('error', 'Please complete the quiz first.');
        }

        $result = $request->session()->get('diagnostic_result');

        return Inertia::render('Diagnostic/EmailGate', [
            'blurred_score' => $result['total_score'],
        ]);
    }

    public function captureEmail(Request $request): RedirectResponse
    {
        if (! $request->session()->has('diagnostic_result')) {
            $saved = $this->progress->resolve($request);

            if ($saved) {
                return $this->progress->redirectToProgress($request, $saved);
            }

            return redirect()->route('diagnostic.index');
        }

        $validated = $request->validate([
            'email' => ['required', 'email'],
            'name' => ['required', 'string', 'max:255'],
            'role' => ['required', 'string', 'max:255'],
        ]);

        $email = $validated['email'];

        if (Founder::query()->where('email', $email)->exists()) {
            return redirect()->route('founder.login')
                ->with('info', 'An account already exists for this email. Log in to continue your application.');
        }

        $existing = DiagnosticSession::byEmail($email)
            ->latest('completed_at')
            ->first();

        if ($existing && $this->progress->shouldResume($existing)) {
            return $this->progress->redirectToProgress($request, $existing);
        }

        $paid = Payment::paid()->where('customer_email', $email)->latest()->first();

        if ($paid) {
            $linked = $paid->diagnostic_session_id
                ? DiagnosticSession::query()->find($paid->diagnostic_session_id)
                : null;

            if ($linked) {
                return $this->progress->redirectToProgress($request, $linked);
            }

            $request->session()->put('payment_id', $paid->id);

            return redirect()->route('onboarding.sign')
                ->with('info', 'We found your payment. Picking up where you left off.');
        }

        // IP-based cooldown — prevent email rotation abuse on a new attempt
        $ipAddress = (string) $request->ip();
        $recentByIp = DiagnosticSession::query()->where([
            ['ip_address', '=', $ipAddress],
            ['created_at', '>=', now()->subHours(24)],
        ])->count();

        if ($recentByIp >= 3) {
            Log::warning('Diagnostic IP abuse detected', [
                'ip_hash' => hash_hmac('sha256', (string) $request->ip(), config('app.key')),
                'email_hash' => hash_hmac('sha256', $email, config('app.key')),
            ]);

            return redirect()->route('diagnostic.email-gate')
                ->with('error', 'Too many attempts from your network. Please try again in 24 hours.');
        }

        $result = $request->session()->get('diagnostic_result');
        $scoreBand = $result['score_band'];
        $cooldownDays = (int) Setting::get('diagnostic_cooldown_days', 30);

        $cooldownUntil = in_array($scoreBand, ['low', 'mid_low'])
            ? now()->addDays($cooldownDays)
            : null;

        $basics = $request->session()->get('diagnostic_basics', []);

        $session = DiagnosticSession::create([
            'email' => $email,
            'name' => $validated['name'],
            'role' => $validated['role'],
            'company_name' => $basics['company_name'] ?? null,
            'country' => $basics['country'] ?? null,
            'sector' => $basics['sector'] ?? null,
            'growth_stage' => $basics['growth_stage'] ?? null,
            'describe_you' => $basics['describe_you'] ?? null,
            'looking_to_raise' => $basics['looking_to_raise'] ?? null,
            'answers' => $result['answers'],
            'score' => $result['total_score'],
            'score_band' => $scoreBand,
            'pillar_scores' => $result['pillar_scores'],
            'cooldown_until' => $cooldownUntil,
            'completed_at' => now(),
            'ip_address' => $request->ip(),
        ]);

        $this->progress->remember($request, $session);
        $request->session()->forget('diagnostic_result');
        $request->session()->forget('diagnostic_basics');

        // 1. Always send the general result email first (queued — non-blocking)
        Mail::to($session->email)->queue(new DiagnosticResultMail($session));

        // 2. Fire the correct pathway based on score band (spaced out to avoid immediate flood)
        if ($session->score_band === 'low') {
            Mail::to($session->email)->later(now()->addDay(), new PathwayAMail($session));
        } elseif ($session->score_band === 'mid_low' || $session->score_band === 'mid_high') {
            Mail::to($session->email)->later(now()->addDay(), new PathwayBEmail1Mail($session));
            Mail::to($session->email)->later(now()->addDays(3), new PathwayBEmail2Mail($session));
            Mail::to($session->email)->later(now()->addDays(6), new PathwayBEmail3Mail($session));
        } elseif ($session->score_band === 'high') {
            // Delay by 1 hour so it feels like a real analyst reviewed their rare high score
            Mail::to($session->email)->later(now()->addHour(), new PathwayCFounderMail($session));
            Mail::to(config('mail.admin_address'))->queue(new UnicornAlertMail($session));
        }

        // 3. Always send admin notification
        Mail::to(config('mail.admin_address'))->queue(new DiagnosticResultAdminMail($session));

        return redirect()->route('diagnostic.result')
            ->with('success', 'Your PARAGON report has been sent to '.$email.'. You can also review it on this page.');
    }

    public function result(Request $request): Response|RedirectResponse
    {
        $session = $this->progress->resolve($request);

        if (! $session) {
            return redirect()->route('diagnostic.index')->with('error', 'Please complete the quiz to see your results.');
        }

        $this->progress->remember($request, $session);

        $request->session()->put('result_viewed', true);

        // Convert answers to flat structure for calculation
        $flatAnswers = [];
        if (is_array($session->answers)) {
            foreach ($session->answers as $ans) {
                if (isset($ans['question_id'])) {
                    $flatAnswers[$ans['question_id']] = $ans['answer'] ?? 'A';
                }
            }
        }

        $stageText = $session->growth_stage ?? '';
        $stage = 'seed';
        if (str_starts_with(strtolower($stageText), 'concept')) {
            $stage = 'concept';
        } elseif (str_starts_with(strtolower($stageText), 'growth')) {
            $stage = 'growth';
        }

        /** @var ScoringService $scorer */
        $scorer = app(ScoringService::class);
        $result = $flatAnswers !== []
            ? $scorer->calculate($flatAnswers, $stage)
            : ['hard_flags' => [], 'weakest_dimensions' => [], 'network_strands' => ['commercial' => 0, 'capital' => 0]];

        $scoreBand = $session->score_band ?? 'mid_high';
        $pillarScores = is_array($session->pillar_scores) ? $session->pillar_scores : [
            'potential' => 0,
            'agility' => 0,
            'risk' => 0,
            'alignment' => 0,
            'governance' => 0,
            'operations' => 0,
            'network' => 0,
        ];

        return Inertia::render('Diagnostic/Result', [
            'score' => (int) ($session->score ?? 0),
            'score_band' => $scoreBand,
            'pillar_scores' => $pillarScores,
            'score_band_label' => $session->getScoreBandLabel(),
            'score_band_message' => self::BAND_MESSAGES[$scoreBand] ?? self::BAND_MESSAGES['mid_high'],
            'next_action' => $this->nextAction($scoreBand),
            'completed_at' => $session->completed_at?->toIso8601String() ?? now()->toIso8601String(),
            'describe_you' => $session->describe_you,
            'hard_flags' => $result['hard_flags'] ?? [],
            'weakest_dimensions' => $result['weakest_dimensions'] ?? [],
            'network_strands' => $result['network_strands'] ?? ['commercial' => 0, 'capital' => 0],
            'report_email' => $session->email,
            'email_notice' => $request->session()->get('success'),
        ]);
    }

    public function sendChecklist(Request $request): JsonResponse
    {
        $session = $this->progress->resolve($request);

        if (! $session) {
            return response()->json(['error' => 'Session not found.'], 403);
        }

        $this->progress->remember($request, $session);

        // Only low / mid-low bands get the checklist
        if (! in_array($session->score_band, ['low', 'mid_low'])) {
            return response()->json(['error' => 'Not applicable for this score band.'], 422);
        }

        Mail::to($session->email)->queue(new PathwayAMail($session));

        return response()->json(['success' => true]);
    }

    public function viewById(Request $request, int $id): RedirectResponse
    {
        // Route is signed — unsigned links cannot restore another person's diagnostic session.
        $session = DiagnosticSession::findOrFail($id);

        return $this->progress->redirectToProgress($request, $session, 'result');
    }

    public function continue(Request $request, DiagnosticSession $diagnosticSession): RedirectResponse
    {
        $preferred = $request->query('to') === 'checkout' ? 'checkout' : 'result';

        return $this->progress->redirectToProgress($request, $diagnosticSession, $preferred);
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
            'score_band' => $session?->score_band,
            'score_band_label' => $session?->getScoreBandLabel(),
        ]);
    }

    private function nextAction(string $band): string
    {
        return match ($band) {
            'low' => 'build',
            'mid_low' => 'pia_assessment',
            'mid_high' => 'paragon_certification',
            'high' => 'fast_track',
            default => 'build',
        };
    }
}
