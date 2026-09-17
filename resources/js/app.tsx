import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { route as routeFn } from 'ziggy-js';
import SeoHead from './components/seo-head';
import { initializeTheme } from './hooks/use-appearance';

declare global {
    const route: typeof routeFn;
}

const appName = import.meta.env.VITE_APP_NAME || 'Pinpoint Launchpad';

createInertiaApp({
    // Prefer full titles from SeoHead (<title>); fallback appends site name for legacy Head title= props
    title: (title) => (title.includes('|') || title.includes(appName) ? title : `${title} | ${appName}`),
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <App {...props}>
                {({ Component, props: pageProps, key }) => (
                    <>
                        <SeoHead />
                        <Component key={key} {...pageProps} />
                    </>
                )}
            </App>,
        );
    },
    progress: false,
});

initializeTheme();
