import { Head, Link, router } from '@inertiajs/react';
import { CheckCircle2, ExternalLink, Save } from 'lucide-react';
import { useState } from 'react';

import AdminLayout from '@/layouts/admin-layout';

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
    const [summary, setSummary]     = useState(profile.analyst_summary ?? '');
    const [sector, setSector]       = useState(profile.sector ?? '');
    const [batch, setBatch]         = useState(profile.batch ?? '');
    const [score, setScore]         = useState<number | ''>(profile.overall_score ?? '');
    const [isPublic, setIsPublic]   = useState(profile.is_public);
    const [radarData, setRadarData] = useState<Record<string, number>>(
        profile.radar_data ?? Object.fromEntries(PILLAR_KEYS.map((k) => [k, 0]))
    );
    const [saving, setSaving]       = useState(false);
    const [togglingBadge, setTogglingBadge] = useState<number | null>(null);

    function handleSave() {
        setSaving(true);
        router.patch(
            `/admin/profiles/${profile.id}`,
            {
                analyst_summary: summary || null,
                sector:          sector || null,
                batch:           batch || null,
                overall_score:   score === '' ? null : score,
                radar_data:      radarData,
                is_public:       isPublic,
            },
            { onFinish: () => setSaving(false) }
        );
    }

    function handleBadgeToggle(badge: Badge, newValue: boolean) {
        setTogglingBadge(badge.id);
        router.patch(
            `/admin/profiles/badges/${badge.id}`,
            { is_verified: newValue },
            { onFinish: () => setTogglingBadge(null) }
        );
    }

    const inputClass =
        'w-full rounded-lg border border-[#232C43] bg-[#1B294B]/30 px-3 py-2 text-sm text-[#D8E0F3] placeholder-[#91A7D8] focus:border-[#3A54A5]/50 focus:outline-none focus:ring-1 focus:ring-[#3A54A5]/50';

    return (
        <AdminLayout>
            <Head title={`${founder.company_name ?? 'Profile'} — Admin`} />

            <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                <div className="mx-auto max-w-6xl">

                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <Link href="/admin/profiles" className="mb-2 block text-sm text-[#91A7D8] hover:text-[#C1CDE8]">
                                &larr; All Profiles
                            </Link>
                            <h1 className="text-2xl font-bold text-[#D8E0F3]">
                                {founder.company_name ?? founder.email}
                            </h1>
                            <p className="mt-1 text-sm text-[#C1CDE8]">{founder.full_name} · {founder.email}</p>
                        </div>
                        <a
                            href={`/verify/${profile.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 rounded-lg border border-[#232C43] px-4 py-2 text-sm text-[#C1CDE8] hover:border-[#3A54A5]/50 hover:text-[#D8E0F3]"
                        >
                            View Public Page <ExternalLink className="size-4" />
                        </a>
                    </div>

                    {flash?.success && (
                        <div className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                            <CheckCircle2 className="size-4" />
                            {flash.success}
                        </div>
                    )}

                    <div className="grid gap-6 lg:grid-cols-2">

                        {/* ── Left: Profile Editor ── */}
                        <div className="rounded-xl border border-[#232C43] bg-[#101623] p-6">
                            <h2 className="mb-5 text-sm font-bold uppercase tracking-widest text-[#C1CDE8]">Profile Editor</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-[#91A7D8]">Analyst Summary</label>
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
                                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-[#91A7D8]">Sector</label>
                                        <input
                                            type="text"
                                            value={sector}
                                            onChange={(e) => setSector(e.target.value)}
                                            className={inputClass}
                                            placeholder="B2B SaaS / Infrastructure"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-[#91A7D8]">Batch</label>
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
                                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-[#91A7D8]">Overall Score (0–100)</label>
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
                                    <label className="mb-3 block text-xs font-semibold uppercase tracking-widest text-[#91A7D8]">Radar Pillar Scores</label>
                                    <div className="space-y-3">
                                        {PILLAR_KEYS.map((key) => (
                                            <div key={key} className="flex items-center gap-3">
                                                <span className="w-24 text-xs capitalize text-[#C1CDE8]">{key}</span>
                                                <input
                                                    type="range"
                                                    min={0}
                                                    max={100}
                                                    value={radarData[key] ?? 0}
                                                    onChange={(e) =>
                                                        setRadarData((d) => ({ ...d, [key]: Number(e.target.value) }))
                                                    }
                                                    className="flex-1 accent-[#3A54A5]"
                                                />
                                                <span className="w-8 text-right font-mono text-xs text-[#C1CDE8]">
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
                                        className={[
                                            'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none',
                                            isPublic ? 'bg-emerald-500' : 'bg-[#232C43]',
                                        ].join(' ')}
                                    >
                                        <span
                                            className={[
                                                'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition duration-200',
                                                isPublic ? 'translate-x-5' : 'translate-x-0',
                                            ].join(' ')}
                                        />
                                    </button>
                                    <span className="text-sm text-[#C1CDE8]">
                                        {isPublic ? 'Public — visible to investors' : 'Draft — not visible'}
                                    </span>
                                </div>

                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#3A54A5] py-2.5 text-sm font-bold text-white hover:bg-[#2F4587] disabled:opacity-60 transition-colors"
                                >
                                    <Save className="size-4" />
                                    {saving ? 'Saving...' : 'Save Profile'}
                                </button>
                            </div>
                        </div>

                        {/* ── Right: Badge Manager ── */}
                        <div className="rounded-xl border border-[#232C43] bg-[#101623] p-6">
                            <h2 className="mb-5 text-sm font-bold uppercase tracking-widest text-[#C1CDE8]">Badge Manager</h2>

                            <div className="space-y-3">
                                {badges.map((badge) => (
                                    <div
                                        key={badge.id}
                                        className="flex items-center justify-between rounded-xl border border-[#232C43] bg-[#1B294B]/30 px-4 py-3"
                                    >
                                        <div>
                                            <p className="text-sm font-semibold text-[#D8E0F3]">{badge.label}</p>
                                            {badge.is_verified && badge.verified_at && (
                                                <p className="mt-0.5 text-xs text-[#91A7D8]">
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
                                            className={[
                                                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50',
                                                badge.is_verified ? 'bg-emerald-500' : 'bg-[#232C43]',
                                            ].join(' ')}
                                        >
                                            <span
                                                className={[
                                                    'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition duration-200',
                                                    badge.is_verified ? 'translate-x-5' : 'translate-x-0',
                                                ].join(' ')}
                                            />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── Access Requests ── */}
                    {access_requests.length > 0 && (
                        <div className="mt-6 rounded-xl border border-[#232C43] bg-[#101623] p-6">
                            <h2 className="mb-5 text-sm font-bold uppercase tracking-widest text-[#C1CDE8]">
                                Investor Access Requests ({access_requests.length})
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-[#232C43]">
                                            <th className="pb-3 text-left text-xs font-bold uppercase tracking-widest text-[#91A7D8]">Investor</th>
                                            <th className="pb-3 text-left text-xs font-bold uppercase tracking-widest text-[#91A7D8]">Firm</th>
                                            <th className="pb-3 text-left text-xs font-bold uppercase tracking-widest text-[#91A7D8]">Email</th>
                                            <th className="pb-3 text-left text-xs font-bold uppercase tracking-widest text-[#91A7D8]">Requested</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {access_requests.map((req) => (
                                            <tr key={req.id} className="border-b border-[#232C43] last:border-0 hover:bg-[#1B294B]/30 transition-colors">
                                                <td className="py-3 pr-4 text-[#D8E0F3]">{req.investor_name}</td>
                                                <td className="py-3 pr-4 text-[#C1CDE8]">{req.firm_name ?? '—'}</td>
                                                <td className="py-3 pr-4 text-[#C1CDE8]">{req.investor_email}</td>
                                                <td className="py-3 text-[#91A7D8]">
                                                    {new Date(req.created_at).toLocaleDateString()}
                                                </td>
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
