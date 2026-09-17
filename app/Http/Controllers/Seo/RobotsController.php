<?php

namespace App\Http\Controllers\Seo;

use App\Http\Controllers\Controller;
use Illuminate\Http\Response;

class RobotsController extends Controller
{
    public function __invoke(): Response
    {
        $baseUrl = rtrim((string) config('app.url'), '/');
        $disallows = config('seo.noindex_path_prefixes', []);

        $lines = [
            '# Pinpoint Launchpad — https://llmstxt.org/ companion: '.$baseUrl.'/llms.txt',
            'User-agent: *',
            'Allow: /',
            '',
        ];

        foreach ($disallows as $path) {
            $lines[] = 'Disallow: '.$path;
        }

        // AI search / on-demand fetch agents: same public access, same private blocks.
        // Training-only crawlers (GPTBot, Google-Extended, ClaudeBot) are not blocked
        // sitewide; private paths above still apply via User-agent: *.
        $aiAgents = [
            'OAI-SearchBot',
            'ChatGPT-User',
            'Claude-SearchBot',
            'Claude-User',
            'PerplexityBot',
            'Applebot-Extended',
        ];

        foreach ($aiAgents as $agent) {
            $lines[] = '';
            $lines[] = 'User-agent: '.$agent;
            $lines[] = 'Allow: /';
            foreach ($disallows as $path) {
                $lines[] = 'Disallow: '.$path;
            }
        }

        $lines[] = '';
        $lines[] = 'Sitemap: '.$baseUrl.'/sitemap.xml';
        $lines[] = '# LLM context: '.$baseUrl.'/llms.txt';
        $lines[] = '';

        return response(implode("\n", $lines), 200)
            ->header('Content-Type', 'text/plain; charset=UTF-8');
    }
}
