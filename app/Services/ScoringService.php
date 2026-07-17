<?php

namespace App\Services;

use App\Models\DiagnosticQuestion;

class ScoringService
{
    private const STAGE_WEIGHTS = [
        'concept' => [
            'potential'  => 22,
            'agility'    => 15,
            'risk'       => 10,
            'alignment'  => 11,
            'governance' => 9,
            'operations' => 11,
            'network'    => 22,
        ],
        'seed' => [
            'potential'  => 16,
            'agility'    => 11,
            'risk'       => 12,
            'alignment'  => 16,
            'governance' => 11,
            'operations' => 16,
            'network'    => 18,
        ],
        'growth' => [
            'potential'  => 11,
            'agility'    => 8,
            'risk'       => 16,
            'alignment'  => 15,
            'governance' => 15,
            'operations' => 19,
            'network'    => 16,
        ],
    ];

    /**
     * Calculate scoring results from a map of question_id => option letter answers.
     *
     * @param  array<int, string>  $answers  e.g. [1 => 'C', 2 => 'A', ...]
     * @param  string  $stage  e.g. 'concept', 'seed', 'growth'
     * @return array{
     *     total_score: int,
     *     score_band: string,
     *     pillar_scores: array<string, int>,
     *     answers: list<array{question_id: int, answer: string, points_awarded: int}>,
     *     hard_flags: list<string>,
     *     weakest_dimensions: list<string>,
     *     network_strands: array{commercial: int, capital: int}
     * }
     */
    public function calculate(array $answers, string $stage = 'seed'): array
    {
        $questions = DiagnosticQuestion::active()->get()->keyBy('id');

        $pillarEarned = [
            'potential'  => 0,
            'agility'    => 0,
            'risk'       => 0,
            'alignment'  => 0,
            'governance' => 0,
            'operations' => 0,
            'network'    => 0,
        ];
        $pillarMax = [
            'potential'  => 0,
            'agility'    => 0,
            'risk'       => 0,
            'alignment'  => 0,
            'governance' => 0,
            'operations' => 0,
            'network'    => 0,
        ];

        // Network strand scores
        $networkStrandEarned = ['commercial' => 0, 'capital' => 0];
        $networkStrandMax = ['commercial' => 0, 'capital' => 0];

        $enriched = [];
        $hardFlags = [];

        foreach ($questions as $question) {
            $rawAnswer = $answers[$question->id] ?? 'A';

            // Legacy boolean format (old frontend sent true/false instead of letters).
            // true  → highest-scoring option (last in array, e.g. 'D')
            // false → lowest-scoring option  (first in array, e.g. 'A')
            if (is_bool($rawAnswer)) {
                $opts = $question->options ?? [];
                if ($rawAnswer === true) {
                    $rawAnswer = strtoupper($opts[count($opts) - 1]['letter'] ?? 'D');
                } else {
                    $rawAnswer = strtoupper($opts[0]['letter'] ?? 'A');
                }
            }

            $selectedLetter = strtoupper((string) $rawAnswer);

            // Find option points and flags
            $pointsAwarded = 0;
            $flagText = null;
            if (is_array($question->options)) {
                foreach ($question->options as $opt) {
                    if (strtoupper($opt['letter'] ?? '') === $selectedLetter) {
                        $pointsAwarded = (int) ($opt['points'] ?? 0);
                        $flagText = $opt['flag'] ?? null;
                        break;
                    }
                }
            }

            if ($flagText) {
                $hardFlags[] = $flagText;
            }

            $pillarEarned[$question->pillar] += $pointsAwarded;
            $pillarMax[$question->pillar] += 4; // Each question is worth max 4 points

            if ($question->pillar === 'network' && $question->strand) {
                $networkStrandEarned[$question->strand] += $pointsAwarded;
                $networkStrandMax[$question->strand] += 4;
            }

            $enriched[] = [
                'question_id'    => $question->id,
                'answer'         => $selectedLetter,
                'points_awarded' => $pointsAwarded,
            ];
        }

        // Compute percentage score per pillar
        $pillarScores = [];
        foreach ($pillarEarned as $pillar => $earned) {
            $max = $pillarMax[$pillar];
            $pillarScores[$pillar] = $max > 0 ? (int) round(($earned / $max) * 100) : 0;
        }

        // Compute Network sub-scores
        $networkStrands = [
            'commercial' => $networkStrandMax['commercial'] > 0 ? (int) round(($networkStrandEarned['commercial'] / $networkStrandMax['commercial']) * 100) : 0,
            'capital'    => $networkStrandMax['capital'] > 0 ? (int) round(($networkStrandEarned['capital'] / $networkStrandMax['capital']) * 100) : 0,
        ];

        // Compute stage-weighted overall score
        $stageWeights = self::STAGE_WEIGHTS[$stage] ?? self::STAGE_WEIGHTS['seed'];
        $weightedSum = 0;
        foreach ($pillarScores as $pillar => $pct) {
            $weight = $stageWeights[$pillar] ?? 0;
            $weightedSum += ($pct * $weight);
        }
        $totalScore = (int) round($weightedSum / 100);

        // Find the two weakest dimensions:
        // Sort by score ascending, then by weight descending (tie-breaker)
        $candidates = [];
        foreach ($pillarScores as $pillar => $score) {
            $candidates[] = [
                'pillar' => $pillar,
                'score'  => $score,
                'weight' => $stageWeights[$pillar] ?? 0,
            ];
        }

        usort($candidates, function ($a, $b) {
            // Lower score first
            if ($a['score'] !== $b['score']) {
                return $a['score'] <=> $b['score'];
            }
            // Higher weight first if score is tied
            return $b['weight'] <=> $a['weight'];
        });

        $weakest = [
            $candidates[0]['pillar'],
            $candidates[1]['pillar']
        ];

        return [
            'total_score'        => $totalScore,
            'score_band'         => $this->scoreBand($totalScore),
            'pillar_scores'      => $pillarScores,
            'answers'            => $enriched,
            'hard_flags'         => $hardFlags,
            'weakest_dimensions' => $weakest,
            'network_strands'    => $networkStrands,
        ];
    }

    private function scoreBand(int $score): string
    {
        if ($score < 35) {
            return 'low';
        }
        if ($score <= 54) {
            return 'mid_low';
        }
        if ($score <= 74) {
            return 'mid_high';
        }
        return 'high';
    }
}
