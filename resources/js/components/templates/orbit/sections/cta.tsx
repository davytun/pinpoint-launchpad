import { Button } from '@/components/ui/button';
import { ArrowRightIcon, CreditCardIcon } from 'lucide-react';

export function CallToAction() {
    return (
        <div className="border-foreground/10 bg-background/5 relative mx-auto flex w-full max-w-4xl flex-col justify-between gap-y-10 rounded-[2.5rem] border p-[0.375rem] shadow-sm inset-shadow-2xs">
            <div className="border-foreground/10 bg-background/80 relative flex h-full w-full flex-col items-center justify-center rounded-[calc(2.5rem-0.375rem)] border px-6 py-20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] backdrop-blur-2xl md:py-24">
                <div className="space-y-4">
                    <h2 className="text-center text-3xl leading-none font-semibold tracking-tight md:text-5xl">Ready to transform your workflow?</h2>
                    <p className="text-muted-foreground text-center text-sm text-balance md:text-base">
                        Join thousands of teams already using Orbit. Start your free trial today. No credit card{' '}
                        <CreditCardIcon className="inline-block size-4" /> required.
                    </p>
                </div>
                <div className="mt-6 flex items-center justify-center gap-4">
                    <Button
                        className="rounded-full px-6 py-4 transition-transform duration-[160ms] ease-[var(--ease-out)] active:scale-[0.97]"
                        variant="secondary"
                    >
                        View Pricing
                    </Button>
                    <Button className="group rounded-full py-4 pr-1.5 pl-6 transition-transform duration-[160ms] ease-[var(--ease-out)] active:scale-[0.97]">
                        <span className="mr-4">Get Started</span>
                        <div className="bg-background/20 flex size-8 items-center justify-center rounded-full transition-transform duration-200 ease-[var(--ease-out)] group-hover:translate-x-1 group-hover:scale-105">
                            <ArrowRightIcon data-icon="inline-end" />
                        </div>
                    </Button>
                </div>
            </div>
        </div>
    );
}
