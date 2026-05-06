import { Head, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
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
    gate_fee: number;
    total: number;
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
}

// ─── Band meta ────────────────────────────────────────────────────────────────

const BAND_META: Record<string, { label: string; bg: string; text: string; border: string; glow: string }> = {
    mid_high: {
        label:  'Investment Pipeline',
        bg:     'rgba(60,83,168,0.12)',
        text:   '#93C5FD',
        border: 'rgba(60,83,168,0.45)',
        glow:   'rgba(60,83,168,0.18)',
    },
    high: {
        label:  'Top Percentile',
        bg:     'rgba(92,163,54,0.12)',
        text:   '#86EFAC',
        border: 'rgba(92,163,54,0.45)',
        glow:   'rgba(92,163,54,0.18)',
    },
};

// ─── Tier Styles ──────────────────────────────────────────────────────────────

const FEATURED_ACCENT = {
    color: '#3A54A5',
    glow: 'rgba(58,84,165,0.4)',
    border: 'rgba(58,84,165,0.8)',
};

const STANDARD_ACCENT = {
    color: '#6EBE44',
    glow: 'rgba(110,190,68,0.25)',
    border: 'rgba(110,190,68,0.4)',
};

// ─── Rationale items ──────────────────────────────────────────────────────────

const RATIONALE = [
    {
        num:   '01',
        title: 'Why the $150 Gate?',
        body:  'We receive hundreds of applications a month. The $150 fee allows us to employ real human analysts—not just AI bots—to review your initial data. It ensures that when you step into our network, you are surrounded by serious peers.',
    },
    {
        num:   '02',
        title: 'The "Redeemable" Tier 3 Model',
        body:  'We have skin in the game. For Tier 3 ventures, we view ourselves as your External Series A Partner. While the $1,500 covers the intensive manual labor of auditing your corporate governance and financials, we credit that amount back to you upon the successful close of your round. If you win, we win.',
    },
    {
        num:   '03',
        title: 'The Analyst Hours',
        body:  "Every Tier 2 and Tier 3 assessment involves between 5 and 15 hours of manual forensic work by our investment team. You aren't just buying a PDF; you are hiring a due diligence team to stress-test your business before you get to the pitch room.",
    },
    {
        num:   '04',
        title: 'No Hidden Commissions',
        body:  'Unlike "brokers," we do not take a percentage of the cash you raise. We take a flat success fee in the form of an equity warrant (2%). This aligns our long-term interests with your company\'s valuation, rather than just "getting a deal done."',
    },
];

// ─── Animations ────────────────────────────────────────────────────────────────

function FadeUp({ delay = 0, children }: { delay?: number; children: React.ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay, ease: [0.25, 1, 0.5, 1] }}
        >
            {children}
        </motion.div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CheckoutIndex({ score, score_band, tiers, diagnostic_session_id }: PageProps) {
    const [selectedTier, setSelectedTier] = useState<string | null>(null);
    const [isLoading, setIsLoading]       = useState(false);
    const [error, setError]               = useState<string | null>(null);

    const bandMeta = BAND_META[score_band] ?? BAND_META.mid_high;

    function handleSelectTier(tierKey: string) {
        setError(null);
        setSelectedTier(tierKey);
        router.post(
            '/checkout/initiate',
            { tier: tierKey, diagnostic_session_id },
            {
                onStart:  () => setIsLoading(true),
                onFinish: () => setIsLoading(false),
                onError:  (errors) => {
                    setIsLoading(false);
                    setSelectedTier(null);
                    const first = Object.values(errors)[0];
                    setError(typeof first === 'string' ? first : 'Something went wrong. Please try again.');
                },
            },
        );
    }

    return (
        <>
            <Head title="Choose Your Audit Tier — PARAGON Certification" />

            <DiagnosticLayout hideWordmark glowColor={bandMeta.glow}>
                <TooltipProvider delayDuration={100} skipDelayDuration={0}>
                    <div className="mx-auto max-w-6xl px-4 pb-28 pt-8 sm:px-8">

                        {/* ── Wordmark ── */}
                        <header className="mb-10 flex items-center justify-between">
                            <PinpointLogo height={24} variant="dark" />
                            <span
                                className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em]"
                                style={{ background: bandMeta.bg, color: bandMeta.text, border: `1px solid ${bandMeta.border}` }}
                            >
                                {bandMeta.label}
                            </span>
                        </header>

                        {/* ── Hero header ── */}
                        <div className="mb-14 text-center">
                            <FadeUp delay={0.05}>
                                <span className="inline-flex items-center gap-2 rounded-md border border-[#232C43] bg-[#101623] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.28em] text-[#9AA9CB]">
                                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: bandMeta.text }} />
                                    PARAGON Certification Programme
                                </span>
                            </FadeUp>

                            <FadeUp delay={0.12}>
                                <h1 className="mt-5 font-display text-3xl font-semibold leading-tight tracking-tight text-white md:text-4xl">
                                    Audit Tier Selection
                                </h1>
                            </FadeUp>

                            <FadeUp delay={0.18}>
                                <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-[#788CBA]">
                                    Your score of{' '}
                                    <span className="font-bold text-white">{score}/100</span>{' '}
                                    qualifies you for the following credential programmes.
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
                        <div className="grid gap-5 md:grid-cols-3">
                            {tiers.map((tier, i) => {
                                const accent     = tier.is_featured ? FEATURED_ACCENT : STANDARD_ACCENT;
                                const isSelected = selectedTier === tier.key;
                                const isOther    = isLoading && !isSelected;

                                return (
                                    <FadeUp key={tier.key} delay={0.25 + i * 0.1}>
                                        <div
                                            className={cn(
                                                "relative flex h-full flex-col overflow-hidden rounded-xl border transition-all duration-300 group bg-[#101623]",
                                                tier.is_featured ? 'border-[#4468BB]/50 shadow-[0_0_40px_rgba(68,104,187,0.15)] md:-mt-4' : 'border-[#232C43] shadow-sm'
                                            )}
                                        >
                                            {/* Ambient tier glow */}
                                            {tier.is_featured && (
                                                <div
                                                    className="pointer-events-none absolute inset-x-0 top-0 h-40"
                                                    style={{
                                                        background: `radial-gradient(ellipse 80% 60% at 50% 0%, rgba(68,104,187,0.15) 0%, transparent 100%)`,
                                                    }}
                                                />
                                            )}

                                            {/* Most Popular badge */}
                                            {tier.is_featured && (
                                                <div className="relative z-10 flex justify-center pt-4">
                                                    <span
                                                        className="rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white"
                                                        style={{ background: accent.color, boxShadow: `0 0 16px ${accent.glow}` }}
                                                    >
                                                        Most Popular
                                                    </span>
                                                </div>
                                            )}

                                            <div className={`relative z-10 flex flex-1 flex-col p-6 sm:p-8 ${tier.is_featured ? 'pt-5' : 'pt-8'}`}>

                                                {/* Tier name + tagline */}
                                                <h2 className="font-display text-[1.35rem] font-semibold tracking-tight text-white">{tier.label}</h2>
                                                <p className="mt-2 text-[13px] leading-relaxed text-[#788CBA]">
                                                    <strong className="font-bold text-[#ECF0F9]">Best for:</strong> {tier.tagline}
                                                </p>

                                                <div className="my-6 h-px bg-[#232C43]" />

                                                {/* Price block */}
                                                <div className="mb-7">
                                                    <div className="flex items-end gap-1 leading-none">
                                                        <span
                                                            className="font-display text-[2.75rem] font-bold tracking-tight text-white"
                                                            style={{ color: tier.is_featured ? '#fff' : '#ECF0F9' }}
                                                        >
                                                            ${tier.base_price}
                                                        </span>
                                                    </div>
                                                    <p className="mt-2 text-sm font-bold text-[#576FA8]">
                                                        + ${tier.gate_fee} Gate Fee
                                                    </p>
                                                </div>

                                                {/* Features list */}
                                                <ul className="mb-8 flex flex-1 flex-col gap-3.5">
                                                    {tier.features.map((feature, fi) => {
                                                        const isEverything = feature.toLowerCase().startsWith('everything in');
                                                        return (
                                                            <li key={fi} className="flex items-start gap-3">
                                                                {isEverything ? (
                                                                    <ArrowRight className="mt-0.5 size-4 shrink-0 text-[#576FA8]" />
                                                                ) : (
                                                                    <CheckCircle2
                                                                        className="mt-0.5 size-4 shrink-0"
                                                                        style={{ color: tier.is_featured ? '#4468BB' : '#576FA8' }}
                                                                    />
                                                                )}
                                                                <span className={`text-[13px] leading-relaxed ${isEverything ? 'italic text-[#576FA8]' : 'text-[#9AA9CB]'}`}>
                                                                    {feature}
                                                                </span>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>

                                                {/* Redeemable badge */}
                                                {tier.redeemable && tier.redeemable_tooltip && (
                                                    <div className="mb-4">
                                                        <Tooltip delayDuration={50}>
                                                            <TooltipTrigger asChild>
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => e.preventDefault()}
                                                                    className="inline-flex cursor-help items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] transition-colors hover:bg-white/[0.04]"
                                                                    style={{
                                                                        borderColor: 'rgba(52,211,153,0.3)',
                                                                        color:       '#6ee7b7',
                                                                    }}
                                                                >
                                                                    <CheckCircle2 className="size-3" />
                                                                    Redeemable
                                                                </button>
                                                            </TooltipTrigger>
                                                            <TooltipContent
                                                                className="z-[100] max-w-[280px] rounded-xl border border-[#232C43] bg-[#101623] p-4 text-[13px] leading-relaxed text-[#788CBA] shadow-2xl"
                                                                side="top"
                                                                align="start"
                                                                sideOffset={12}
                                                            >
                                                                {tier.redeemable_tooltip}
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                )}

                                                {/* CTA button */}
                                                <div className="relative mt-auto">
                                                    <button
                                                        type="button"
                                                        disabled={isLoading}
                                                        onClick={() => handleSelectTier(tier.key)}
                                                        className="group relative w-full overflow-hidden rounded-xl px-5 py-4 text-[13px] font-bold uppercase tracking-[0.18em] outline-none transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
                                                        style={{
                                                            background:  tier.is_featured ? '#4468BB' : 'rgba(68,104,187,0.12)',
                                                            border:      `1px solid ${tier.is_featured ? 'transparent' : 'rgba(68,104,187,0.25)'}`,
                                                            color:       '#fff',
                                                            boxShadow:   tier.is_featured ? `0 0 28px rgba(68,104,187,0.35)` : 'none',
                                                        }}
                                                        onMouseEnter={e => { if (!isLoading && tier.is_featured) (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.1)'; else if (!isLoading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(68,104,187,0.2)'; }}
                                                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.filter = ''; (e.currentTarget as HTMLButtonElement).style.backgroundColor = tier.is_featured ? '#4468BB' : 'rgba(68,104,187,0.12)'; }}
                                                    >
                                                        {tier.is_featured && (
                                                            <span className="waitlist-shimmer absolute inset-0 opacity-40 mix-blend-overlay transition-opacity duration-300 group-hover:opacity-80" />
                                                        )}
                                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                                            {isSelected && isLoading ? (
                                                                <>
                                                                    <Loader2 className="size-4 animate-spin" />
                                                                    Redirecting…
                                                                </>
                                                            ) : (
                                                                `Get Started — $${tier.total}`
                                                            )}
                                                        </span>
                                                    </button>

                                                    {/* Dim overlay on non-selected cards while loading */}
                                                    <AnimatePresence>
                                                        {isOther && (
                                                            <motion.div
                                                                className="pointer-events-none absolute inset-0 rounded-xl bg-black/50"
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                exit={{ opacity: 0 }}
                                                            />
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        </div>
                                    </FadeUp>
                                );
                            })}
                        </div>

                        {/* ── Rationale section ── */}
                        <FadeUp delay={0.6}>
                            <div className="mt-24">
                                <div className="mb-10 text-center">
                                    <span className="inline-flex items-center gap-2 rounded-md border border-[#232C43] bg-[#101623] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.28em] text-[#576FA8]">
                                        Radical Transparency
                                    </span>
                                    <h2 className="mt-4 font-display text-2xl font-bold text-white">
                                        Why we charge what we charge
                                    </h2>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    {RATIONALE.map((item, i) => (
                                        <FadeUp key={item.num} delay={0.7 + i * 0.08}>
                                            <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-[#232C43] bg-[#101623] shadow-sm transition-all duration-500 hover:border-[#4468BB]/40 hover:bg-[#1B294B]/30">
                                                
                                                {/* Subdued top-glow that activates on hover */}
                                                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#4468BB]/60 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                                                <div className="flex flex-1 flex-col p-8 sm:p-10 relative z-10">
                                                    <h3 className="mb-3 text-[14px] font-bold uppercase tracking-[0.18em] text-[#ECF0F9]">
                                                        {item.title}
                                                    </h3>
                                                    <p className="text-[15px] leading-relaxed text-[#788CBA]">
                                                        {item.body}
                                                    </p>
                                                </div>
                                            </div>
                                        </FadeUp>
                                    ))}
                                </div>
                            </div>
                        </FadeUp>

                        {/* ── Refund note ── */}
                        <FadeUp delay={1.1}>
                            <p className="mt-10 text-center text-xs text-[#576FA8]">
                                Full refund available if your audit has not yet commenced. Once analyst work begins, no refund is applicable.
                            </p>
                        </FadeUp>

                    </div>
                </TooltipProvider>
            </DiagnosticLayout>
        </>
    );
}
