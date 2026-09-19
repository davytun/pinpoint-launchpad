import { router } from '@inertiajs/react';
import { useEffect } from 'react';

/**
 * Soft-refresh unread/recent notification shared props so badges stay current
 * without a full page navigation. Only runs while the tab is visible.
 */
export function useNotificationPolling(enabled: boolean, intervalMs = 45000) {
    useEffect(() => {
        if (!enabled) {
            return;
        }

        const tick = () => {
            if (document.visibilityState !== 'visible') {
                return;
            }

            router.reload({
                only: ['platform_unread_notifications', 'platform_recent_notifications'],
                preserveScroll: true,
                preserveState: true,
            });
        };

        const id = window.setInterval(tick, intervalMs);
        const onVisible = () => {
            if (document.visibilityState === 'visible') {
                tick();
            }
        };
        document.addEventListener('visibilitychange', onVisible);

        return () => {
            window.clearInterval(id);
            document.removeEventListener('visibilitychange', onVisible);
        };
    }, [enabled, intervalMs]);
}
