import { cn } from '@/lib/utils';

interface PinpointLogoProps {
    height?: number;
    variant?: 'light' | 'dark';
    className?: string;
}

export function PinpointLogo({ height = 28, className }: PinpointLogoProps) {
    return (
        <img
            src="/pinpoint-logo.png"
            alt="Pinpoint Launchpad"
            height={height}
            style={{
                height,
                width: 'auto',
                display: 'block',
            }}
            className={cn('select-none', className)}
        />
    );
}
