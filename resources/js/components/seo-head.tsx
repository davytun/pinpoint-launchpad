import { Head, usePage } from '@inertiajs/react';

export type SeoProps = {
    title?: string;
    title_part?: string;
    description?: string;
    canonical?: string;
    robots?: string;
    og_type?: string;
    og_title?: string;
    og_description?: string;
    og_image?: string;
    og_url?: string;
    og_site_name?: string;
    twitter_card?: string;
    twitter_title?: string;
    twitter_description?: string;
    twitter_image?: string;
    json_ld?: Record<string, unknown>[];
    llms_txt?: string;
    google_site_verification?: string | null;
    bing_site_verification?: string | null;
    indexable?: boolean;
};

/**
 * Mirrors server-rendered SEO from the shared `seo` prop into Inertia <Head>
 * so client-side navigations keep correct meta tags.
 * JSON-LD stays in Blade (first HTML) — crawlers and social scrapers read that.
 */
export default function SeoHead({ seo: seoOverride }: { seo?: Partial<SeoProps> }) {
    const { seo: sharedSeo } = usePage<{ seo?: SeoProps }>().props;
    const seo = { ...(sharedSeo ?? {}), ...(seoOverride ?? {}) };

    const title = seo.title ?? 'Pinpoint Launchpad';
    const description = seo.description ?? '';
    const canonical = seo.canonical ?? '';
    const robots = seo.robots ?? 'index, follow';
    const ogImage = seo.og_image ?? '';

    return (
        <Head>
            <title>{title}</title>
            {description ? <meta head-key="description" name="description" content={description} /> : null}
            <meta head-key="robots" name="robots" content={robots} />
            {canonical ? <link head-key="canonical" rel="canonical" href={canonical} /> : null}
            {seo.llms_txt ? (
                <link head-key="llms" rel="describedby" href={seo.llms_txt} title="LLM context" />
            ) : null}

            <meta head-key="og:locale" property="og:locale" content="en_US" />
            <meta head-key="og:type" property="og:type" content={seo.og_type ?? 'website'} />
            <meta head-key="og:site_name" property="og:site_name" content={seo.og_site_name ?? 'Pinpoint Launchpad'} />
            <meta head-key="og:title" property="og:title" content={seo.og_title ?? title} />
            {description ? (
                <meta head-key="og:description" property="og:description" content={seo.og_description ?? description} />
            ) : null}
            {canonical ? <meta head-key="og:url" property="og:url" content={seo.og_url ?? canonical} /> : null}
            {ogImage ? <meta head-key="og:image" property="og:image" content={ogImage} /> : null}

            <meta head-key="twitter:card" name="twitter:card" content={seo.twitter_card ?? 'summary_large_image'} />
            <meta head-key="twitter:title" name="twitter:title" content={seo.twitter_title ?? title} />
            {description ? (
                <meta
                    head-key="twitter:description"
                    name="twitter:description"
                    content={seo.twitter_description ?? description}
                />
            ) : null}
            {ogImage ? <meta head-key="twitter:image" name="twitter:image" content={ogImage} /> : null}
        </Head>
    );
}
