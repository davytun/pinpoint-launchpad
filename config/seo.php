<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Site identity
    |--------------------------------------------------------------------------
    |
    | Canonical URLs, Open Graph tags, and the sitemap use config('app.url').
    | In production set APP_URL=https://pinpointlaunchpad.com
    |
    */

    'site_name' => env('APP_NAME', 'Pinpoint Launchpad'),

    'default_og_image' => '/og-image.png',

    'twitter_card' => 'summary_large_image',

    /*
    |--------------------------------------------------------------------------
    | Search Console / Bing verification
    |--------------------------------------------------------------------------
    |
    | Paste values from Google Search Console and Bing Webmaster Tools into
    | .env — do not invent codes. Leave empty until you have them.
    |
    | GOOGLE_SITE_VERIFICATION=...
    | BING_SITE_VERIFICATION=...
    |
    */

    'google_site_verification' => env('GOOGLE_SITE_VERIFICATION'),

    'bing_site_verification' => env('BING_SITE_VERIFICATION'),

    'organization' => [
        'name' => 'Pinpoint Launchpad',
        'legal_name' => 'Pinpoint Launchpad Ltd',
        'logo' => '/pinpoint-logo.png',
        'email' => 'support@pinpointlaunchpad.com',
        'url' => null, // resolved to app.url at runtime
        // Add real profile URLs when available; omit empty sameAs entries.
        'same_as' => [],
    ],

    /*
    |--------------------------------------------------------------------------
    | Indexable page metadata (title is page-specific; site name appended in UI)
    |--------------------------------------------------------------------------
    */

    'pages' => [

        'waitlist.index' => [
            'title' => 'Prove your startup is ready for investment',
            'description' => 'Pinpoint helps founders verify startup information, find gaps, and build a profile investors can review. Start with a free Self-Scan or apply for the Pinpoint Investment Assessment.',
            'robots' => 'index, follow',
            'og_type' => 'website',
            'schema' => ['organization', 'website', 'faq'],
        ],

        'investor.index' => [
            'title' => 'See startups that have been reviewed, not just pitched',
            'description' => 'Join Pinpoint as an investor to browse reviewed startups, see readiness scores and gaps, and dig deeper when a company deserves your time.',
            'robots' => 'index, follow',
            'og_type' => 'website',
            'schema' => ['organization', 'faq_investor'],
        ],

        'assessment' => [
            'title' => 'Pinpoint Investment Assessment',
            'description' => 'The Pinpoint Investment Assessment is an analyst-led review against the PARAGON framework. Submit evidence, receive a written Assessment Report, and understand where your startup is ready for investor scrutiny.',
            'robots' => 'index, follow',
            'og_type' => 'website',
            'schema' => ['organization', 'service'],
        ],

        'blog.index' => [
            'title' => 'Insights and articles',
            'description' => 'Articles from Pinpoint Launchpad on investment readiness, founder preparation, and how investors review startups on the platform.',
            'robots' => 'index, follow',
            'og_type' => 'website',
            'schema' => ['organization', 'blog'],
        ],

        'terms' => [
            'title' => 'Terms of Service',
            'description' => 'Terms of Service governing the use of pinpointlaunchpad.com and the Pinpoint services.',
            'robots' => 'index, follow',
            'og_type' => 'website',
            'schema' => ['webpage'],
        ],

        'privacy' => [
            'title' => 'Privacy Notice',
            'description' => 'How Pinpoint Launchpad collects, uses, and protects personal information on pinpointlaunchpad.com.',
            'robots' => 'index, follow',
            'og_type' => 'website',
            'schema' => ['webpage'],
        ],

        'cookies' => [
            'title' => 'Cookies Policy',
            'description' => 'How Pinpoint Launchpad uses cookies and similar technologies on pinpointlaunchpad.com.',
            'robots' => 'index, follow',
            'og_type' => 'website',
            'schema' => ['webpage'],
        ],

        'investor-terms' => [
            'title' => 'Investor Terms',
            'description' => 'Terms governing investor use of the Pinpoint Investment Network (PIN) and related Pinpoint services.',
            'robots' => 'index, follow',
            'og_type' => 'website',
            'schema' => ['webpage'],
        ],

    ],

    /*
    |--------------------------------------------------------------------------
    | FAQ content for FAQPage JSON-LD (must match visible page FAQs)
    |--------------------------------------------------------------------------
    */

    'faqs' => [

        'home' => [
            [
                'question' => 'What is Pinpoint?',
                'answer' => 'Pinpoint helps founders verify their startup information, find gaps, and build a profile investors can review on the same platform. Founders use Self-Scan and Assessment; investors discover startups through Spotlight.',
            ],
            [
                'question' => 'What is the Self-Scan?',
                'answer' => 'Self-Scan is a free, automated diagnostic. You answer about 25 questions and get a provisional PARAGON score across seven pillars. There is no human review and no document check. Results are private to you. Nothing is shown to investors.',
            ],
            [
                'question' => 'What is the paid Assessment (PIA)?',
                'answer' => 'The Pinpoint Investment Assessment is a paid, analyst-led review against the PARAGON framework. You submit evidence; analysts deliver a written Assessment Report. Scope and depth depend on your stage tier.',
            ],
            [
                'question' => 'What is the PARAGON score?',
                'answer' => 'PARAGON measures investment-readiness across seven dimensions: Potential, Agility, Risk, Alignment, Governance, Operations, and Network. A higher score is a stronger readiness signal, not an approval to raise capital or an investment recommendation.',
            ],
            [
                'question' => 'Does Assessment guarantee I will get funded?',
                'answer' => 'No. Pinpoint does not guarantee funding, introductions, or investor interest. Assessment helps you understand readiness and present clearer information. Investors make their own decisions.',
            ],
            [
                'question' => 'Who can see my information?',
                'answer' => 'Self-Scan results are for you alone. Assessment materials stay with Pinpoint and your team unless you consent to disclosure. Spotlight listing is discretionary after Assessment and requires your consent to be visible to admitted investors.',
            ],
            [
                'question' => 'How do investors discover startups?',
                'answer' => 'Admitted investors use Spotlight on Pinpoint to browse published profiles, review readiness information, and request next steps such as questions, data-room access, or a mediated founder call.',
            ],
            [
                'question' => 'How much does it cost?',
                'answer' => 'Self-Scan is free. Paid Assessment tiers start from ₦350,000 / $500 for Concept, $1,500 for Seed, and $3,500+ for Growth. Fees are fixed for assessment work and are not contingent on whether you raise capital.',
            ],
        ],

        'investor' => [
            [
                'question' => 'Is this an investment recommendation?',
                'answer' => 'No. A readiness score and a published profile are information tools. They are not advice to invest, and Pinpoint does not recommend deals.',
            ],
            [
                'question' => 'Who reviewed these startups?',
                'answer' => 'Pinpoint analysts review submitted information against the PARAGON framework during Assessment. Visibility on Spotlight still requires founder consent and Pinpoint’s publication criteria.',
            ],
            [
                'question' => 'What can I do after I find a startup?',
                'answer' => 'You can ask a question, request document access, or arrange a mediated founder call. Detailed materials stay behind authentication and approvals.',
            ],
            [
                'question' => 'Is Pinpoint a broker or adviser?',
                'answer' => 'No. Pinpoint provides curated visibility and helps coordinate access. It does not broker investments, give investment advice, or guarantee outcomes.',
            ],
            [
                'question' => 'Who can see founder information?',
                'answer' => 'Only admitted investors with approved KYC can access Spotlight. Detailed documents need extra permission. Founders control whether they are visible.',
            ],
        ],

    ],

    /*
    |--------------------------------------------------------------------------
    | Route name prefixes / exact names that should be noindex
    |--------------------------------------------------------------------------
    */

    'noindex_route_prefixes' => [
        'admin.',
        'founder.',
        'diagnostic.',
        'checkout.',
        'onboarding.',
        'password.',
        'verification.',
        'dashboard',
    ],

    'noindex_route_names' => [
        'orbit.demo',
        'verify.sample',
        'login',
        'register',
        'investor.login',
        'investor.onboarding',
        'investor.password.request',
        'investor.password.reset',
        'investor.dashboard',
        'investor.kyc.create',
        'investor.spotlight.index',
        'investor.spotlight.show',
        'investor.interests.index',
        'investor.diligence.index',
        'investor.data-rooms.index',
        'investor.data-rooms.show',
        'investor.notifications.index',
        'admin.login',
        'tester.guide',
    ],

    'noindex_path_prefixes' => [
        '/admin',
        '/founder',
        '/diagnostic',
        '/checkout',
        '/onboarding',
        '/login',
        '/register',
        '/forgot-password',
        '/reset-password',
        '/confirm-password',
        '/verify-email',
        '/orbit-demo',
        '/verify',
        '/tester-guide',
        '/dashboard',
        '/investor/login',
        '/investor/onboarding',
        '/investor/dashboard',
        '/investor/kyc',
        '/investor/spotlight',
        '/investor/interests',
        '/investor/diligence',
        '/investor/data-rooms',
        '/investor/notifications',
        '/investor/forgot-password',
        '/investor/reset-password',
    ],

    /*
    |--------------------------------------------------------------------------
    | Static URLs included in sitemap.xml (path => optional lastmod hint)
    |--------------------------------------------------------------------------
    */

    'sitemap_paths' => [
        '/',
        '/investor',
        '/assessment',
        '/blog',
        '/terms',
        '/privacy',
        '/cookies',
        '/investor-terms',
    ],

];
