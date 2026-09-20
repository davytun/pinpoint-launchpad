import { PinpointLogo } from '@/components/pinpoint-logo';
import { Head } from '@inertiajs/react';
import { useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface Badge {
    badge_type: string;
    label: string;
    is_verified: boolean;
}

interface RadarData {
    potential?: number;
    agility?: number;
    risk?: number;
    alignment?: number;
    governance?: number;
    operations?: number;
    network?: number;
    [key: string]: number | undefined;
}

interface PageProps {
    profile_id: number | null;
    founder_name: string;
    company_name: string;
    sector?: string | null;
    batch?: string | null;
    overall_score?: number | null;
    radar_data?: RadarData | null;
    analyst_summary?: string | null;
    badges: Badge[];
    tier?: string | null;
    verified_at?: string | null;
    expires_at?: string | null;
    days_until_expiry?: number | null;
    access_request_count?: number;
    is_sample?: boolean;
    slug: string;
}

const PILLARS = [
    { key: 'potential', letter: 'P', name: 'Potential' },
    { key: 'agility', letter: 'A', name: 'Agility' },
    { key: 'risk', letter: 'R', name: 'Risk' },
    { key: 'alignment', letter: 'A', name: 'Alignment' },
    { key: 'governance', letter: 'G', name: 'Governance' },
    { key: 'operations', letter: 'O', name: 'Operations' },
    { key: 'network', letter: 'N', name: 'Network' },
] as const;

function CountUp({ target }: { target: number }) {
    const reduceMotion = useReducedMotion();
    const [value, setValue] = useState(reduceMotion ? target : 0);
    const raf = useRef(0);

    useEffect(() => {
        if (reduceMotion) {
            setValue(target);
            return;
        }
        const start = performance.now();
        const tick = (now: number) => {
            const t = Math.min((now - start) / 900, 1);
            setValue(Math.round((1 - (1 - t) ** 3) * target));
            if (t < 1) raf.current = requestAnimationFrame(tick);
        };
        raf.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf.current);
    }, [target, reduceMotion]);

    return <>{value}</>;
}

function diligenceRows(tier?: string | null) {
    const base = [
        { name: 'PARAGON assessment report', note: 'Full written findings' },
        { name: 'Pillar score annex', note: 'How each dimension was scored' },
    ];
    const growth = [
        { name: 'Financial stress test', note: 'Cash, burn, runway evidence' },
        { name: 'Cap table certification', note: 'Ownership reconciliation' },
    ];
    const institutional = [
        { name: 'Unit economics model', note: 'LTV / CAC and payback' },
        { name: 'IP and incorporation file', note: 'Chain of title reviewed' },
    ];
    if (tier === 'institutional') return [...base, ...growth, ...institutional];
    if (tier === 'growth') return [...base, ...growth];
    return base;
}

function cleanBadge(label: string) {
    return label.replace(/:/g, ' ·').replace(/\s+/g, ' ').trim();
}

export default function VerificationShow({
    company_name = 'Verified Company',
    sector,
    batch,
    overall_score,
    radar_data,
    analyst_summary,
    badges = [],
    tier,
    verified_at,
    expires_at,
    days_until_expiry,
    is_sample = false,
}: PageProps) {
    const rows = diligenceRows(tier);
    const safeBadges = Array.isArray(badges) ? badges : [];
    const showExpiryWarning = !is_sample && days_until_expiry != null && days_until_expiry <= 14;
    const meta = [batch, sector, tier ? `${tier} grade` : null].filter(Boolean).join('  ·  ');

    return (
        <>
            <Head title={`${company_name} — Pinpoint`} />

            <div className="relative min-h-screen bg-[#f3f5f9] text-[#1c2438]">
                {/* Quiet paper wash — no glass cards, no ray circus */}
                <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background:
                            'radial-gradient(ellipse 80% 50% at 10% -10%, rgba(58,84,165,0.09), transparent 55%), radial-gradient(ellipse 60% 40% at 100% 0%, rgba(58,84,165,0.05), transparent 50%)',
                    }}
                />

                <div className="relative mx-auto max-w-3xl px-5 pt-10 pb-20 sm:px-8">
                    {/* Masthead */}
                    <div className="mb-14 flex items-start justify-between gap-6">
                        <a href="/" className="opacity-90 transition hover:opacity-100">
                            <PinpointLogo height={20} variant="dark" />
                        </a>
                        <a
                            href="/investor"
                            className="pt-0.5 text-[12px] font-medium text-[#3A54A5] underline decoration-[#3A54A5]/30 underline-offset-4 transition hover:decoration-[#3A54A5]"
                        >
                            Investor portal
                        </a>
                    </div>

                    {/* One composition: company + score */}
                    <header className="relative mb-12 border-b border-[#1c2438]/12 pb-10">
                        {is_sample && (
                            <p className="mb-5 font-mono text-[11px] tracking-[0.2em] text-[#3A54A5]/80 uppercase">
                                Sample — demonstration only
                            </p>
                        )}

                        <p className="font-mono text-[11px] tracking-[0.14em] text-[#5a6578] uppercase">
                            Pinpoint verification
                            {verified_at ? ` · ${verified_at}` : ''}
                        </p>

                        <div className="mt-4 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
                            <div className="min-w-0 flex-1">
                                <h1 className="font-display text-[2.35rem] leading-[1.05] font-semibold tracking-[-0.03em] text-[#141b2d] sm:text-5xl">
                                    {company_name}
                                </h1>
                                {meta && <p className="mt-3 text-[14px] text-[#5a6578]">{meta}</p>}
                                {showExpiryWarning && (
                                    <p className="mt-2 text-[13px] font-medium text-[#9a5b12]">
                                        Expires in {days_until_expiry} day{days_until_expiry !== 1 ? 's' : ''}.
                                    </p>
                                )}
                            </div>

                            <div className="shrink-0 sm:text-right">
                                <p className="font-mono text-[10px] tracking-[0.22em] text-[#5a6578] uppercase">Score</p>
                                <p className="font-display mt-1 text-[4.5rem] leading-none font-semibold tracking-[-0.04em] text-[#3A54A5] sm:text-[5.5rem]">
                                    {overall_score != null ? <CountUp target={overall_score} /> : '—'}
                                    <span className="ml-1 text-2xl font-medium text-[#8b95a8]">/100</span>
                                </p>
                            </div>
                        </div>
                    </header>

                    {/* PARAGON strip — the one signature, not a chart widget */}
                    <section className="mb-12" aria-label="PARAGON pillars">
                        <p className="mb-4 font-mono text-[10px] tracking-[0.22em] text-[#5a6578] uppercase">PARAGON</p>
                        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-sm bg-[#1c2438]/10">
                            {PILLARS.map(({ key, letter, name }) => {
                                const score = Number(radar_data?.[key] ?? 0);
                                return (
                                    <div key={key} className="bg-[#f3f5f9] px-1 py-3 text-center sm:px-2 sm:py-4">
                                        <p className="font-display text-lg font-semibold text-[#141b2d] sm:text-xl">
                                            {radar_data?.[key] != null ? Math.round(score) : '—'}
                                        </p>
                                        <p className="mt-1 font-mono text-[10px] tracking-widest text-[#3A54A5]">{letter}</p>
                                        <p className="mt-0.5 hidden text-[9px] text-[#8b95a8] sm:block">{name}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Analyst note — prose, not a card */}
                    <section className="mb-14">
                        <p className="mb-3 font-mono text-[10px] tracking-[0.22em] text-[#5a6578] uppercase">Analyst note</p>
                        {analyst_summary ? (
                            <p className="max-w-2xl text-[17px] leading-[1.65] text-[#2a3348]">{analyst_summary}</p>
                        ) : (
                            <p className="text-[15px] text-[#5a6578]">Findings will appear here when the audit is complete.</p>
                        )}

                        {safeBadges.length > 0 && (
                            <p className="mt-6 max-w-2xl text-[13px] leading-relaxed text-[#5a6578]">
                                Checked:{' '}
                                {safeBadges.map((b, i) => (
                                    <span key={b.badge_type}>
                                        {i > 0 && ' · '}
                                        <span className="text-[#2a3348]">{cleanBadge(b.label)}</span>
                                    </span>
                                ))}
                            </p>
                        )}
                    </section>

                    {/* Locked materials — table, not portal pills */}
                    <section className="mb-14">
                        <div className="mb-4 flex items-baseline justify-between gap-4">
                            <p className="font-mono text-[10px] tracking-[0.22em] text-[#5a6578] uppercase">Materials</p>
                            <p className="text-[12px] text-[#8b95a8]">Available after portal access</p>
                        </div>
                        <ul className="border-t border-[#1c2438]/12">
                            {rows.map((row) => (
                                <li
                                    key={row.name}
                                    className="grid grid-cols-[1fr_auto] items-baseline gap-4 border-b border-[#1c2438]/10 py-3.5 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto]"
                                >
                                    <span className="text-[14px] font-medium text-[#141b2d]">{row.name}</span>
                                    <span className="hidden text-[13px] text-[#5a6578] sm:block">{row.note}</span>
                                    <span className="font-mono text-[11px] tracking-wide text-[#8b95a8]">Locked</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* Quiet close — not a marketing banner */}
                    <section className="border-t border-[#1c2438]/12 pt-8">
                        <p className="max-w-md text-[14px] leading-relaxed text-[#5a6578]">
                            Public verification pages are retired. Detailed reports and data rooms live in the Investor Portal.
                        </p>
                        <a
                            href="/investor"
                            className="mt-5 inline-flex items-center gap-2 text-[14px] font-semibold text-[#3A54A5] transition hover:text-[#2D4182]"
                        >
                            Create an investor account
                            <span aria-hidden>→</span>
                        </a>
                        <p className="mt-10 text-[12px] text-[#8b95a8]">
                            Valid 90 days
                            {expires_at ? ` · Next audit ${expires_at}` : ''}
                            {is_sample ? ' · Not a live listing' : ''}
                        </p>
                    </section>
                </div>
            </div>
        </>
    );
}
