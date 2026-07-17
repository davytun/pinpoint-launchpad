import { Head, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import { useState } from 'react';

import { PinpointLogo } from '@/components/pinpoint-logo';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import DiagnosticLayout from '@/layouts/diagnostic-layout';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Tier {
    key: string;
    label: string;
    tagline: string;
    base_price: number;
    total: number;
    naira_equivalent: number;
    features: string[];
    is_featured: boolean;
    redeemable: boolean;
    redeemable_tooltip?: string;
}

interface PageProps {
    score: number;
    score_band: 'mid_high' | 'high';
    tiers: Tier[];
    diagnostic_session_id: number;
    currency_symbol?: string;
    billing_currency_symbol?: string;
    billing_ngn_fallback?: boolean;
}

// ─── Band meta ────────────────────────────────────────────────────────────────

const BAND_META: Record<string, { label: string; bg: string; text: string; border: string; glow: string }> = {
    mid_high: {
        label: 'Investment Pipeline',
        bg: 'rgba(60,83,168,0.12)',
        text: '#3A54A5',
        border: 'rgba(60,83,168,0.45)',
        glow: 'rgba(60,83,168,0.18)',
    },
    high: {
        label: 'Top Percentile',
        bg: 'rgba(16,185,129,0.12)',
        text: '#10B981',
        border: 'rgba(16,185,129,0.45)',
        glow: 'rgba(16,185,129,0.18)',
    },
};

// ─── Animations ────────────────────────────────────────────────────────────────

function FadeUp({ delay = 0, children }: { delay?: number; children: React.ReactNode }) {
    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay, ease: [0.25, 1, 0.5, 1] }}>
            {children}
        </motion.div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CheckoutIndex({
    score,
    score_band,
    tiers,
    diagnostic_session_id,
    currency_symbol = '₦',
    billing_currency_symbol = '₦',
    billing_ngn_fallback = false,
}: PageProps) {
    const [selectedTier, setSelectedTier] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const bandMeta = BAND_META[score_band] ?? BAND_META.mid_high;

    function handleSelectTier(tierKey: string) {
        setError(null);
        setSelectedTier(tierKey);
        router.post(
            '/checkout/initiate',
            { tier: tierKey, diagnostic_session_id },
            {
                onStart: () => setIsLoading(true),
                onFinish: () => setIsLoading(false),
                onError: (errors) => {
                    setIsLoading(false);
                    setSelectedTier(null);
                    const first = Object.values(errors)[0];
                    setError(typeof first === 'string' ? first : 'Something went wrong. Please try again.');
                },
            },
        );
    }

    // Determine dynamic price text for Stage 03 to show in the rationale block
    const stage3PriceText = tiers[2] ? `${currency_symbol}${tiers[2].base_price.toLocaleString()}` : `$3,500`;

    const rationaleItems = [
        {
            num: '01',
            title: 'The "Redeemable" Seed+ / Growth Model',
            body: `We have skin in the game. For Seed+ / Growth ventures, we view ourselves as your External Series A Partner. While the ${stage3PriceText} covers the intensive manual labor of auditing your corporate governance and financials, we credit that amount back to you upon the successful close of your round. If you win, we win.`,
        },
        {
            num: '02',
            title: 'The Analyst Hours',
            body: "Every Seed / Early Traction and Seed+ / Growth assessment involves between 25 and 60+ hours of manual forensic work by our investment team. You aren't just buying a PDF; you are hiring a due diligence team to stress-test your business before you get to the pitch room.",
        },
        {
            num: '03',
            title: 'No Hidden Commissions',
            body: 'Unlike "brokers," we do not take a percentage of the cash you raise. We also do not take any equity in your startup. The fee we charge for your PARAGON Investment Assessment (PIA) is what we take. If you then wish to proceed to the PARAGON Investment Window (PIW) to consult us to fix any gaps, you will pay us a separate consultancy fee.',
        },
    ];

    return (
        <>
            <Head title="Choose Your Audit Tier — PARAGON Certification" />

            <DiagnosticLayout hideWordmark glowColor={bandMeta.glow}>
                <TooltipProvider delayDuration={100} skipDelayDuration={0}>
                    <div className="mx-auto max-w-5xl px-6 pt-8 pb-28 md:px-8">
                        {/* ── Wordmark ── */}
                        <header className="mb-10 flex items-center justify-between">
                            <PinpointLogo height={24} variant="dark" />
                        </header>

                        {/* ── Hero header ── */}
                        <div className="mb-16 text-center">
                            <FadeUp delay={0.05}>
                                <span className="text-xs font-bold tracking-widest text-[#3A54A5] uppercase">PARAGON Certification Programme</span>
                            </FadeUp>

                            <FadeUp delay={0.12}>
                                <h1 className="font-display mt-4 text-4xl font-bold tracking-tight text-zinc-950 sm:text-5xl">
                                    Audit Tier Selection
                                </h1>
                            </FadeUp>

                            <FadeUp delay={0.18}>
                                <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-zinc-500">
                                    Your score of <span className="font-bold text-zinc-950">{score}/100</span> qualifies you for the following
                                    credential programmes.
                                </p>
                            </FadeUp>
                        </div>

                        {/* ── Error banner ── */}
                        {error && (
                            <motion.div
                                role="alert"
                                aria-live="assertive"
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
                            >
                                {error}
                            </motion.div>
                        )}

                        {/* ── Pricing cards ── */}
                        <div className="grid grid-cols-1 items-stretch gap-8 md:grid-cols-3">
                            {tiers.map((tier, i) => {
                                const isSelected = selectedTier === tier.key;
                                const isOther = isLoading && !isSelected;

                                return (
                                    <FadeUp key={tier.key} delay={0.25 + i * 0.1}>
                                        <div
                                            className={cn(
                                                'relative flex h-full flex-col justify-between p-8 transition-all duration-300 hover:-translate-y-1',
                                                tier.is_featured
                                                    ? 'rounded-4xl bg-[#2D4182] text-white shadow-xl hover:bg-[#25366D] md:-mt-4'
                                                    : 'rounded-4xl border border-white/80 bg-white/30 text-zinc-900 shadow-[0_8px_30px_rgba(58,84,165,0.02)] backdrop-blur-md hover:bg-white/50',
                                            )}
                                        >
                                            <div className="flex flex-1 flex-col">
                                                {/* Tier label + name + tagline */}
                                                <div className="flex items-center justify-between">
                                                    <span
                                                        className={cn(
                                                            'text-xs font-bold tracking-widest uppercase',
                                                            tier.is_featured ? 'text-[#93C5FD]' : 'text-[#3A54A5]',
                                                        )}
                                                    >
                                                        Stage 0{i + 1}
                                                    </span>
                                                </div>
                                                <h3 className="mt-1 text-2xl font-bold">{tier.label}</h3>
                                                <p
                                                    className={cn(
                                                        'mt-3 text-sm leading-relaxed',
                                                        tier.is_featured ? 'text-white/70' : 'text-zinc-500',
                                                    )}
                                                >
                                                    <strong className={tier.is_featured ? 'text-white' : 'text-zinc-800'}>Best for:</strong>{' '}
                                                    {tier.tagline}
                                                </p>

                                                {/* Price block */}
                                                <div className="mt-6">
                                                    <span className={cn('text-xs font-medium', tier.is_featured ? 'text-white/50' : 'text-zinc-400')}>
                                                        Total Price
                                                    </span>
                                                    <div className="mt-1 flex items-baseline gap-1">
                                                        <span className="text-4xl font-extrabold tracking-tight">
                                                            {currency_symbol}
                                                            {tier.base_price.toLocaleString()}
                                                        </span>
                                                    </div>
                                                    {billing_ngn_fallback && (
                                                        <p
                                                            className={cn(
                                                                'mt-2 text-[10px] leading-normal font-bold tracking-wider uppercase opacity-85',
                                                                tier.is_featured ? 'text-white/80' : 'text-zinc-500',
                                                            )}
                                                        >
                                                            Billed in NGN: ₦{tier.naira_equivalent.toLocaleString()}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Features list */}
                                                <ul
                                                    className={cn(
                                                        'mt-8 flex-1 space-y-4 border-t pt-6 text-xs',
                                                        tier.is_featured ? 'border-white/10 text-white/80' : 'text-zinc-650 border-zinc-200/50',
                                                    )}
                                                >
                                                    {tier.features.map((feature, fi) => {
                                                        const isEverything = feature.toLowerCase().startsWith('everything in');
                                                        return (
                                                            <li key={fi} className="flex items-start gap-2.5">
                                                                {isEverything ? (
                                                                    <ArrowRight className="mt-0.5 h-3 w-3 shrink-0" />
                                                                ) : (
                                                                    <span
                                                                        className={cn(
                                                                            'flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full',
                                                                            tier.is_featured
                                                                                ? 'bg-white/15 text-white'
                                                                                : 'bg-[#3A54A5]/10 text-[#3A54A5]',
                                                                        )}
                                                                    >
                                                                        <Check className="h-3 w-3 stroke-[3]" />
                                                                    </span>
                                                                )}
                                                                <span className={cn('leading-relaxed', isEverything ? 'italic' : '')}>{feature}</span>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </div>

                                            {/* Button (perfectly aligned at the bottom) */}
                                            <div className="relative mt-8 space-y-4">
                                                {tier.redeemable && tier.redeemable_tooltip && (
                                                    <div className="flex justify-center">
                                                        <Tooltip delayDuration={50}>
                                                            <TooltipTrigger asChild>
                                                                <button
                                                                    type="button"
                                                                    className={cn(
                                                                        'inline-flex cursor-help items-center gap-1 rounded-full border px-2.5 py-0.5 text-[8px] font-black tracking-widest uppercase transition-colors',
                                                                        tier.is_featured
                                                                            ? 'border-white/30 bg-white/15 text-white hover:bg-white/25'
                                                                            : 'border-[#3A54A5]/30 bg-[#3A54A5]/10 text-[#3A54A5] hover:bg-[#3A54A5]/20',
                                                                    )}
                                                                >
                                                                    Redeemable
                                                                </button>
                                                            </TooltipTrigger>
                                                            <TooltipContent
                                                                className="text-zinc-650 z-[100] max-w-[280px] rounded-xl border border-zinc-200 bg-white p-4 font-sans text-[13px] leading-relaxed shadow-xl"
                                                                side="top"
                                                                align="center"
                                                                sideOffset={12}
                                                            >
                                                                {tier.redeemable_tooltip}
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                )}
                                                <button
                                                    type="button"
                                                    disabled={isLoading}
                                                    onClick={() => handleSelectTier(tier.key)}
                                                    className={cn(
                                                        'group flex h-11 w-full cursor-pointer items-center justify-center rounded-full text-sm font-bold transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50',
                                                        tier.is_featured
                                                            ? 'bg-white text-[#2D4182] hover:bg-zinc-100'
                                                            : 'border border-[#3A54A5] bg-transparent text-[#3A54A5] hover:bg-[#3A54A5] hover:text-white',
                                                    )}
                                                >
                                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                                        {isSelected && isLoading ? (
                                                            <>
                                                                <Loader2 className="size-4 animate-spin" />
                                                                Redirecting…
                                                            </>
                                                        ) : billing_ngn_fallback ? (
                                                            `Get Started — ₦${tier.naira_equivalent.toLocaleString()} (~$${tier.total.toLocaleString()})`
                                                        ) : (
                                                            `Get Started — ${billing_currency_symbol}${tier.total.toLocaleString()}`
                                                        )}
                                                    </span>
                                                </button>
                                            </div>

                                            {/* Dim overlay on non-selected cards while loading */}
                                            <AnimatePresence>
                                                {isOther && (
                                                    <motion.div
                                                        className="pointer-events-none absolute inset-0 rounded-4xl bg-black/10"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                    />
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </FadeUp>
                                );
                            })}
                        </div>

                        {/* ── Rationale section ── */}
                        <FadeUp delay={0.6}>
                            <div className="mt-24">
                                <div className="mb-16 space-y-3 text-center">
                                    <span className="text-xs font-bold tracking-widest text-[#3A54A5] uppercase">Radical Transparency</span>
                                    <h2 className="font-display text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
                                        Why we charge what we charge
                                    </h2>
                                </div>

                                <div className="grid gap-6 md:grid-cols-2">
                                    {rationaleItems.map((item, i) => (
                                        <FadeUp key={item.num} delay={0.7 + i * 0.08}>
                                            <div className="group relative flex h-full flex-col overflow-hidden rounded-4xl border border-white/80 bg-white/30 p-8 shadow-[0_8px_30px_rgba(58,84,165,0.02)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/50 hover:shadow-md">
                                                <div className="relative z-10 flex flex-1 flex-col">
                                                    <h3 className="mb-3 text-[12px] font-bold tracking-[0.18em] text-[#3A54A5] uppercase">
                                                        {item.title}
                                                    </h3>
                                                    <p className="text-zinc-650 text-[14px] leading-relaxed">{item.body}</p>
                                                </div>
                                            </div>
                                        </FadeUp>
                                    ))}
                                </div>
                            </div>
                        </FadeUp>

                        {/* ── Refund note ── */}
                        <FadeUp delay={1.1}>
                            <p className="mt-10 text-center text-xs text-zinc-400">
                                Full refund available if your audit has not yet commenced. Once analyst work begins, no refund is applicable.
                            </p>
                        </FadeUp>
                    </div>
                </TooltipProvider>
            </DiagnosticLayout>
        </>
    );
}
