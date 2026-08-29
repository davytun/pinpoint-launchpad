import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Clock, FileText, Lock, Shield } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from 'recharts';

import SideRays from '@/components/SideRays';

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Constants ────────────────────────────────────────────────────────────────

const PILLAR_KEYS = ['potential', 'agility', 'risk', 'alignment', 'governance', 'operations', 'network'];
const PILLAR_LABELS: Record<string, string> = {
    potential: 'Potential',
    agility: 'Agility',
    risk: 'Risk',
    alignment: 'Alignment',
    governance: 'Governance',
    operations: 'Operations',
    network: 'Network',
};

// ─── Count-up ─────────────────────────────────────────────────────────────────

function CountUp({ target, duration = 1200 }: { target: number; duration?: number }) {
    const [value, setValue] = useState(0);
    const raf = useRef<number>(0);
    const startTs = useRef<number>(0);

    useEffect(() => {
        startTs.current = performance.now();
        function tick(now: number) {
            const elapsed = now - startTs.current;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(eased * target));
            if (progress < 1) raf.current = requestAnimationFrame(tick);
        }
        raf.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf.current);
    }, [target, duration]);

    return <>{value}</>;
}

// ─── Score colour ─────────────────────────────────────────────────────────────

function scoreColor(score?: number | null): string {
    if (score == null) return '#64748B';
    if (score > 85) return '#10B981';
    if (score >= 65) return '#3A54A5';
    return '#F59E0B';
}

// ─── Diligence rows by tier ───────────────────────────────────────────────────

function diligenceRows(tier?: string | null) {
    const base = [
        { name: 'PARAGON Assessment Report', level: 'Analyst Certified' },
        { name: 'Radar Chart — Detailed Breakdown', level: 'Verified via Diagnostic Engine' },
    ];
    const growth = [
        { name: 'Financial Stress-Test Results', level: 'Verified via Bank/Stripe Data' },
        { name: 'Cap Table Certification', level: 'Tier 2 Audit Complete' },
    ];
    const institutional = [
        { name: 'Unit Economics & LTV Model', level: 'Verified via Stripe API' },
        { name: 'Articles of Incorporation / IP Assignment', level: 'Legal Counsel Certified' },
    ];

    if (tier === 'institutional') return [...base, ...growth, ...institutional];
    if (tier === 'growth') return [...base, ...growth];
    return base;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VerificationShow({
    company_name,
    sector,
    batch,
    overall_score,
    radar_data,
    analyst_summary,
    badges,
    tier,
    verified_at,
    expires_at,
    days_until_expiry,
    is_sample = false,
}: PageProps) {
    const color = scoreColor(overall_score);
    const radarItems = PILLAR_KEYS.map((k) => ({
        subject: PILLAR_LABELS[k],
        value: radar_data?.[k] ?? 0,
    }));
    const rows = diligenceRows(tier);
    const showExpiryWarning = !is_sample && days_until_expiry != null && days_until_expiry <= 14;

    const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

    return (
        <>
            <Head title={`${company_name} — Pinpoint Verified`} />

            <div className="relative min-h-screen overflow-x-hidden bg-[#f4f7fc] font-sans text-zinc-900 antialiased">
                {/* ── Background SideRays ── */}
                <div className="pointer-events-none fixed inset-0 z-0">
                    <SideRays
                        rayColor1="#3A54A5"
                        rayColor2="#93C5FD"
                        origin="top-left"
                        speed={1.8}
                        intensity={1.2}
                        spread={2}
                        tilt={0}
                        saturation={1.5}
                        blend={0.35}
                        falloff={2.3}
                        opacity={0.25}
                    />
                </div>

                {/* Ambient top glow */}
                <div
                    className="pointer-events-none fixed inset-x-0 top-0 z-0 h-100 opacity-10"
                    style={{
                        background: 'radial-gradient(circle at top, #3A54A5, transparent 70%)',
                    }}
                />

                <div className="relative z-10 mx-auto max-w-4xl px-4 py-12 lg:px-8">
                    {/* 30-day transition banner */}
                    <div className="animate-fade-in mb-6 rounded-xl border border-[#3A54A5]/25 bg-[#eef2ff] p-5 text-sm text-[#3A54A5] shadow-xs">
                        <div className="flex items-start gap-4">
                            <Shield className="mt-0.5 size-6 shrink-0 text-[#3A54A5]" />
                            <div>
                                <h3 className="text-base font-extrabold text-zinc-950">Important Notice: Moving to Secure Access</h3>
                                <p className="mt-1 text-zinc-700">
                                    Pinpoint is transitioning to a secure Investor Portal. Public verification pages are now deprecated. To continue
                                    reviewing detailed PARAGON reports and data rooms, please create your verified investor account.
                                </p>
                                <a
                                    href="/investor"
                                    className="mt-4 inline-block rounded-xl bg-[#3A54A5] px-5 py-2.5 font-bold text-white shadow-sm transition hover:bg-[#2D4182]"
                                >
                                    Join Pinpoint Investor Network
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Sample banner */}
                    {is_sample && (
                        <div className="animate-fade-in mb-6 rounded-xl border border-amber-500/25 bg-amber-50 py-2.5 text-center text-sm font-semibold text-amber-700 shadow-xs">
                            SAMPLE PROFILE — This is a demonstration of the Pinpoint verification page.
                        </div>
                    )}

                    {/* Expiry warning */}
                    {showExpiryWarning && (
                        <div className="animate-fade-in mb-6 rounded-xl border border-amber-500/25 bg-amber-50 py-2.5 text-center text-sm font-semibold text-amber-700 shadow-xs">
                            This verification expires in {days_until_expiry} day{days_until_expiry !== 1 ? 's' : ''}. Renewal required.
                        </div>
                    )}

                    {/* Single Master Certificate Card */}
                    <motion.div
                        className="animate-fade-in min-w-0 space-y-8 overflow-hidden rounded-[2.5rem] border border-zinc-200/80 bg-white p-6 shadow-[0_12px_45px_rgba(0,0,0,0.02)] sm:p-10"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease }}
                    >
                        {/* ── Header Section ── */}
                        <div className="flex flex-col gap-6 border-b border-zinc-100 pb-8 md:flex-row md:items-start md:justify-between">
                            <div className="space-y-3.5">
                                {/* Verification Badge */}
                                <div className="border-emerald-250 inline-flex items-center gap-1.5 rounded-full border bg-emerald-50 px-3 py-1 text-[11px] font-bold tracking-wide text-emerald-700 uppercase shadow-xs">
                                    <Shield className="text-emerald-650 size-3.5" />
                                    Pinpoint Certified: {tier ? tier.toUpperCase() : 'INSTITUTIONAL'} Grade
                                </div>

                                <h1 className="text-4xl leading-none font-extrabold tracking-tight text-zinc-950">{company_name}</h1>

                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold tracking-wider text-zinc-500 uppercase">
                                    <span>{batch ?? 'Spring 2026'}</span>
                                    {sector && (
                                        <>
                                            <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
                                            <span>{sector}</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col items-start gap-1 md:items-end md:text-right">
                                <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">Verification Status</span>
                                <span className="text-emerald-650 mt-0.5 rounded-md border border-emerald-200/50 bg-emerald-50/50 px-2 py-0.5 text-xs font-extrabold">
                                    Active
                                </span>
                                {verified_at && <span className="mt-1 text-[11px] font-semibold text-zinc-500">Verified On {verified_at}</span>}
                            </div>
                        </div>

                        {/* ── Score & Executive Summary Panel ── */}
                        <div className="grid gap-8 lg:grid-cols-3">
                            {/* Left: PARAGON Score */}
                            <div className="min-w-0 space-y-4 overflow-hidden">
                                <p className="text-xs font-bold tracking-[0.28em] text-zinc-400 uppercase">PARAGON Score</p>
                                <div className="flex items-end gap-1 leading-none">
                                    <span className="text-6xl leading-none font-black" style={{ color }}>
                                        {overall_score != null ? <CountUp target={overall_score} /> : '—'}
                                    </span>
                                    <span className="mb-1 text-xl font-semibold text-zinc-400">/ 100</span>
                                </div>
                                <div className="flex items-center justify-center pt-2">
                                    <ResponsiveContainer width="100%" height={200}>
                                        <RadarChart data={radarItems} outerRadius="62%" margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                                            <PolarGrid stroke="#E2E8F0" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748B', fontSize: 9, fontWeight: 600 }} />
                                            <Radar dataKey="value" stroke={color} fill={`${color}25`} strokeWidth={2} dot={{ fill: color, r: 3 }} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Right: Executive Summary */}
                            <div className="flex flex-col justify-between space-y-4 lg:col-span-2">
                                <div className="space-y-3">
                                    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
                                        <p className="text-xs font-bold tracking-[0.28em] text-zinc-400 uppercase">ANALYST EXECUTIVE SUMMARY</p>
                                        <span className="text-zinc-450 flex items-center gap-1 text-[11px] font-semibold">
                                            <Clock className="size-3" />
                                            Timestamped &amp; Analyst-Signed
                                        </span>
                                    </div>

                                    {analyst_summary ? (
                                        <p className="text-[14px] leading-relaxed font-semibold text-zinc-700">{analyst_summary}</p>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200/60 bg-zinc-50/50 p-6 py-8 text-center shadow-xs">
                                            <Shield className="mb-2 size-6 animate-pulse text-zinc-300" />
                                            <p className="max-w-xs text-xs leading-relaxed font-bold text-zinc-500">
                                                The official analyst evaluation summary will be published here upon audit completion.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {badges.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 pt-2">
                                        {badges.map((badge) => (
                                            <span
                                                key={badge.badge_type}
                                                className="border-zinc-250/70 text-zinc-650 animate-fade-in rounded-lg border bg-white px-3 py-1 text-xs font-bold shadow-xs"
                                            >
                                                {badge.label}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-zinc-100" />

                        {/* ── Diligence Assets Checklist Section ── */}
                        <div className="space-y-5">
                            <div className="flex flex-col gap-4 pb-1 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="text-lg font-extrabold tracking-tight text-zinc-950">Verified Diligence Assets</h2>
                                    <p className="mt-0.5 text-[13px] font-semibold text-zinc-500">
                                        Access verified financial audits and diagnostic reports through the Investor Portal.
                                    </p>
                                </div>
                            </div>

                            <div className="divide-y divide-zinc-100">
                                {rows.map((row, i) => (
                                    <div key={i} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200/80 bg-zinc-50 text-zinc-400">
                                                <FileText className="size-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-[14px] leading-snug font-bold text-zinc-900">{row.name}</h3>
                                                <p className="mt-0.5 text-[11px] font-semibold text-zinc-500">{row.level}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200/80 bg-zinc-50 px-3 py-1.5 text-xs font-bold text-zinc-400 select-none">
                                                <Lock className="size-3.5" /> Portal Only
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* ── Footer ── */}
                    <div className="animate-fade-in mt-10 border-t border-zinc-200 pt-8 text-center">
                        <p className="text-zinc-555 text-sm font-semibold">This verification is valid for 90 days.</p>
                        {expires_at && <p className="text-zinc-555 text-sm font-semibold">Next scheduled audit: {expires_at}</p>}
                    </div>
                </div>
            </div>
        </>
    );
}
