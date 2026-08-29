import { Icon } from '@iconify/react';
import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function GlobalLoader() {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>;

        const unsubscribeStart = router.on('start', () => {
            // Add a small delay so fast navigations don't flash the loader
            timeout = setTimeout(() => setLoading(true), 250);
        });

        const unsubscribeFinish = router.on('finish', () => {
            clearTimeout(timeout);
            setLoading(false);
        });

        return () => {
            unsubscribeStart();
            unsubscribeFinish();
        };
    }, []);

    if (!loading) return null;

    return (
        <div className="animate-in slide-in-from-top-4 fade-in-0 zoom-in-95 fixed top-6 left-1/2 z-100 flex -translate-x-1/2 items-center gap-3 rounded-full border border-zinc-800 bg-zinc-950 px-5 py-2.5 text-[13px] font-semibold text-white shadow-2xl duration-200">
            <Icon icon="solar:spinner-linear" className="size-4.5 animate-spin text-zinc-400" />
            <span className="tracking-wide">Loading...</span>
        </div>
    );
}
