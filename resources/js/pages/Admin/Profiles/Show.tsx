import { Head, Link, router } from '@inertiajs/react';
import { CheckCircle2, ExternalLink, Save } from 'lucide-react';
import { useState } from 'react';

import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Profile {
    id: number;
    slug: string;
    is_public: boolean;
    overall_score: number | null;
    radar_data: Record<string, number> | null;
    analyst_summary: string | null;
    batch: string | null;
    sector: string | null;
    verified_at: string | null;
    expires_at: string | null;
}

interface FounderData {
    id: number;
    full_name: string | null;
    company_name: string | null;
    email: string;
}

interface Badge {
    id: number;
    badge_type: string;
    label: string;
    is_verified: boolean;
    verified_at: string | null;
}

interface AccessRequest {
    id: number;
    investor_name: string;
    investor_email: string;
    firm_name: string | null;
    message: string | null;
    created_at: string;
}

interface PageProps {
    profile: Profile;
    founder: FounderData;
    badges: Badge[];
    access_requests: AccessRequest[];
    flash?: { success?: string };
}

const PILLAR_KEYS = ['potential', 'agility', 'risk', 'alignment', 'governance', 'operations', 'network'];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminProfilesShow({ profile, founder, badges, access_requests, flash }: PageProps) {
    const [summary, setSummary] = useState(profile.analyst_summary ?? '');
    const [sector, setSector] = useState(profile.sector ?? '');
    const [batch, setBatch] = useState(profile.batch ?? '');
    const [score, setScore] = useState<number | ''>(profile.overall_score ?? '');
    const [isPublic, setIsPublic] = useState(profile.is_public);
    const [radarData, setRadarData] = useState<Record<string, number>>(profile.radar_data ?? Object.fromEntries(PILLAR_KEYS.map((k) => [k, 0])));
    const [saving, setSaving] = useState(false);
    const [togglingBadge, setTogglingBadge] = useState<number | null>(null);

    function handleSave() {
        setSaving(true);
        router.patch(
            `/admin/profiles/${profile.id}`,
            {
                analyst_summary: summary || null,
                sector: sector || null,
                batch: batch || null,
                overall_score: score === '' ? null : score,
                radar_data: radarData,
                is_public: isPublic,
            },
            { onFinish: () => setSaving(false) },
        );
    }

    function handleBadgeToggle(badge: Badge, newValue: boolean) {
        setTogglingBadge(badge.id);
        router.patch(`/admin/profiles/badges/${badge.id}`, { is_verified: newValue }, { onFinish: () => setTogglingBadge(null) });
    }

    const inputClass =
        'w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-955 placeholder:text-zinc-400 focus:border-[#3A54A5]/60 focus:ring-2 focus:ring-[#3A54A5]/10 focus:outline-none shadow-xs';

    return (
        <AdminLayout>
            <Head title={`${founder.company_name ?? 'Profile'} — Admin`} />

            <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                <div className="mx-auto max-w-6xl">
                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <Link href="/admin/profiles" className="text-zinc-550 hover:text-zinc-955 mb-2 block text-sm font-bold">
                                &larr; All Profiles
                            </Link>
                            <h1 className="text-2xl font-extrabold text-zinc-950">{founder.company_name ?? founder.email}</h1>
                            <p className="text-zinc-555 mt-1 text-sm font-medium">
                                {founder.full_name} · {founder.email}
                            </p>
                        </div>
                        <a
                            href={`/verify/${profile.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-zinc-650 hover:border-zinc-350 hover:text-zinc-955 flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold shadow-xs"
                        >
                            View Public Page <ExternalLink className="size-4" />
                        </a>
                    </div>

                    {flash?.success && (
                        <div className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                            <CheckCircle2 className="size-4" />
                            {flash.success}
                        </div>
                    )}

                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* ── Left: Profile Editor ── */}
                        <div className="rounded-2xl border border-white/80 bg-white/30 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.025)] backdrop-blur-md">
                            <h2 className="mb-5 text-sm font-bold tracking-widest text-zinc-500 uppercase">Profile Editor</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="mb-1.5 block text-xs font-bold tracking-widest text-zinc-500 uppercase">Analyst Summary</label>
                                    <textarea
                                        rows={6}
                                        maxLength={2000}
                                        value={summary}
                                        onChange={(e) => setSummary(e.target.value)}
                                        className={inputClass + ' resize-none'}
                                        placeholder="Write the executive summary visible to investors..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1.5 block text-xs font-bold tracking-widest text-zinc-500 uppercase">Sector</label>
                                        <input
                                            type="text"
                                            value={sector}
                                            onChange={(e) => setSector(e.target.value)}
                                            className={inputClass}
                                            placeholder="B2B SaaS / Infrastructure"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-xs font-bold tracking-widest text-zinc-500 uppercase">Batch</label>
                                        <input
                                            type="text"
                                            value={batch}
                                            onChange={(e) => setBatch(e.target.value)}
                                            className={inputClass}
                                            placeholder="Spring 2026"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-bold tracking-widest text-zinc-500 uppercase">
                                        Overall Score (0–100)
                                    </label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={score}
                                        onChange={(e) => setScore(e.target.value === '' ? '' : Number(e.target.value))}
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className="mb-3 block text-xs font-bold tracking-widest text-zinc-500 uppercase">
                                        Radar Pillar Scores
                                    </label>
                                    <div className="space-y-3">
                                        {PILLAR_KEYS.map((key) => (
                                            <div key={key} className="flex items-center gap-3">
                                                <span className="text-zinc-650 w-24 text-xs font-semibold capitalize">{key}</span>
                                                <input
                                                    type="range"
                                                    min={0}
                                                    max={100}
                                                    value={radarData[key] ?? 0}
                                                    onChange={(e) => setRadarData((d) => ({ ...d, [key]: Number(e.target.value) }))}
                                                    className="flex-1 accent-[#3A54A5]"
                                                />
                                                <span className="w-8 text-right font-mono text-xs font-bold text-zinc-700">
                                                    {radarData[key] ?? 0}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={isPublic}
                                        onClick={() => setIsPublic((v) => !v)}
                                        className={cn(
                                            'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none',
                                            isPublic ? 'bg-emerald-600' : 'bg-zinc-200',
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition duration-200',
                                                isPublic ? 'translate-x-5' : 'translate-x-0',
                                            )}
                                        />
                                    </button>
                                    <span className="text-zinc-650 text-sm font-semibold">
                                        {isPublic ? 'Public — visible to investors' : 'Draft — not visible'}
                                    </span>
                                </div>

                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#3A54A5] py-2.5 text-sm font-bold text-white shadow-md shadow-[#3A54A5]/20 transition-colors hover:bg-[#2D4182] hover:shadow-lg disabled:opacity-60"
                                >
                                    <Save className="size-4" />
                                    {saving ? 'Saving...' : 'Save Profile'}
                                </button>
                            </div>
                        </div>

                        {/* ── Right: Badge Manager ── */}
                        <div className="rounded-2xl border border-white/80 bg-white/30 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.025)] backdrop-blur-md">
                            <h2 className="mb-5 text-sm font-bold tracking-widest text-zinc-500 uppercase">Badge Manager</h2>

                            <div className="space-y-3">
                                {badges.map((badge) => (
                                    <div
                                        key={badge.id}
                                        className="flex items-center justify-between rounded-xl border border-zinc-200/80 bg-zinc-50/50 px-4 py-3 shadow-xs"
                                    >
                                        <div>
                                            <p className="text-sm font-bold text-zinc-900">{badge.label}</p>
                                            {badge.is_verified && badge.verified_at && (
                                                <p className="mt-0.5 text-xs text-zinc-400">
                                                    Verified {new Date(badge.verified_at).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            role="switch"
                                            aria-checked={badge.is_verified}
                                            disabled={togglingBadge === badge.id}
                                            onClick={() => handleBadgeToggle(badge, !badge.is_verified)}
                                            className={cn(
                                                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50',
                                                badge.is_verified ? 'bg-emerald-600' : 'bg-zinc-200',
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition duration-200',
                                                    badge.is_verified ? 'translate-x-5' : 'translate-x-0',
                                                )}
                                            />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── Access Requests ── */}
                    {access_requests.length > 0 && (
                        <div className="mt-6 rounded-2xl border border-white/80 bg-white/30 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.025)] backdrop-blur-md">
                            <h2 className="mb-5 text-sm font-bold tracking-widest text-zinc-500 uppercase">
                                Investor Access Requests ({access_requests.length})
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[600px] text-sm">
                                    <thead>
                                        <tr className="border-b border-zinc-200">
                                            <th className="pb-3 text-left text-xs font-bold tracking-widest text-zinc-500 uppercase">Investor</th>
                                            <th className="pb-3 text-left text-xs font-bold tracking-widest text-zinc-500 uppercase">Firm</th>
                                            <th className="pb-3 text-left text-xs font-bold tracking-widest text-zinc-500 uppercase">Email</th>
                                            <th className="pb-3 text-left text-xs font-bold tracking-widest text-zinc-500 uppercase">Requested</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-200/80">
                                        {access_requests.map((req) => (
                                            <tr key={req.id} className="group transition-colors hover:bg-zinc-50/40">
                                                <td className="py-3 pr-4 font-bold text-zinc-900">{req.investor_name}</td>
                                                <td className="text-zinc-655 py-3 pr-4 font-medium">{req.firm_name ?? '—'}</td>
                                                <td className="text-zinc-655 py-3 pr-4 font-medium">{req.investor_email}</td>
                                                <td className="text-zinc-450 py-3 font-semibold">{new Date(req.created_at).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
