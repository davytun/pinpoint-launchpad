<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        @php
            $seo = $page['props']['seo'] ?? [];
            $seoTitle = $seo['title'] ?? config('app.name', 'Pinpoint Launchpad');
            $seoDescription = $seo['description'] ?? '';
            $seoCanonical = $seo['canonical'] ?? rtrim(config('app.url'), '/').'/';
            $seoRobots = $seo['robots'] ?? 'index, follow';
            $seoOgType = $seo['og_type'] ?? 'website';
            $seoOgImage = $seo['og_image'] ?? url('/og-image.png');
            $seoSiteName = $seo['og_site_name'] ?? config('app.name', 'Pinpoint Launchpad');
            $seoJsonLd = $seo['json_ld'] ?? [];
            $llmsTxtUrl = $seo['llms_txt'] ?? (rtrim(config('app.url'), '/').'/llms.txt');
        @endphp

        <title inertia>{{ $seoTitle }}</title>
        @if ($seoDescription !== '')
            <meta name="description" content="{{ $seoDescription }}">
        @endif
        <meta name="robots" content="{{ $seoRobots }}">
        <link rel="canonical" href="{{ $seoCanonical }}">
        <link rel="describedby" href="{{ $llmsTxtUrl }}" title="LLM context">

        <meta property="og:locale" content="en_US">
        <meta property="og:type" content="{{ $seoOgType }}">
        <meta property="og:site_name" content="{{ $seoSiteName }}">
        <meta property="og:title" content="{{ $seo['og_title'] ?? $seoTitle }}">
        @if ($seoDescription !== '')
            <meta property="og:description" content="{{ $seo['og_description'] ?? $seoDescription }}">
        @endif
        <meta property="og:url" content="{{ $seo['og_url'] ?? $seoCanonical }}">
        <meta property="og:image" content="{{ $seoOgImage }}">

        <meta name="twitter:card" content="{{ $seo['twitter_card'] ?? 'summary_large_image' }}">
        <meta name="twitter:title" content="{{ $seo['twitter_title'] ?? $seoTitle }}">
        @if ($seoDescription !== '')
            <meta name="twitter:description" content="{{ $seo['twitter_description'] ?? $seoDescription }}">
        @endif
        <meta name="twitter:image" content="{{ $seo['twitter_image'] ?? $seoOgImage }}">

        @if (! empty($seo['google_site_verification']))
            <meta name="google-site-verification" content="{{ $seo['google_site_verification'] }}">
        @endif
        @if (! empty($seo['bing_site_verification']))
            <meta name="msvalidate.01" content="{{ $seo['bing_site_verification'] }}">
        @endif

        @foreach ($seoJsonLd as $block)
            <script type="application/ld+json">{!! json_encode(array_merge(['@context' => 'https://schema.org'], $block), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) !!}</script>
        @endforeach

        <!-- Favicons -->
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="icon" href="/favicon.ico" type="image/x-ico" />

        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
