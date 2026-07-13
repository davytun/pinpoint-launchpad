import { Portal, PortalBackdrop } from '@/components/templates/orbit/ui/portal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MenuIcon, XIcon } from 'lucide-react';
import React from 'react';

const links = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Company', href: '#company' },
    { label: 'Blog', href: '#blog' },
];

export function MobileNav() {
    const [open, setOpen] = React.useState(false);

    return (
        <div className="md:hidden">
            <Button
                aria-controls="mobile-menu"
                aria-expanded={open}
                aria-label="Toggle menu"
                className="md:hidden"
                onClick={() => setOpen(!open)}
                size="icon"
                variant="outline"
            >
                <div className={cn('transition-all', open ? 'scale-100 opacity-100' : 'scale-0 opacity-0')}>
                    <XIcon />
                </div>
                <div className={cn('absolute transition-all', open ? 'scale-0 opacity-0' : 'scale-100 opacity-100')}>
                    <MenuIcon />
                </div>
            </Button>
            {open && (
                <Portal className="top-14">
                    <PortalBackdrop />
                    <div
                        className={cn('size-full overflow-y-auto p-6', 'data-[slot=open]:zoom-in-97 data-[slot=open]:animate-in ease-out')}
                        data-slot={open ? 'open' : 'closed'}
                    >
                        <div className="flex w-full flex-col gap-y-4">
                            {links.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    className="text-foreground border-border/50 border-b py-2 text-lg font-medium transition-transform duration-[160ms] ease-[var(--ease-out)] active:scale-[0.97]"
                                >
                                    {link.label}
                                </a>
                            ))}
                        </div>
                        <div className="mt-8 flex flex-col gap-3">
                            <Button
                                className="h-12 w-full text-base transition-transform duration-[160ms] ease-[var(--ease-out)] active:scale-[0.97]"
                                variant="outline"
                            >
                                Sign In
                            </Button>
                            <Button className="h-12 w-full text-base transition-transform duration-[160ms] ease-[var(--ease-out)] active:scale-[0.97]">
                                Get Started
                            </Button>
                        </div>
                    </div>
                </Portal>
            )}
        </div>
    );
}
