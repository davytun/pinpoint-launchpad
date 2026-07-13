'use client';

import { useScroll } from '@/components/templates/orbit/hooks/use-scroll';
import { Logo } from '@/components/templates/orbit/ui/logo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DesktopNav } from './desktop-nav';
import { MobileNav } from './mobile-nav';

export function Header() {
    const scrolled = useScroll(10);

    return (
        <header
            className={cn('sticky top-0 z-50 w-full border-b border-transparent', {
                'border-border bg-background/95 supports-backdrop-filter:bg-background/50 backdrop-blur-sm': scrolled,
            })}
        >
            <nav className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
                <div className="flex items-center gap-5">
                    <a className="hover:bg-muted dark:hover:bg-muted/50 rounded-lg px-3 py-2.5" href="#">
                        <Logo className="h-4" />
                    </a>
                    <DesktopNav />
                </div>
                <div className="hidden items-center gap-2 md:flex">
                    <Button variant="outline">Sign In</Button>
                    <Button>Get Started</Button>
                </div>
                <MobileNav />
            </nav>
        </header>
    );
}
