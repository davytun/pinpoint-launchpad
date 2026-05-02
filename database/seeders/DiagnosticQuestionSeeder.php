<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\DiagnosticQuestion;

class DiagnosticQuestionSeeder extends Seeder
{
    public function run(): void
    {
        $questions = [
            [
                'pillar'        => 'potential',
                'question_text' => 'Is your MVP (Minimum Viable Product) fully functional and currently in the hands of at least 5–10 pilot users or customers?',
                'sub_text'      => 'A functional MVP means core features work end-to-end and real users are actively using it.',
                'points'        => 15,
                'order'         => 1,
            ],
            [
                'pillar'        => 'agility',
                'question_text' => 'Does your founding team have both a dedicated technical lead (CTO/Dev) and a dedicated sales/ops lead?',
                'sub_text'      => 'Both roles must be active — not one person wearing both hats.',
                'points'        => 10,
                'order'         => 2,
            ],
            [
                'pillar'        => 'risk',
                'question_text' => 'Does the company (not the individual founders) legally own all IP, trademarks, and domain names?',
                'sub_text'      => 'IP assigned to individuals instead of the company is a common deal-killer during due diligence.',
                'points'        => 10,
                'order'         => 3,
            ],
            [
                'pillar'        => 'alignment',
                'question_text' => 'Can you demonstrate, with data, a Total Addressable Market (TAM) of at least $500M?',
                'sub_text'      => 'Reference third-party sources like Gartner, Statista, or PitchBook — not internal estimates.',
                'points'        => 10,
                'order'         => 4,
            ],
            [
                'pillar'        => 'governance',
                'question_text' => 'Is your cap table clean? (Founders own >80%, no dead equity from advisors who left.)',
                'sub_text'      => 'Dead equity from departed advisors or co-founders is a red flag for institutional investors.',
                'points'        => 10,
                'order'         => 5,
            ],
            [
                'pillar'        => 'operations',
                'question_text' => 'Do you know your Customer Acquisition Cost (CAC) and estimated Lifetime Value (LTV)?',
                'sub_text'      => 'Knowing your numbers signals operational maturity. A healthy LTV:CAC ratio is 3:1 or higher.',
                'points'        => 10,
                'order'         => 6,
            ],
            [
                'pillar'        => 'network',
                'question_text' => 'Have you secured at least one Letter of Intent (LOI), a pilot contract, or $1k+ in Monthly Recurring Revenue (MRR)?',
                'sub_text'      => 'Revenue or signed commitments prove market need. Projections alone do not count.',
                'points'        => 15,
                'order'         => 7,
            ],
            [
                'pillar'        => 'risk',
                'question_text' => 'Do you have a 12–18 month financial forecast and use-of-funds breakdown ready for review?',
                'sub_text'      => 'Investors expect to see exactly how their capital will be deployed.',
                'points'        => 10,
                'order'         => 8,
            ],
            [
                'pillar'        => 'agility',
                'question_text' => 'Can you name one major pivot or product change you made based specifically on user data?',
                'sub_text'      => 'Data-driven pivots demonstrate product discipline and founder coachability.',
                'points'        => 5,
                'order'         => 9,
            ],
            [
                'pillar'        => 'potential',
                'question_text' => 'Can your current business model handle a 10x increase in customers without a 10x increase in headcount?',
                'sub_text'      => 'Scalability is what separates a business from a high-growth venture.',
                'points'        => 5,
                'order'         => 10,
            ],
        ];

        foreach ($questions as $data) {
            DiagnosticQuestion::firstOrCreate(
                ['order' => $data['order']],
                array_merge($data, ['is_active' => true])
            );
        }
    }
}
