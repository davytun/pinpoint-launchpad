<?php

use App\Models\BlogPost;
use App\Support\Seo;
use Illuminate\Support\Facades\Config;

beforeEach(function () {
    Config::set('app.url', 'https://pinpointlaunchpad.com');
    Config::set('seo.site_name', 'Pinpoint Launchpad');
});

it('serves robots.txt with disallows and sitemap location', function () {
    $response = $this->get('/robots.txt');

    $response->assertOk();
    $response->assertHeader('Content-Type', 'text/plain; charset=UTF-8');
    $response->assertSee('User-agent: *', false);
    $response->assertSee('Allow: /', false);
    $response->assertSee('Disallow: /admin', false);
    $response->assertSee('Disallow: /diagnostic', false);
    $response->assertSee('Disallow: /checkout', false);
    $response->assertSee('Sitemap: https://pinpointlaunchpad.com/sitemap.xml', false);
    $response->assertSee('Disallow: /investor/spotlight', false);
    $response->assertSee('User-agent: OAI-SearchBot', false);
    $response->assertSee('User-agent: Claude-User', false);
    $response->assertSee('llms.txt', false);
});

it('serves llms.txt for AI agents with absolute public URLs', function () {
    BlogPost::factory()->create([
        'title' => 'Readiness for seed founders',
        'slug' => 'readiness-seed-founders',
        'excerpt' => 'How to prepare evidence before Assessment.',
        'is_published' => true,
        'published_at' => now()->subDay(),
    ]);

    $response = $this->get('/llms.txt');

    $response->assertOk();
    $response->assertHeader('Content-Type', 'text/plain; charset=UTF-8');
    $response->assertSee('# Pinpoint Launchpad', false);
    $response->assertSee('https://pinpointlaunchpad.com/', false);
    $response->assertSee('https://pinpointlaunchpad.com/assessment', false);
    $response->assertSee('https://pinpointlaunchpad.com/investor', false);
    $response->assertSee('https://pinpointlaunchpad.com/blog/readiness-seed-founders', false);
    $response->assertDontSee('/admin', false);
});

it('uses og-image.png as the default social image', function () {
    $response = $this->get('/');

    $response->assertOk();
    $response->assertSee('https://pinpointlaunchpad.com/og-image.png', false);
    $response->assertSee('rel="describedby"', false);
    $response->assertSee('/llms.txt', false);
});

it('serves sitemap.xml with indexable pages and published posts only', function () {
    $published = BlogPost::factory()->create([
        'title' => 'Published SEO Post',
        'slug' => 'published-seo-post',
        'is_published' => true,
        'published_at' => now()->subDay(),
    ]);

    BlogPost::factory()->create([
        'title' => 'Draft SEO Post',
        'slug' => 'draft-seo-post',
        'is_published' => false,
        'published_at' => null,
    ]);

    $response = $this->get('/sitemap.xml');

    $response->assertOk();
    $response->assertHeader('Content-Type', 'application/xml; charset=UTF-8');
    $response->assertSee('https://pinpointlaunchpad.com/', false);
    $response->assertSee('https://pinpointlaunchpad.com/investor', false);
    $response->assertSee('https://pinpointlaunchpad.com/assessment', false);
    $response->assertSee('https://pinpointlaunchpad.com/blog', false);
    $response->assertSee('https://pinpointlaunchpad.com/blog/'.$published->slug, false);
    $response->assertDontSee('draft-seo-post', false);
    $response->assertDontSee('/admin', false);
    $response->assertDontSee('/diagnostic', false);
});

it('renders homepage with unique seo meta and json-ld', function () {
    $response = $this->get('/');

    $response->assertOk();
    $response->assertSee('Prove your startup is ready for investment | Pinpoint Launchpad', false);
    $response->assertSee('name="description"', false);
    $response->assertSee('rel="canonical"', false);
    $response->assertSee('https://pinpointlaunchpad.com/', false);
    $response->assertSee('property="og:title"', false);
    $response->assertSee('application/ld+json', false);
    $response->assertSee('FAQPage', false);
    $response->assertSee('Organization', false);
    $response->assertDontSee('content="noindex', false);
});

it('marks diagnostic pages as noindex', function () {
    $response = $this->get('/diagnostic');

    $response->assertOk();
    $response->assertSee('noindex, nofollow', false);
});

it('renders indexable marketing pages with canonical and og tags', function () {
    $cases = [
        '/' => ['Prove your startup is ready for investment', 'FAQPage'],
        '/investor' => ['See startups that have been reviewed', 'FAQPage'],
        '/assessment' => ['Pinpoint Investment Assessment', 'Service'],
        '/blog' => ['Insights and articles', 'Blog'],
        '/terms' => ['Terms of Service', 'WebPage'],
        '/privacy' => ['Privacy Notice', 'WebPage'],
        '/cookies' => ['Cookies Policy', 'WebPage'],
        '/investor-terms' => ['Investor Terms', 'WebPage'],
    ];

    foreach ($cases as $path => [$titlePart, $schemaType]) {
        $response = $this->get($path);
        $response->assertOk();
        $response->assertSee($titlePart, false);
        $response->assertSee('rel="canonical"', false);
        $response->assertSee('property="og:image"', false);
        $response->assertSee('name="twitter:card"', false);
        $response->assertSee('index, follow', false);
        $response->assertSee($schemaType, false);
        $response->assertDontSee('content="noindex', false);
    }
});

it('noindexes orbit demo and sample verify pages', function () {
    $this->get('/orbit-demo')->assertOk()->assertSee('noindex, nofollow', false);
    $this->get('/verify/sample-unicorn')->assertOk()->assertSee('noindex, nofollow', false);
});

it('applies blog post seo overrides on the show page', function () {
    $post = BlogPost::factory()->create([
        'title' => 'Diligence checklist for seed founders',
        'slug' => 'diligence-checklist-seed',
        'excerpt' => 'Practical steps before you send a deck.',
        'is_published' => true,
        'published_at' => now()->subDay(),
    ]);

    $response = $this->get('/blog/'.$post->slug);

    $response->assertOk();
    $response->assertSee('Diligence checklist for seed founders | Pinpoint Launchpad', false);
    $response->assertSee('Practical steps before you send a deck.', false);
    $response->assertSee('https://pinpointlaunchpad.com/blog/diligence-checklist-seed', false);
    $response->assertSee('BlogPosting', false);
    $response->assertSee('BreadcrumbList', false);
    $response->assertSee('index, follow', false);
});

it('builds blog post seo with article schema', function () {
    $post = BlogPost::factory()->make([
        'title' => 'How founders prepare for diligence',
        'slug' => 'how-founders-prepare',
        'excerpt' => 'A short guide to readiness.',
        'author_name' => 'Pinpoint Team',
        'is_published' => true,
        'published_at' => now(),
        'cover_image' => null,
    ]);
    $post->id = 1;
    $post->updated_at = now();

    $this->get('/'); // boot request container
    $seo = Seo::forBlogPost($post);

    expect($seo['title'])->toContain('How founders prepare for diligence')
        ->and($seo['description'])->toContain('A short guide')
        ->and($seo['canonical'])->toBe('https://pinpointlaunchpad.com/blog/how-founders-prepare')
        ->and($seo['og_type'])->toBe('article')
        ->and($seo['robots'])->toBe('index, follow');

    $types = collect($seo['json_ld'])->pluck('@type')->all();
    expect($types)->toContain('BlogPosting')
        ->and($types)->toContain('BreadcrumbList');
});
