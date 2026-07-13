import { Head, router, usePage } from '@inertiajs/react';
import { ArrowRight, CheckCircle2, Clock, FileText, Loader2, Lock, Shield } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

import SideRays from '@/components/SideRays';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

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
    flash?: { success?: string; info?: string; error?: string };
    is_unlocked?: boolean;
    token?: string | null;
    unlocked_documents?: any[];
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

// ─── Access Request Form ──────────────────────────────────────────────────────

function AccessRequestModal({ open, onClose, slug, isSample }: { open: boolean; onClose: () => void; slug: string; isSample: boolean }) {
    const { props } = usePage<PageProps & { flash?: { success?: string } }>();
    const [form, setForm] = useState({
        investor_name: '',
        investor_email: '',
        firm_name: '',
        linkedin_url: '',
        message: '',
    });
    const [submitting, setSubmitting] = useState(false);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        router.post(route('verify.request-access', slug), form, {
            preserveScroll: true,
            onFinish: () => setSubmitting(false),
            onSuccess: () => onClose(),
        });
    }

    const inputClass =
        'w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-955 placeholder:text-zinc-400 transition-colors focus:border-[#3A54A5]/60 focus:ring-2 focus:ring-[#3A54A5]/10 focus:outline-none shadow-xs';

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                if (!v) onClose();
            }}
        >
            <DialogContent className="border-zinc-200/80 bg-white/95 shadow-2xl backdrop-blur-xl rounded-[2rem] p-7 text-zinc-900 sm:max-w-md">
                <DialogHeader>
                    {isSample ? (
                        <>
                            <DialogTitle className="text-zinc-955 font-extrabold text-xl">Sample Profile</DialogTitle>
                            <DialogDescription className="text-zinc-555 font-medium mt-1">
                                This is a sample profile. Request access on a real founder's page.
                            </DialogDescription>
                        </>
                    ) : (
                        <>
                            <DialogTitle className="text-zinc-955 font-extrabold text-xl">Request Data Room Access</DialogTitle>
                            <DialogDescription className="text-zinc-555 font-medium mt-1">
                                Tell the founder who you are. They'll review and approve your request.
                            </DialogDescription>
                        </>
                    )}
                </DialogHeader>

                {!isSample && (
                    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Full Name</label>
                            <input
                                type="text"
                                required
                                value={form.investor_name}
                                onChange={(e) => setForm((f) => ({ ...f, investor_name: e.target.value }))}
                                className={inputClass}
                                placeholder="Jane Smith"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Work Email</label>
                            <input
                                type="email"
                                required
                                value={form.investor_email}
                                onChange={(e) => setForm((f) => ({ ...f, investor_email: e.target.value }))}
                                className={inputClass}
                                placeholder="jane@firm.com"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Venture Firm</label>
                            <input
                                type="text"
                                value={form.firm_name}
                                onChange={(e) => setForm((f) => ({ ...f, firm_name: e.target.value }))}
                                className={inputClass}
                                placeholder="Capital Ventures"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">LinkedIn Profile</label>
                            <input
                                type="url"
                                value={form.linkedin_url}
                                onChange={(e) => setForm((f) => ({ ...f, linkedin_url: e.target.value }))}
                                className={inputClass}
                                placeholder="https://linkedin.com/in/janesmith"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Note (Optional)</label>
                            <textarea
                                value={form.message}
                                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                                className={cn(inputClass, 'min-h-[80px] resize-y')}
                                placeholder="Briefly state your investment thesis or interest..."
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#3A54A5] py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#2D4182] disabled:opacity-60 shadow-md shadow-[#3A54A5]/20 hover:shadow-lg"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" /> Submitting...
                                </>
                            ) : (
                                <>
                                    Submit Request
                                    <ArrowRight className="size-4" />
                                </>
                            )}
                        </button>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
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
    slug,
    flash,
    is_unlocked = false,
    token = null,
    unlocked_documents = [],
}: PageProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const [reqSubmitted, setReqSubmitted] = useState(false);

    const color = scoreColor(overall_score);
    const radarItems = PILLAR_KEYS.map((k) => ({
        subject: PILLAR_LABELS[k],
        value: radar_data?.[k] ?? 0,
    }));
    const rows = diligenceRows(tier);
    const showExpiryWarning = !is_sample && days_until_expiry != null && days_until_expiry <= 14;

    // Flash success from redirect
    useEffect(() => {
        if (flash?.success) setReqSubmitted(true);
    }, [flash?.success]);

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
                    className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[400px] opacity-10"
                    style={{
                        background: 'radial-gradient(circle at top, #3A54A5, transparent 70%)',
                    }}
                />

                <div className="relative z-10 mx-auto max-w-4xl px-4 py-12 lg:px-8">
                    {/* Sample banner */}
                    {is_sample && (
                        <div className="mb-6 rounded-xl border border-amber-500/25 bg-amber-50 py-2.5 text-center text-sm text-amber-700 font-semibold shadow-xs animate-fade-in">
                            SAMPLE PROFILE — This is a demonstration of the Pinpoint verification page.
                        </div>
                    )}

                    {/* Expiry warning */}
                    {showExpiryWarning && (
                        <div className="mb-6 rounded-xl border border-amber-500/25 bg-amber-50 py-2.5 text-center text-sm text-amber-700 font-semibold shadow-xs animate-fade-in">
                            This verification expires in {days_until_expiry} day{days_until_expiry !== 1 ? 's' : ''}. Renewal required.
                        </div>
                    )}

                    {/* Single Master Certificate Card */}
                    <motion.div
                        className="rounded-[2.5rem] border border-zinc-200/80 bg-white p-6 sm:p-10 shadow-[0_12px_45px_rgba(0,0,0,0.02)] animate-fade-in space-y-8"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease }}
                    >
                        {/* ── Header Section ── */}
                        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between border-b border-zinc-100 pb-8">
                            <div className="space-y-3.5">
                                {/* Verification Badge */}
                                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-250 px-3 py-1 text-[11px] font-bold text-emerald-700 tracking-wide uppercase shadow-xs">
                                    <Shield className="size-3.5 text-emerald-650" />
                                    Pinpoint Certified: {tier ? tier.toUpperCase() : 'INSTITUTIONAL'} Grade
                                </div>
                                
                                <h1 className="text-4xl font-extrabold text-zinc-950 tracking-tight leading-none">
                                    {company_name}
                                </h1>
                                
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold text-zinc-500 uppercase tracking-wider">
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
                                <span className="text-xs font-extrabold text-emerald-650 bg-emerald-50/50 border border-emerald-200/50 px-2 py-0.5 rounded-md mt-0.5">Active</span>
                                {verified_at && (
                                    <span className="text-[11px] font-semibold text-zinc-500 mt-1">
                                        Verified On {verified_at}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* ── Score & Executive Summary Panel ── */}
                        <div className="grid gap-8 lg:grid-cols-3">
                            {/* Left: PARAGON Score */}
                            <div className="space-y-4">
                                <p className="text-xs font-bold tracking-[0.28em] text-zinc-400 uppercase">PARAGON Score</p>
                                <div className="flex items-end gap-1 leading-none">
                                    <span className="text-6xl leading-none font-black" style={{ color }}>
                                        {overall_score != null ? <CountUp target={overall_score} /> : '—'}
                                    </span>
                                    <span className="mb-1 text-xl text-zinc-400 font-semibold">/ 100</span>
                                </div>
                                <div className="pt-2 flex items-center justify-center">
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
                            <div className="lg:col-span-2 flex flex-col justify-between space-y-4">
                                <div className="space-y-3">
                                    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
                                        <p className="text-xs font-bold tracking-[0.28em] text-zinc-400 uppercase">ANALYST EXECUTIVE SUMMARY</p>
                                        <span className="flex items-center gap-1 text-[11px] text-zinc-450 font-semibold">
                                            <Clock className="size-3" />
                                            Timestamped &amp; Analyst-Signed
                                        </span>
                                    </div>

                                    {analyst_summary ? (
                                        <p className="text-[14px] leading-relaxed text-zinc-700 font-semibold">{analyst_summary}</p>
                                    ) : (
                                        <div className="rounded-2xl border border-zinc-200/60 bg-zinc-50/50 p-6 flex flex-col items-center justify-center text-center py-8 shadow-xs border-dashed">
                                            <Shield className="size-6 text-zinc-300 animate-pulse mb-2" />
                                            <p className="text-xs text-zinc-500 font-bold max-w-xs leading-relaxed">
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
                                                className="rounded-lg border border-zinc-250/70 bg-white px-3 py-1 text-xs font-bold text-zinc-650 shadow-xs animate-fade-in"
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
                                    <h2 className="font-extrabold text-zinc-950 text-lg tracking-tight">Verified Diligence Assets</h2>
                                    <p className="text-[13px] text-zinc-500 font-semibold mt-0.5">Access verified financial audits and diagnostic reports.</p>
                                </div>
                                {is_unlocked ? (
                                    <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-500/25 px-3 py-1.5 rounded-full shadow-xs">
                                        <CheckCircle2 className="size-4 text-emerald-650" />
                                        Secure Access Unlocked
                                    </span>
                                ) : reqSubmitted ? (
                                    <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-500/25 px-3 py-1.5 rounded-full shadow-xs">
                                        <CheckCircle2 className="size-4 text-emerald-650" />
                                        Request submitted
                                    </span>
                                ) : (
                                    <button
                                        onClick={() => setModalOpen(true)}
                                        className="rounded-xl bg-[#3A54A5] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#2D4182] shadow-sm shadow-[#3A54A5]/25"
                                    >
                                        Request Access to Full Data Room
                                    </button>
                                )}
                            </div>

                            <div className="divide-y divide-zinc-100">
                                {rows.map((row, i) => {
                                    const matchingDoc = is_unlocked
                                        ? unlocked_documents.find((d: any) => {
                                              const cat = d.category?.toLowerCase() || '';
                                              const name = row.name.toLowerCase();
                                              if (name.includes('assessment') && (cat.includes('assessment') || cat.includes('other'))) return true;
                                              if (name.includes('radar') && (cat.includes('diagnostics') || cat.includes('model') || cat.includes('economics'))) return true;
                                              if (name.includes('stress-test') && (cat.includes('forecast') || cat.includes('bank') || cat.includes('statement'))) return true;
                                              if (name.includes('cap table') && cat.includes('cap')) return true;
                                              if (name.includes('economics') && (cat.includes('unit') || cat.includes('economics') || cat.includes('forecast'))) return true;
                                              if (name.includes('incorporation') && (cat.includes('incorporation') || cat.includes('legal') || cat.includes('articles'))) return true;
                                              return false;
                                          })
                                        : null;

                                    return (
                                        <div key={i} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-50 border border-zinc-200/80 text-zinc-400">
                                                    <FileText className="size-5" />
                                                </div>
                                                <div>
                                                    <h3 className="text-[14px] font-bold text-zinc-900 leading-snug">{row.name}</h3>
                                                    <p className="text-[11px] text-zinc-500 font-semibold mt-0.5">{row.level}</p>
                                                </div>
                                            </div>

                                            <div>
                                                {!is_unlocked ? (
                                                    <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400 font-bold bg-zinc-50 border border-zinc-200/80 px-3 py-1.5 rounded-lg select-none">
                                                        <Lock className="size-3.5" /> Locked
                                                    </span>
                                                ) : matchingDoc ? (
                                                    <a
                                                        href={route('verify.document.download', { slug, document: matchingDoc.id }) + '?token=' + token}
                                                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors"
                                                    >
                                                        Download ({matchingDoc.size})
                                                    </a>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400 font-bold bg-zinc-50 border border-zinc-200/60 px-3 py-1.5 rounded-lg select-none">
                                                        Pending Upload
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {is_unlocked && (() => {
                                    const unmatched = unlocked_documents.filter((d: any) => {
                                        const cat = d.category?.toLowerCase() || '';
                                        const wasMatched = rows.some((row) => {
                                            const name = row.name.toLowerCase();
                                            if (name.includes('assessment') && (cat.includes('assessment') || cat.includes('other'))) return true;
                                            if (name.includes('radar') && (cat.includes('diagnostics') || cat.includes('model') || cat.includes('economics'))) return true;
                                            if (name.includes('stress-test') && (cat.includes('forecast') || cat.includes('bank') || cat.includes('statement'))) return true;
                                            if (name.includes('cap table') && cat.includes('cap')) return true;
                                            if (name.includes('economics') && (cat.includes('unit') || cat.includes('economics') || cat.includes('forecast'))) return true;
                                            if (name.includes('incorporation') && (cat.includes('incorporation') || cat.includes('legal') || cat.includes('articles'))) return true;
                                            return false;
                                        });
                                        return !wasMatched;
                                    });

                                    if (unmatched.length === 0) return null;

                                    return (
                                        <div className="mt-6 pt-5 border-t border-zinc-100">
                                            <h4 className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase mb-3">Additional Diligence Materials</h4>
                                            <div className="space-y-3">
                                                {unmatched.map((doc: any) => (
                                                    <div key={doc.id} className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-50 border border-zinc-200/80 text-zinc-400">
                                                                <FileText className="size-4.5" />
                                                            </div>
                                                            <div>
                                                                <h5 className="text-[13.5px] font-bold text-zinc-800 leading-snug">{doc.name}</h5>
                                                                <p className="text-[11px] text-zinc-500 font-semibold mt-0.5">{doc.category}</p>
                                                            </div>
                                                        </div>
                                                        <a
                                                            href={route('verify.document.download', { slug, document: doc.id }) + '?token=' + token}
                                                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors"
                                                        >
                                                            Download ({doc.size})
                                                        </a>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    </motion.div>

                    {/* ── Footer ── */}
                    <div className="mt-10 border-t border-zinc-200 pt-8 text-center animate-fade-in">
                        <p className="text-sm text-zinc-555 font-semibold">This verification is valid for 90 days.</p>
                        {expires_at && <p className="text-sm text-zinc-555 font-semibold">Next scheduled audit: {expires_at}</p>}
                    </div>
                </div>
            </div>

            <AccessRequestModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                slug={slug}
                isSample={is_sample}
            />
        </>
    );
}
