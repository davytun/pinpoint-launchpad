import { cn } from '@/lib/utils';

interface PinpointLogoProps {
    /** Height in pixels. Width scales automatically. Default: 28 */
    height?: number;
    /**
     * 'light' — renders the original full-color logo (for light backgrounds).
     * 'dark'  — renders the logo in white/light (for dark backgrounds).
     * Default: 'dark'
     */
    variant?: 'light' | 'dark';
    className?: string;
}

export function PinpointLogo({
    height = 28,
    variant = 'dark',
    className,
}: PinpointLogoProps) {
    return (
        <img
            src="/pinpoint-logo.png"
            alt="Pinpoint Launchpad"
            height={height}
            style={{
                height,
                width: 'auto',
                display: 'block',
                // On dark backgrounds: invert colors so the logo reads as white
                filter: variant === 'dark'
                    ? 'brightness(0) invert(1)'
                    : undefined,
            }}
            className={cn('select-none', className)}
        />
    );
}
