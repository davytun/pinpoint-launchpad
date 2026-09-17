import { Link } from '@inertiajs/react';

import { cn } from '@/lib/utils';

type Variant = 'contact' | 'subscribe' | 'capture';

const COPY: Record<Variant, { before: string; after: string }> = {
    contact: {
        before: 'By submitting this form, you agree to our ',
        after: ' and consent to Pinpoint contacting you about your enquiry.',
    },
    subscribe: {
        before: 'By subscribing, you agree to our ',
        after: '. You can unsubscribe at any time.',
    },
    capture: {
        before: 'By continuing, you agree to our ',
        after: ' and consent to Pinpoint processing your details for this request.',
    },
};

interface PrivacyConsentProps {
    variant: Variant;
    /** Use on dark surfaces (e.g. footer). */
    tone?: 'light' | 'dark';
    className?: string;
}

export default function PrivacyConsent({ variant, tone = 'light', className }: PrivacyConsentProps) {
    const copy = COPY[variant];

    return (
        <p
            className={cn(
                'text-[11px] leading-relaxed',
                tone === 'dark' ? 'text-zinc-500' : 'text-zinc-400',
                className,
            )}
        >
            {copy.before}
            <Link
                href="/privacy"
                className={cn(
                    'font-medium underline underline-offset-2 transition-colors',
                    tone === 'dark' ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-500 hover:text-zinc-700',
                )}
            >
                Privacy Notice
            </Link>
            {copy.after}
        </p>
    );
}
