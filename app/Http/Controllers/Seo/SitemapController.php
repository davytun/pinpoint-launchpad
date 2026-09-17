<?php

namespace App\Http\Controllers\Seo;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function __invoke(): Response
    {
        $baseUrl = rtrim((string) config('app.url'), '/');
        $urls = [];

        foreach (config('seo.sitemap_paths', []) as $path) {
            $loc = $baseUrl.($path === '/' ? '/' : $path);
            $urls[] = [
                'loc' => $loc,
                'lastmod' => now()->toAtomString(),
                'changefreq' => $path === '/' ? 'weekly' : 'monthly',
                'priority' => match ($path) {
                    '/' => '1.0',
                    '/investor', '/assessment' => '0.9',
                    '/blog' => '0.8',
                    default => '0.5',
                },
            ];
        }

        $posts = BlogPost::published()
            ->orderByDesc('published_at')
            ->get(['slug', 'published_at', 'updated_at']);

        foreach ($posts as $post) {
            $lastmod = $post->updated_at ?? $post->published_at ?? now();
            $urls[] = [
                'loc' => $baseUrl.'/blog/'.$post->slug,
                'lastmod' => $lastmod->toAtomString(),
                'changefreq' => 'monthly',
                'priority' => '0.7',
            ];
        }

        $xml = view('seo.sitemap', ['urls' => $urls])->render();

        return response($xml, 200)->header('Content-Type', 'application/xml; charset=UTF-8');
    }
}
