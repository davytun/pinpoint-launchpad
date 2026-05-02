import { Head, router, usePage } from '@inertiajs/react';
import {
    CheckCircle2,
    Clock,
    Lock,
    Loader2,
    Shield,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
    PolarAngleAxis,
    PolarGrid,
    Radar,
    RadarChart,
    ResponsiveContainer,
} from 'recharts';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';

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
    need?: number;
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
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PILLAR_KEYS = ['potential', 'agility', 'risk', 'alignment', 'governance', 'operations', 'need'];
const PILLAR_LABELS: Record<string, string> = {
    potential: 'Potential', agility: 'Agility', risk: 'Risk',
    alignment: 'Alignment', governance: 'Governance', operations: 'Operations', need: 'Need',
};

// ─── Count-up ─────────────────────────────────────────────────────────────────

function CountUp({ target, duration = 1200 }: { target: number; duration?: number }) {
    const [value, setValue] = useState(0);
    const raf = useRef<number>(0);
    const startTs = useRef<number>(0);

    useEffect(() => {
        startTs.current = performance.now();
        function tick(now: number) {
            const elapsed  = now - startTs.current;
            const progress = Math.min(elapsed / duration, 1);
            const eased    = 1 - Math.pow(1 - progress, 3);
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
    if (score == null) return '#94A3B8';
    if (score > 85)  return '#10B981';
    if (score >= 65) return '#3B82F6';
    return '#F59E0B';
}

// ─── Diligence rows by tier ───────────────────────────────────────────────────

function diligenceRows(tier?: string | null) {
    const base = [
        { name: 'PARAGON Assessment Report',       level: 'Analyst Certified' },
        { name: 'Radar Chart — Detailed Breakdown', level: 'Verified via Diagnostic Engine' },
    ];
    const growth = [
        { name: 'Financial Stress-Test Results',  level: 'Verified via Bank/Stripe Data' },
        { name: 'Cap Table Certification',         level: 'Tier 2 Audit Complete' },
    ];
    const institutional = [
        { name: 'Unit Economics & LTV Model',                        level: 'Verified via Stripe API' },
        { name: 'Articles of Incorporation / IP Assignment',          level: 'Legal Counsel Certified' },
    ];

    if (tier === 'institutional') return [...base, ...growth, ...institutional];
    if (tier === 'growth')        return [...base, ...growth];
    return base;
}

// ─── Access Request Form ──────────────────────────────────────────────────────

function AccessRequestModal({
    open,
    onClose,
    slug,
    isSample,
}: {
    open: boolean;
    onClose: () => void;
    slug: string;
    isSample: boolean;
}) {
    const { props } = usePage<PageProps & { flash?: { success?: string } }>();
    const [form, setForm] = useState({
        investor_name: '',
        investor_email: '',
        firm_name: '',
        linkedin_url: '',
        message: '',
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (props.flash?.success) {
            onClose();
        }
    }, [props.flash?.success, onClose]);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        router.post(
            `/verify/${slug}/request-access`,
            form,
            {
                preserveScroll: true,
                onSuccess: () => { setSubmitting(false); onClose(); },
                onError: () => setSubmitting(false),
                onFinish: () => setSubmitting(false),
            }
        );
    }



    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
            <DialogContent className="border-[#232C43] bg-[#101623] text-white sm:max-w-md">
                <DialogHeader>
                    {isSample ? (
                        <>
                            <DialogTitle className="text-[#ECF0F9]">Sample Profile</DialogTitle>
                            <DialogDescription className="text-[#788CBA]">
                                This is a sample profile. Request access on a real founder's page.
                            </DialogDescription>
                        </>
                    ) : (
                        <>
                            <DialogTitle className="text-[#ECF0F9]">Request Data Room Access</DialogTitle>
                            <DialogDescription className="text-[#788CBA]">
                                Tell the founder who you are. They'll be in touch directly.
                            </DialogDescription>
                        </>
                    )}
                </DialogHeader>

                {isSample ? (
                    <div className="pt-2">
                        <button
                            onClick={onClose}
                            className="w-full rounded-lg bg-[#1B294B] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1B294B]/80"
                        >
                            Close
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-[#788CBA]">
                                Full Name <span className="text-rose-400">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={form.investor_name}
                                onChange={(e) => setForm((f) => ({ ...f, investor_name: e.target.value }))}
                                className="w-full rounded-lg border border-[#232C43] bg-[#1B294B]/30 px-3 py-2.5 text-sm text-[#ECF0F9] placeholder-[#576FA8] transition-colors focus:border-[#4468BB]/50 focus:outline-none focus:ring-1 focus:ring-[#4468BB]/50"
                                placeholder="Jane Smith"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-400">
                                Email Address <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="email"
                                required
                                value={form.investor_email}
                                onChange={(e) => setForm((f) => ({ ...f, investor_email: e.target.value }))}
                                className="w-full rounded-lg border border-[#232C43] bg-[#1B294B]/30 px-3 py-2.5 text-sm text-[#ECF0F9] placeholder-[#576FA8] transition-colors focus:border-[#4468BB]/50 focus:outline-none focus:ring-1 focus:ring-[#4468BB]/50"
                                placeholder="jane@vcfirm.com"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-400">
                                Firm / Fund Name
                            </label>
                            <input
                                type="text"
                                value={form.firm_name}
                                onChange={(e) => setForm((f) => ({ ...f, firm_name: e.target.value }))}
                                className="w-full rounded-lg border border-[#232C43] bg-[#1B294B]/30 px-3 py-2.5 text-sm text-[#ECF0F9] placeholder-[#576FA8] transition-colors focus:border-[#4468BB]/50 focus:outline-none focus:ring-1 focus:ring-[#4468BB]/50"
                                placeholder="Accel Partners (optional)"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-400">
                                LinkedIn URL
                            </label>
                            <input
                                type="url"
                                value={form.linkedin_url}
                                onChange={(e) => setForm((f) => ({ ...f, linkedin_url: e.target.value }))}
                                className="w-full rounded-lg border border-[#232C43] bg-[#1B294B]/30 px-3 py-2.5 text-sm text-[#ECF0F9] placeholder-[#576FA8] transition-colors focus:border-[#4468BB]/50 focus:outline-none focus:ring-1 focus:ring-[#4468BB]/50"
                                placeholder="https://linkedin.com/in/... (optional)"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-400">
                                Message
                            </label>
                            <textarea
                                rows={3}
                                maxLength={500}
                                value={form.message}
                                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                                className="w-full resize-none rounded-lg border border-[#232C43] bg-[#1B294B]/30 px-3 py-2.5 text-sm text-[#ECF0F9] placeholder-[#576FA8] transition-colors focus:border-[#4468BB]/50 focus:outline-none focus:ring-1 focus:ring-[#4468BB]/50"
                                placeholder="e.g. We invest in B2B SaaS at Seed stage and would love to learn more."
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#4468BB] py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#3C53A8] disabled:opacity-60"
                        >
                            {submitting ? (
                                <><Loader2 className="size-4 animate-spin" /> Submitting...</>
                            ) : (
                                'Submit Request →'
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
}: PageProps) {
    const [modalOpen, setModalOpen]     = useState(false);
    const [reqSubmitted, setReqSubmitted] = useState(false);

    const color      = scoreColor(overall_score);
    const radarItems = PILLAR_KEYS.map((k) => ({
        subject: PILLAR_LABELS[k],
        value:   (radar_data?.[k] ?? 0),
    }));
    const rows = diligenceRows(tier);
    const showExpiryWarning = !is_sample && days_until_expiry != null && days_until_expiry <= 14;

    // Flash success from redirect
    useEffect(() => {
        if (flash?.success) setReqSubmitted(true);
    }, [flash?.success]);

    return (
        <>
            <Head title={`${company_name} — Pinpoint Verified`} />

            <div className="min-h-screen bg-[#080B11] text-[#ECF0F9]">
                <div className="mx-auto max-w-5xl px-4 py-10 lg:px-8">

                    {/* Sample banner */}
                    {is_sample && (
                        <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 py-2 text-center text-sm text-amber-400">
                            SAMPLE PROFILE — This is a demonstration of the Pinpoint verification page.
                        </div>
                    )}

                    {/* Expiry warning */}
                    {showExpiryWarning && (
                        <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 py-2 text-center text-sm text-amber-400">
                            This verification expires in {days_until_expiry} day{days_until_expiry !== 1 ? 's' : ''}. Renewal required.
                        </div>
                    )}

                    {/* ── Header ── */}
                    <div className="mb-8 flex flex-col gap-4 border-b border-[#232C43] pb-8 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <p className="text-sm text-[#788CBA]">Venture Profile:</p>
                            <h1 className="text-3xl font-black text-[#ECF0F9]">{company_name}</h1>
                            {(batch || sector) && (
                                <p className="mt-1 text-sm italic text-[#576FA8]">
                                    {[batch, sector].filter(Boolean).join(' | ')}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col items-start gap-1 sm:items-end">
                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-bold text-emerald-400">
                                <Shield className="size-4" />
                                PINPOINT CERTIFIED: INSTITUTIONAL GRADE
                            </div>
                            {verified_at && (
                                <p className="font-mono text-xs text-[#576FA8]">
                                    Verified On: {verified_at}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* ── Main 3-col grid ── */}
                    <div className="grid gap-6 lg:grid-cols-3">

                        {/* Left: score + radar */}
                        <div className="flex flex-col gap-6">
                            <div className="rounded-2xl border border-[#232C43] bg-[#101623] p-6">
                                <p className="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-[#576FA8]">
                                    PARAGON Score
                                </p>
                                <div className="flex items-end gap-1 leading-none">
                                    <span
                                        className="text-6xl font-black leading-none"
                                        style={{ color }}
                                    >
                                        {overall_score != null ? (
                                            <CountUp target={overall_score} />
                                        ) : '—'}
                                    </span>
                                    <span className="mb-1 text-xl text-[#576FA8]">/ 100</span>
                                </div>
                                <div className="my-4 border-t border-[#232C43]" />
                                <ResponsiveContainer width="100%" height={220}>
                                    <RadarChart data={radarItems} outerRadius="62%" margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                                        <PolarGrid stroke="rgba(255,255,255,0.07)" />
                                        <PolarAngleAxis
                                            dataKey="subject"
                                            tick={{ fill: '#788CBA', fontSize: 10, fontWeight: 600 }}
                                        />
                                        <Radar
                                            dataKey="value"
                                            stroke={color}
                                            fill={`${color}25`}
                                            strokeWidth={2}
                                            dot={{ fill: color, r: 3 }}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Center + right: summary */}
                        <div className="lg:col-span-2">
                            <div className="rounded-2xl border border-[#232C43] bg-[#101623] p-6">
                                <div className="mb-4 flex items-center justify-between gap-4">
                                    <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#576FA8]">
                                        ANALYST EXECUTIVE SUMMARY
                                    </p>
                                    <span className="flex items-center gap-1 text-xs text-[#576FA8]">
                                        <Clock className="size-3" />
                                        Timestamped &amp; Analyst-Signed
                                    </span>
                                </div>

                                {analyst_summary ? (
                                    <p className="text-sm leading-relaxed text-[#ECF0F9]">
                                        {analyst_summary}
                                    </p>
                                ) : (
                                    <p className="text-sm italic text-[#576FA8]">
                                        The analyst summary will appear here once the audit review is complete.
                                    </p>
                                )}

                                {badges.length > 0 && (
                                    <div className="mt-5 flex flex-wrap gap-2">
                                        {badges.map((badge) => (
                                            <span
                                                key={badge.badge_type}
                                                className="rounded-lg border border-[#232C43] bg-[#1B294B]/30 px-3 py-1 text-xs font-semibold text-[#788CBA]"
                                            >
                                                {badge.label}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Diligence Assets Table ── */}
                    <div className="mt-6 rounded-2xl border border-[#232C43] bg-[#101623]">
                        <div className="flex items-center justify-between border-b border-[#232C43] px-6 py-4">
                            <h2 className="font-semibold text-[#ECF0F9]">Verified Diligence Assets</h2>
                            {reqSubmitted ? (
                                <span className="flex items-center gap-2 text-sm text-emerald-400">
                                    <CheckCircle2 className="size-4" />
                                    Request submitted. The founder will be in touch shortly.
                                </span>
                            ) : (
                                <button
                                    onClick={() => setModalOpen(true)}
                                    className="rounded-lg bg-[#4468BB] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#3C53A8]"
                                >
                                    Request Access to Full Data Room
                                </button>
                            )}
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-[#232C43] bg-[#0C1427]/50">
                                        <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-[#576FA8]">Document Name</th>
                                        <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-[#576FA8]">Verification Level</th>
                                        <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-[#576FA8]">Preview</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row, i) => (
                                        <tr key={i} className="border-b border-[#232C43] last:border-0 hover:bg-[#1B294B]/30 transition-colors">
                                            <td className="px-6 py-4 text-[#ECF0F9]">{row.name}</td>
                                            <td className="px-6 py-4 text-[#788CBA]">{row.level}</td>
                                            <td className="px-6 py-4">
                                                <span className="flex items-center gap-1.5 text-xs italic text-[#576FA8]">
                                                    <Lock className="size-3 text-[#576FA8]" />
                                                    LOCKED
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ── Footer ── */}
                    <div className="mt-8 border-t border-[#232C43] pt-8 text-center">
                        <p className="text-sm text-[#576FA8]">This verification is valid for 90 days.</p>
                        {expires_at && (
                            <p className="text-sm text-[#576FA8]">Next scheduled audit: {expires_at}</p>
                        )}
                        <p className="mt-2 font-mono text-xs uppercase tracking-widest text-[#232C43]">
                            Pinpoint Launchpad | Filtering for Quality. Solving for Success.
                        </p>
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
