<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Services\ScoringService;
use App\Models\DiagnosticQuestion;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ScoringServiceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Seed some dummy questions with custom options for scoring test
        DiagnosticQuestion::create([
            'id'            => 1,
            'pillar'        => 'potential',
            'question_text' => 'Dummy Potential Q1',
            'sub_text'      => 'Sub text',
            'options'       => [
                ['letter' => 'A', 'text' => 'Opt A', 'points' => 0, 'flag' => null],
                ['letter' => 'B', 'text' => 'Opt B', 'points' => 1, 'flag' => null],
                ['letter' => 'C', 'text' => 'Opt C', 'points' => 3, 'flag' => null],
                ['letter' => 'D', 'text' => 'Opt D', 'points' => 4, 'flag' => null],
            ],
            'strand'        => null,
            'order'         => 1,
            'is_active'     => true,
        ]);

        DiagnosticQuestion::create([
            'id'            => 2,
            'pillar'        => 'agility',
            'question_text' => 'Dummy Agility Q1',
            'sub_text'      => 'Sub text',
            'options'       => [
                ['letter' => 'A', 'text' => 'Opt A', 'points' => 0, 'flag' => null],
                ['letter' => 'B', 'text' => 'Opt B', 'points' => 1, 'flag' => null],
                ['letter' => 'C', 'text' => 'Opt C', 'points' => 3, 'flag' => null],
                ['letter' => 'D', 'text' => 'Opt D', 'points' => 4, 'flag' => null],
            ],
            'strand'        => null,
            'order'         => 2,
            'is_active'     => true,
        ]);

        DiagnosticQuestion::create([
            'id'            => 3,
            'pillar'        => 'risk',
            'question_text' => 'Dummy Risk Q1',
            'sub_text'      => 'Sub text',
            'options'       => [
                ['letter' => 'A', 'text' => 'Opt A', 'points' => 0, 'flag' => 'Regulatory status unknown.'],
                ['letter' => 'B', 'text' => 'Opt B', 'points' => 1, 'flag' => null],
                ['letter' => 'C', 'text' => 'Opt C', 'points' => 3, 'flag' => null],
                ['letter' => 'D', 'text' => 'Opt D', 'points' => 4, 'flag' => null],
            ],
            'strand'        => null,
            'order'         => 3,
            'is_active'     => true,
        ]);
    }

    public function test_it_calculates_stage_weighted_scores_and_captures_flags(): void
    {
        /** @var ScoringService $scorer */
        $scorer = new ScoringService();

        // 1. Test Seed weights
        $answers = [
            1 => 'D', // Potential (4 points, 100%) -> Seed weight 16
            2 => 'D', // Agility (4 points, 100%) -> Seed weight 11
            3 => 'A', // Risk (0 points, 0%, with hard flag!) -> Seed weight 12
        ];

        // Overall weighted = ((100 * 16) + (100 * 11) + (0 * 12)) / (16 + 11 + 12 = 39)
        // Wait, weights always sum to 100. Unanswered pillars have 0% score:
        // Potential (100% * 16) + Agility (100% * 11) + Risk (0% * 12) + Alignment (0% * 16) + Governance (0% * 11) + Operations (0% * 16) + Network (0% * 18)
        // Weighted sum = 1600 + 1100 = 2700
        // Overall score = round(2700 / 100) = 27
        $result = $scorer->calculate($answers, 'seed');

        $this->assertEquals(27, $result['total_score']);
        $this->assertEquals('low', $result['score_band']);
        $this->assertCount(1, $result['hard_flags']);
        $this->assertEquals('Regulatory status unknown.', $result['hard_flags'][0]);

        // 2. Test Concept weights
        // Potential (100% * 22) + Agility (100% * 15) = 3700 / 100 = 37%
        $resultConcept = $scorer->calculate($answers, 'concept');
        $this->assertEquals(37, $resultConcept['total_score']);
        $this->assertEquals('mid_low', $resultConcept['score_band']); // 35 - 54 is mid_low
    }
}
