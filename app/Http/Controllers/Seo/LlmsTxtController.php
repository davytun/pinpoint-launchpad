<?php

namespace App\Http\Controllers\Seo;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use Illuminate\Http\Response;

class LlmsTxtController extends Controller
{
    /**
     * Curated site map for AI agents (https://llmstxt.org/).
     */
    public function __invoke(): Response
    {
        $base = rtrim((string) config('app.url'), '/');
        $site = (string) config('seo.site_name', 'Pinpoint Launchpad');

        $lines = [
            '# '.$site,
            '',
            '> Pinpoint Launchpad helps founders verify startup information, find readiness gaps, and build profiles investors can review. Founders use a free Self-Scan and a paid Pinpoint Investment Assessment (PIA) against the PARAGON framework. Admitted investors browse reviewed startups through Spotlight.',
            '',
            'Pinpoint does not broker investments, give investment advice, or guarantee funding. Readiness scores are information tools, not recommendations to invest.',
            '',
            '## Primary pages',
            '',
            '- [Home — for founders]('.$base.'/): Self-Scan, Assessment overview, PARAGON model, pricing, FAQ, and contact.',
            '- [For investors]('.$base.'/investor): How admitted investors review readiness profiles and request next steps.',
            '- [Pinpoint Investment Assessment]('.$base.'/assessment): Analyst-led PIA tiers, scope, and application.',
            '- [Blog]('.$base.'/blog): Articles on investment readiness and founder preparation.',
            '',
            '## Legal',
            '',
            '- [Terms of Service]('.$base.'/terms)',
            '- [Privacy Notice]('.$base.'/privacy)',
            '- [Cookies Policy]('.$base.'/cookies)',
            '- [Investor Terms]('.$base.'/investor-terms)',
            '',
            '## Optional',
            '',
            '- [XML sitemap]('.$base.'/sitemap.xml): Machine-readable list of indexable URLs.',
            '- [robots.txt]('.$base.'/robots.txt): Crawl allow/disallow rules for bots and AI agents.',
        ];

        $posts = BlogPost::published()
            ->orderByDesc('published_at')
            ->limit(12)
            ->get(['title', 'slug', 'excerpt']);

        if ($posts->isNotEmpty()) {
            $lines[] = '';
            $lines[] = '## Recent articles';
            $lines[] = '';
            foreach ($posts as $post) {
                $desc = trim(strip_tags((string) $post->excerpt));
                $desc = $desc !== '' ? ': '.$desc : '';
                $lines[] = '- ['.$post->title.']('.$base.'/blog/'.$post->slug.')'.$desc;
            }
        }

        $lines[] = '';

        return response(implode("\n", $lines), 200)
            ->header('Content-Type', 'text/plain; charset=UTF-8');
    }
}
