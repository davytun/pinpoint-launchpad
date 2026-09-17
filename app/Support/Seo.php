<?php

namespace App\Support;

use App\Models\BlogPost;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class Seo
{
    /**
     * Resolve SEO metadata for the current request.
     *
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    public static function forRequest(?Request $request = null, array $overrides = []): array
    {
        $request ??= request();
        $routeName = $request->route()?->getName();
        $rawPath = $request->path();
        $path = $rawPath === '/' ? '/' : '/'.ltrim($rawPath, '/');

        $pages = config('seo.pages', []);
        $page = ($routeName && isset($pages[$routeName])) ? $pages[$routeName] : null;

        $noindex = self::shouldNoindex($routeName, $path);
        $siteName = (string) config('seo.site_name', config('app.name', 'Pinpoint Launchpad'));
        $baseUrl = rtrim((string) config('app.url'), '/');

        $titlePart = $overrides['title'] ?? $page['title'] ?? $siteName;
        $fullTitle = self::formatTitle($titlePart, $siteName, ! empty($overrides['title_is_full']));

        $description = $overrides['description']
            ?? $page['description']
            ?? 'Pinpoint Launchpad helps founders verify startup information and helps investors review readiness signals on one platform.';

        $canonicalPath = $overrides['canonical_path'] ?? ($path === '' ? '/' : $path);
        // Prefer clean canonical without query strings for indexable pages
        if (empty($overrides['canonical_path']) && $routeName === 'blog.index') {
            $canonicalPath = '/blog';
        }
        if (empty($overrides['canonical_path']) && $routeName === 'home') {
            $canonicalPath = '/';
        }

        $canonical = $overrides['canonical']
            ?? ($baseUrl.($canonicalPath === '/' ? '/' : $canonicalPath));

        $imagePath = $overrides['image'] ?? config('seo.default_og_image', '/og-image.png');
        $image = self::absoluteUrl($imagePath, $baseUrl);

        $robots = $noindex
            ? 'noindex, nofollow'
            : ($overrides['robots'] ?? $page['robots'] ?? 'index, follow');

        $ogType = $overrides['og_type'] ?? $page['og_type'] ?? 'website';

        $schemaKeys = $overrides['schema'] ?? $page['schema'] ?? [];
        if ($noindex) {
            $schemaKeys = [];
        }

        $jsonLd = self::buildJsonLd(
            schemaKeys: $schemaKeys,
            baseUrl: $baseUrl,
            siteName: $siteName,
            title: $fullTitle,
            description: $description,
            canonical: $canonical,
            overrides: $overrides,
        );

        return [
            'title' => $fullTitle,
            'title_part' => is_string($titlePart) ? $titlePart : $siteName,
            'description' => $description,
            'canonical' => $canonical,
            'robots' => $robots,
            'og_type' => $ogType,
            'og_title' => $overrides['og_title'] ?? $fullTitle,
            'og_description' => $overrides['og_description'] ?? $description,
            'og_image' => $image,
            'og_url' => $canonical,
            'og_site_name' => $siteName,
            'twitter_card' => config('seo.twitter_card', 'summary_large_image'),
            'twitter_title' => $overrides['twitter_title'] ?? $fullTitle,
            'twitter_description' => $overrides['twitter_description'] ?? $description,
            'twitter_image' => $image,
            'json_ld' => $jsonLd,
            'llms_txt' => $baseUrl.'/llms.txt',
            'google_site_verification' => config('seo.google_site_verification') ?: null,
            'bing_site_verification' => config('seo.bing_site_verification') ?: null,
            'indexable' => ! $noindex,
        ];
    }

    /**
     * SEO payload for a published blog post.
     *
     * @return array<string, mixed>
     */
    public static function forBlogPost(BlogPost $post): array
    {
        $baseUrl = rtrim((string) config('app.url'), '/');
        $path = '/blog/'.$post->slug;
        $description = Str::limit(trim(strip_tags((string) ($post->excerpt ?: $post->body))), 160, '');
        $image = $post->cover_image
            ? self::absoluteUrl($post->cover_image, $baseUrl)
            : self::absoluteUrl((string) config('seo.default_og_image'), $baseUrl);

        return self::forRequest(request(), [
            'title' => $post->title,
            'description' => $description !== ''
                ? $description
                : 'Article from the Pinpoint Launchpad blog.',
            'canonical_path' => $path,
            'image' => $image,
            'og_type' => 'article',
            'robots' => 'index, follow',
            'schema' => ['organization', 'blog_posting', 'breadcrumb_blog'],
            'article' => [
                'headline' => $post->title,
                'description' => $description,
                'image' => $image,
                'author' => $post->author_name ?: 'Pinpoint Launchpad',
                'date_published' => optional($post->published_at)?->toAtomString(),
                'date_modified' => optional($post->updated_at)?->toAtomString(),
                'url' => $baseUrl.$path,
            ],
        ]);
    }

    public static function absoluteUrl(string $pathOrUrl, ?string $baseUrl = null): string
    {
        if (Str::startsWith($pathOrUrl, ['http://', 'https://'])) {
            return $pathOrUrl;
        }

        $baseUrl = rtrim($baseUrl ?? (string) config('app.url'), '/');

        return $baseUrl.'/'.ltrim($pathOrUrl, '/');
    }

    protected static function formatTitle(string $titlePart, string $siteName, bool $isFull = false): string
    {
        if ($isFull || $titlePart === $siteName) {
            return $titlePart;
        }

        if (Str::contains($titlePart, $siteName)) {
            return $titlePart;
        }

        return $titlePart.' | '.$siteName;
    }

    protected static function shouldNoindex(?string $routeName, string $path): bool
    {
        if ($routeName) {
            foreach (config('seo.noindex_route_names', []) as $name) {
                if ($routeName === $name) {
                    return true;
                }
            }
            foreach (config('seo.noindex_route_prefixes', []) as $prefix) {
                if ($prefix !== '' && Str::startsWith($routeName, $prefix)) {
                    // Allow public investor.index (exact) — prefixes use trailing dots mostly
                    if ($routeName === 'investor.index') {
                        continue;
                    }

                    return true;
                }
            }
            // investor.* authenticated routes: anything under investor. except investor.index and investor-terms
            if (Str::startsWith($routeName, 'investor.') && $routeName !== 'investor.index') {
                return true;
            }
        }

        foreach (config('seo.noindex_path_prefixes', []) as $prefix) {
            if ($prefix === '/') {
                continue;
            }
            if ($path === $prefix || Str::startsWith($path, rtrim($prefix, '/').'/')) {
                return true;
            }
            if ($path === rtrim($prefix, '/')) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param  array<int, string>  $schemaKeys
     * @param  array<string, mixed>  $overrides
     * @return list<array<string, mixed>>
     */
    protected static function buildJsonLd(
        array $schemaKeys,
        string $baseUrl,
        string $siteName,
        string $title,
        string $description,
        string $canonical,
        array $overrides,
    ): array {
        $blocks = [];
        $org = config('seo.organization', []);
        $orgUrl = $baseUrl.'/';
        $orgId = $baseUrl.'/#organization';
        $websiteId = $baseUrl.'/#website';
        $logoUrl = self::absoluteUrl($org['logo'] ?? '/pinpoint-logo.png', $baseUrl);

        $organization = [
            '@type' => 'Organization',
            '@id' => $orgId,
            'name' => $org['name'] ?? $siteName,
            'legalName' => $org['legal_name'] ?? null,
            'url' => $orgUrl,
            'logo' => [
                '@type' => 'ImageObject',
                'url' => $logoUrl,
            ],
            'email' => $org['email'] ?? null,
        ];
        $sameAs = array_values(array_filter($org['same_as'] ?? []));
        if ($sameAs !== []) {
            $organization['sameAs'] = $sameAs;
        }
        $organization = array_filter($organization, fn ($v) => $v !== null && $v !== '');

        foreach ($schemaKeys as $key) {
            match ($key) {
                'organization' => $blocks[] = $organization,
                'website' => $blocks[] = [
                    '@type' => 'WebSite',
                    '@id' => $websiteId,
                    'name' => $siteName,
                    'url' => $orgUrl,
                    'publisher' => ['@id' => $orgId],
                    'description' => $description,
                ],
                'faq' => $blocks[] = self::faqPage(config('seo.faqs.home', [])),
                'faq_investor' => $blocks[] = self::faqPage(config('seo.faqs.investor', [])),
                'service' => $blocks[] = [
                    '@type' => 'Service',
                    'name' => 'Pinpoint Investment Assessment',
                    'serviceType' => 'Investment readiness assessment',
                    'description' => $description,
                    'provider' => ['@id' => $orgId],
                    'url' => $baseUrl.'/assessment',
                    'areaServed' => 'Worldwide',
                    'offers' => [
                        [
                            '@type' => 'Offer',
                            'name' => 'Concept tier',
                            'price' => '500',
                            'priceCurrency' => 'USD',
                            'description' => 'Fixed-fee Assessment for concept-stage startups (also available in NGN).',
                        ],
                        [
                            '@type' => 'Offer',
                            'name' => 'Seed tier',
                            'price' => '1500',
                            'priceCurrency' => 'USD',
                            'description' => 'Fixed-fee Assessment for seed-stage startups.',
                        ],
                        [
                            '@type' => 'Offer',
                            'name' => 'Growth tier',
                            'price' => '3500',
                            'priceCurrency' => 'USD',
                            'description' => 'Assessment for growth-stage startups; scoped and quoted before invoice.',
                        ],
                    ],
                ],
                'blog' => $blocks[] = [
                    '@type' => 'Blog',
                    'name' => 'The Pinpoint Blog',
                    'description' => $description,
                    'url' => $baseUrl.'/blog',
                    'publisher' => ['@id' => $orgId],
                ],
                'webpage' => $blocks[] = [
                    '@type' => 'WebPage',
                    'name' => $title,
                    'description' => $description,
                    'url' => $canonical,
                    'isPartOf' => ['@id' => $websiteId],
                    'publisher' => ['@id' => $orgId],
                ],
                'blog_posting' => $blocks[] = self::blogPosting($overrides['article'] ?? [], $orgId),
                'breadcrumb_blog' => $blocks[] = [
                    '@type' => 'BreadcrumbList',
                    'itemListElement' => [
                        [
                            '@type' => 'ListItem',
                            'position' => 1,
                            'name' => 'Home',
                            'item' => $baseUrl.'/',
                        ],
                        [
                            '@type' => 'ListItem',
                            'position' => 2,
                            'name' => 'Blog',
                            'item' => $baseUrl.'/blog',
                        ],
                        [
                            '@type' => 'ListItem',
                            'position' => 3,
                            'name' => $overrides['article']['headline'] ?? $title,
                            'item' => $overrides['article']['url'] ?? $canonical,
                        ],
                    ],
                ],
                default => null,
            };
        }

        // Ensure Organization is present when other types reference @id
        $needsOrg = collect($schemaKeys)->intersect(['website', 'service', 'blog', 'webpage', 'blog_posting'])->isNotEmpty();
        if ($needsOrg && ! in_array('organization', $schemaKeys, true)) {
            array_unshift($blocks, $organization);
        }

        return array_values(array_filter($blocks));
    }

    /**
     * @param  list<array{question: string, answer: string}>  $faqs
     * @return array<string, mixed>
     */
    protected static function faqPage(array $faqs): array
    {
        return [
            '@type' => 'FAQPage',
            'mainEntity' => array_map(fn (array $faq) => [
                '@type' => 'Question',
                'name' => $faq['question'],
                'acceptedAnswer' => [
                    '@type' => 'Answer',
                    'text' => $faq['answer'],
                ],
            ], $faqs),
        ];
    }

    /**
     * @param  array<string, mixed>  $article
     * @return array<string, mixed>
     */
    protected static function blogPosting(array $article, string $orgId): array
    {
        $block = [
            '@type' => 'BlogPosting',
            'headline' => $article['headline'] ?? '',
            'description' => $article['description'] ?? '',
            'image' => $article['image'] ?? null,
            'author' => [
                '@type' => 'Person',
                'name' => $article['author'] ?? 'Pinpoint Launchpad',
            ],
            'publisher' => ['@id' => $orgId],
            'mainEntityOfPage' => $article['url'] ?? null,
            'datePublished' => $article['date_published'] ?? null,
            'dateModified' => $article['date_modified'] ?? null,
            'url' => $article['url'] ?? null,
        ];

        return array_filter($block, fn ($v) => $v !== null && $v !== '');
    }
}
