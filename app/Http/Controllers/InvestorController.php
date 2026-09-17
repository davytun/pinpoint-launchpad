<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use App\Models\Setting;
use Inertia\Inertia;
use Inertia\Response;

class InvestorController extends Controller
{
    public function index(): Response
    {
        $label = Setting::get('investor_cta_label', 'Join as an investor');
        if ($label === 'Join PIN') {
            $label = 'Join as an investor';
        }

        $latestPosts = BlogPost::published()
            ->orderByDesc('published_at')
            ->limit(3)
            ->get()
            ->map(fn ($p) => [
                'title' => $p->title,
                'slug' => $p->slug,
                'excerpt' => $p->excerpt,
                'cover_image' => $p->cover_image,
                'author_name' => $p->author_name,
                'category' => $p->category,
                'reading_time_mins' => $p->reading_time_mins,
                'published_at' => $p->published_at?->format('M j, Y'),
            ]);

        return Inertia::render('Investor/Landing', [
            'cta' => [
                'label' => $label,
                'url' => Setting::get('investor_cta_url', '/investor/onboarding'),
                'enabled' => Setting::get('investor_cta_enabled', '1') === '1',
            ],
            'latest_posts' => $latestPosts,
        ]);
    }
}
