<?php

namespace App\Services;

use App\Models\DiagnosticQuestion;

class ScoringService
{
    /**
     * Pillar maximum possible points — derived from question set.
     * Stored here so band/pillar logic does not require a DB round-trip.
     */
    private const PILLAR_MAX = [
        'potential'  => 20,
        'agility'    => 15,
        'risk'       => 20,
        'alignment'  => 10,
        'governance' => 10,
        'operations' => 10,
        'need'       => 15,
    ];

    /**
     * Calculate scoring results from a map of question_id => bool answers.
     *
     * @param  array<int, bool>  $answers  e.g. [1 => true, 2 => false, ...]
     * @return array{
     *     total_score: int,
     *     score_band: string,
     *     pillar_scores: array<string, int>,
     *     answers: list<array{question_id: int, answer: bool, points_awarded: int}>
     * }
     */
    public function calculate(array $answers): array
    {
        $questions = DiagnosticQuestion::active()->get()->keyBy('id');

        $totalScore    = 0;
        $pillarEarned  = array_fill_keys(array_keys(self::PILLAR_MAX), 0);
        $enriched      = [];

        foreach ($questions as $question) {
            $answered      = (bool) ($answers[$question->id] ?? false);
            $pointsAwarded = $answered ? $question->points : 0;

            $totalScore             += $pointsAwarded;
            $pillarEarned[$question->pillar] += $pointsAwarded;

            $enriched[] = [
                'question_id'   => $question->id,
                'answer'        => $answered,
                'points_awarded' => $pointsAwarded,
            ];
        }

        $pillarScores = [];
        foreach (self::PILLAR_MAX as $pillar => $max) {
            $pillarScores[$pillar] = $max > 0
                ? (int) round(($pillarEarned[$pillar] / $max) * 100)
                : 0;
        }

        return [
            'total_score'  => $totalScore,
            'score_band'   => $this->scoreBand($totalScore),
            'pillar_scores' => $pillarScores,
            'answers'      => $enriched,
        ];
    }

    private function scoreBand(int $score): string
    {
        if ($score < 40) {
            return 'low';
        }

        if ($score <= 64) {
            return 'mid_low';
        }

        if ($score <= 85) {
            return 'mid_high';
        }

        return 'high';
    }
}
