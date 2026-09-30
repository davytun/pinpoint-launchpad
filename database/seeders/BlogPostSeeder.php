<?php

namespace Database\Seeders;

use App\Models\BlogPost;
use Illuminate\Database\Seeder;

class BlogPostSeeder extends Seeder
{
    public function run(): void
    {
        if (app()->environment('production')) {
            $this->command?->warn('BlogPostSeeder skipped (production).');

            return;
        }

        if (BlogPost::published()->exists()) {
            return;
        }

        $samples = [
            [
                'title' => 'What a PARAGON readiness score actually tells investors',
                'slug' => 'what-paragon-readiness-score-tells-investors',
                'excerpt' => 'A readiness score is structured information across seven business areas — not a recommendation to invest or a guarantee of funding.',
                'body' => '<p>Pinpoint uses PARAGON to organise assessment evidence into seven pillars. This article explains what investors see on a profile and what the score does not mean.</p><p>Scores help you decide where to spend diligence time. They do not replace your own judgment or legal review.</p>',
                'category' => 'Investors',
                'published_at' => now()->subDays(5),
            ],
            [
                'title' => 'Self-Scan vs Assessment: what founders complete before Spotlight',
                'slug' => 'self-scan-vs-assessment-before-spotlight',
                'excerpt' => 'Self-Scan is private and automated. Assessment is analyst-led review — the path to a profile investors can open on Pinpoint.',
                'body' => '<p>Founders often confuse the free diagnostic with verified assessment work. Here is how each step differs and when investor visibility enters the picture.</p>',
                'category' => 'Founders',
                'published_at' => now()->subDays(12),
            ],
            [
                'title' => 'How investor KYC and document access work on Pinpoint',
                'slug' => 'investor-kyc-and-document-access',
                'excerpt' => 'Admitted investors browse Spotlight after identity checks. Detailed materials need extra permission — founders stay in control.',
                'body' => '<p>Spotlight profiles are a structured first look. Cap table, legal, and financial documents sit behind authentication and approvals. This is how requests are coordinated.</p>',
                'category' => 'Product',
                'published_at' => now()->subDays(20),
            ],
        ];

        foreach ($samples as $data) {
            BlogPost::create([
                ...$data,
                'author_name' => 'Pinpoint Team',
                'cover_image' => null,
                'is_published' => true,
            ]);
        }
    }
}
