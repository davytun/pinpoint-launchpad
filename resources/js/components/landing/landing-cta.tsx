import { ArrowDown, ArrowRight, ArrowUpRight } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Tone = 'navy' | 'green' | 'outline';
type Size = 'sm' | 'md' | 'lg';
type Direction = 'right' | 'up-right' | 'down';

const tones: Record<Tone, { button: string; disc: string; arrow: string }> = {
    navy: {
        button: 'bg-[#2F468B] text-white hover:bg-[#243868]',
        disc: 'bg-white',
        arrow: 'text-[#2F468B]',
    },
    green: {
        button: 'bg-[#6EBE44] text-white hover:bg-[#5da837]',
        disc: 'bg-white',
        arrow: 'text-[#3A7D2C]',
    },
    outline: {
        button: 'border border-zinc-900 bg-white text-zinc-950 hover:bg-zinc-50',
        disc: 'bg-zinc-950',
        arrow: 'text-white',
    },
};

const sizes: Record<Size, { root: string; disc: string; icon: string }> = {
    sm: { root: 'h-10 pl-4 text-[13px]', disc: 'ml-2.5 size-7', icon: 'size-3.5' },
    md: { root: 'h-11 pl-5 text-sm', disc: 'ml-3 size-8', icon: 'size-4' },
    lg: { root: 'h-12 pl-6 text-sm sm:h-14 sm:pl-7 sm:text-base', disc: 'ml-3 size-9 sm:ml-3.5 sm:size-10', icon: 'size-4' },
};

const directions: Record<Direction, { icon: typeof ArrowRight; motion: string }> = {
    right: { icon: ArrowRight, motion: 'group-hover:translate-x-0.5' },
    'up-right': { icon: ArrowUpRight, motion: 'group-hover:translate-x-0.5 group-hover:-translate-y-0.5' },
    down: { icon: ArrowDown, motion: 'group-hover:translate-y-0.5' },
};

interface LandingCtaProps {
    href?: string;
    onClick?: () => void;
    children: ReactNode;
    tone?: Tone;
    size?: Size;
    direction?: Direction;
    className?: string;
    type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
    id?: string;
    disabled?: boolean;
}

export default function LandingCta({
    href,
    onClick,
    children,
    tone = 'navy',
    size = 'md',
    direction = 'right',
    className = '',
    type = 'button',
    id,
    disabled = false,
}: LandingCtaProps) {
    const look = tones[tone];
    const scale = sizes[size];
    const point = directions[direction];
    const Icon = point.icon;
    const classes = `group inline-flex items-center justify-center rounded-full pr-1 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F468B] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${look.button} ${scale.root} ${className}`;
    const body = (
        <>
            <span>{children}</span>
            <span className={`flex shrink-0 items-center justify-center rounded-full transition-transform duration-200 ${point.motion} ${look.disc} ${scale.disc}`}>
                <Icon className={`${scale.icon} ${look.arrow}`} aria-hidden />
            </span>
        </>
    );

    if (href) {
        return (
            <a id={id} href={href} onClick={onClick} className={classes}>
                {body}
            </a>
        );
    }

    return (
        <button id={id} type={type} onClick={onClick} disabled={disabled} className={classes}>
            {body}
        </button>
    );
}
