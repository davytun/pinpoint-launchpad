import { Icon } from '@iconify/react';
import { Head, Link, router } from '@inertiajs/react';
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
    investor_interests: AccessRequest[];
    flash?: { success?: string };
}

const PILLAR_KEYS = ['potential', 'agility', 'risk', 'alignment', 'governance', 'operations', 'network'];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminProfilesShow({ profile, founder, badges, investor_interests, flash }: PageProps) {
    const [summary, setSummary] = useState(profile.analyst_summary ?? '');
    const [sector, setSector] = useState(profile.sector ?? '');
    const [batch, setBatch] = useState(profile.batch ?? '');
    const [score, setScore] = useState<number | ''>(profile.overall_score ?? '');
    const [isPublic, setIsPublic] = useState(profile.is_public);
    // Safely parse radar_data, handling potential JSON strings or casing mismatches
    const [radarData, setRadarData] = useState<Record<string, number | undefined>>(() => {
        let raw = profile.radar_data;
        if (typeof raw === 'string') {
            try {
                raw = JSON.parse(raw);
            } catch {
                /* ignore */
            }
        }
        if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
            return Object.fromEntries(Object.entries(raw).map(([k, v]) => [k.toLowerCase(), Number(v)]));
        }
        return {}; // Start empty, do not force 0
    });
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
        'w-full rounded-xl border border-zinc-200/80 bg-white py-2 px-3.5 text-[13px] text-zinc-900 placeholder:text-zinc-400 shadow-2xs focus:border-zinc-400 focus:ring-4 focus:ring-zinc-100 transition-all outline-none';

    return (
        <AdminLayout>
            <Head title={`${founder.company_name ?? 'Profile'} — Admin`} />

            <div className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-8 sm:px-8 lg:px-12 lg:py-10">
                <div className="mx-auto w-full max-w-6xl pb-20">
                    {/* Header */}
                    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <Link
                                href="/admin/profiles"
                                className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 transition-colors hover:text-zinc-900"
                            >
                                <Icon icon="solar:arrow-left-linear" className="size-3.5" />
                                <span>All Profiles</span>
                            </Link>
                            <h1 className="text-2xl font-bold tracking-tight text-zinc-950 sm:text-[28px]">
                                {founder.company_name ?? founder.email}
                            </h1>
                            <p className="mt-1.5 text-[13px] font-medium text-zinc-500">
                                {founder.full_name} · {founder.email}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <a
                                href={`/investor/spotlight/${profile.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-9 items-center gap-2 rounded-xl border border-zinc-200/90 bg-white px-4 text-xs font-semibold text-zinc-800 shadow-2xs transition-colors hover:bg-zinc-50"
                            >
                                <span>View Spotlight Page</span>
                                <Icon icon="solar:external-link-linear" className="size-3.5 text-zinc-400" />
                            </a>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex h-9 items-center gap-2 rounded-xl bg-zinc-950 px-4 text-xs font-bold text-white shadow-2xs transition-all hover:bg-zinc-800 disabled:opacity-60"
                            >
                                {saving ? (
                                    <Icon icon="solar:refresh-linear" className="size-3.5 animate-spin" />
                                ) : (
                                    <Icon icon="solar:diskette-linear" className="size-3.5" />
                                )}
                                <span>{saving ? 'Saving...' : 'Save Profile'}</span>
                            </button>
                        </div>
                    </div>

                    {flash?.success && (
                        <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-emerald-500/25 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 shadow-2xs">
                            <Icon icon="solar:check-circle-linear" className="size-4 shrink-0 text-emerald-600" />
                            {flash.success}
                        </div>
                    )}

                    <div className="grid items-start gap-6 lg:grid-cols-12">
                        {/* ── Left: Profile Editor (7 columns) ── */}
                        <div className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] lg:col-span-7 lg:rounded-[22px]">
                            <div className="border-b border-zinc-100 px-6 py-4">
                                <h2 className="text-[13px] font-bold text-zinc-950">Profile Details</h2>
                                <p className="mt-0.5 text-[11px] text-zinc-500">Manage the information shown to approved investors in Spotlight.</p>
                            </div>

                            <div className="space-y-6 p-6">
                                <div>
                                    <label className="mb-2 block text-[11px] font-bold tracking-wider text-zinc-500 uppercase">Analyst Summary</label>
                                    <textarea
                                        rows={5}
                                        maxLength={2000}
                                        value={summary}
                                        onChange={(e) => setSummary(e.target.value)}
                                        className={cn(inputClass, 'resize-none')}
                                        placeholder="Write the executive summary visible to investors..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-2 block text-[11px] font-bold tracking-wider text-zinc-500 uppercase">Sector</label>
                                        <input
                                            type="text"
                                            value={sector}
                                            onChange={(e) => setSector(e.target.value)}
                                            className={inputClass}
                                            placeholder="e.g. B2B SaaS"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-[11px] font-bold tracking-wider text-zinc-500 uppercase">Batch</label>
                                        <input
                                            type="text"
                                            value={batch}
                                            onChange={(e) => setBatch(e.target.value)}
                                            className={inputClass}
                                            placeholder="e.g. Spring 2026"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-[11px] font-bold tracking-wider text-zinc-500 uppercase">
                                        Overall Score (0–100)
                                    </label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={score}
                                        onChange={(e) => setScore(e.target.value === '' ? '' : Number(e.target.value))}
                                        className={cn(inputClass, 'max-w-37.5 font-mono font-medium')}
                                    />
                                </div>

                                <div className="border-t border-zinc-100 pt-2">
                                    <label className="mb-4 block text-[11px] font-bold tracking-wider text-zinc-500 uppercase">
                                        Radar Pillar Scores (Measurements)
                                    </label>

                                    {Object.keys(radarData).length === 0 ? (
                                        <div className="flex max-w-sm flex-col items-start gap-3 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 p-5">
                                            <p className="text-[12px] text-zinc-500">
                                                No pillar scores have been computed or assigned for this profile.
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => setRadarData(Object.fromEntries(PILLAR_KEYS.map((k) => [k, 50])))}
                                                className="rounded-lg bg-zinc-900 px-3 py-1.5 text-[11.5px] font-semibold text-white shadow-xs transition-colors hover:bg-zinc-800"
                                            >
                                                Initialize Scores
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="max-w-sm space-y-4">
                                            {PILLAR_KEYS.map((key) => (
                                                <div key={key} className="flex items-center gap-4">
                                                    <span className="w-24 text-[12px] font-semibold text-zinc-700 capitalize">{key}</span>
                                                    <input
                                                        type="range"
                                                        min={0}
                                                        max={100}
                                                        value={radarData[key] ?? 50}
                                                        onChange={(e) => setRadarData((d) => ({ ...d, [key]: Number(e.target.value) }))}
                                                        style={{
                                                            background:
                                                                radarData[key] !== undefined
                                                                    ? `linear-gradient(to right, #18181b ${radarData[key]}%, #f4f4f5 ${radarData[key]}%)`
                                                                    : '#f4f4f5',
                                                        }}
                                                        className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full border border-zinc-200/60 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-zinc-300 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-xs [&::-webkit-slider-thumb]:transition-colors hover:[&::-webkit-slider-thumb]:border-zinc-400"
                                                    />
                                                    <span className="w-8 text-right text-[12px] font-bold text-zinc-700 tabular-nums">
                                                        {radarData[key] ?? 50}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-zinc-100 pt-4">
                                    <div className="flex items-center justify-between rounded-xl border border-zinc-200/90 bg-[#F9F9FB] p-4">
                                        <div>
                                            <p className="text-[13px] font-bold text-zinc-950">Public Visibility</p>
                                            <p className="mt-0.5 text-[11.5px] text-zinc-500">
                                                {isPublic
                                                    ? 'This profile is currently visible to approved investors.'
                                                    : 'This profile is hidden and acting as a draft.'}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            role="switch"
                                            aria-checked={isPublic}
                                            onClick={() => setIsPublic((v) => !v)}
                                            className={cn(
                                                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent shadow-2xs transition-colors duration-200 focus:outline-none',
                                                isPublic ? 'bg-emerald-500' : 'bg-zinc-300',
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition duration-200',
                                                    isPublic ? 'translate-x-5' : 'translate-x-0',
                                                )}
                                            />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Right: Badge Manager (5 columns) ── */}
                        <div className="flex flex-col gap-6 lg:col-span-5">
                            <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] lg:rounded-[22px]">
                                <div className="border-b border-zinc-100 px-6 py-4">
                                    <h2 className="text-[13px] font-bold text-zinc-950">Verification Badges</h2>
                                    <p className="mt-0.5 text-[11px] text-zinc-500">Toggle badges displayed on the profile.</p>
                                </div>
                                <div className="space-y-2 p-4">
                                    {badges.map((badge) => (
                                        <div
                                            key={badge.id}
                                            className="flex items-center justify-between rounded-xl border border-zinc-200/80 bg-[#FAFBFD] px-4 py-3 shadow-2xs transition-colors hover:bg-zinc-50"
                                        >
                                            <div>
                                                <p className="text-[12.5px] font-bold text-zinc-900">{badge.label}</p>
                                                {badge.is_verified && badge.verified_at && (
                                                    <p className="mt-0.5 text-[10.5px] font-medium text-zinc-400">
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
                                                    'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent shadow-2xs transition-colors duration-200 focus:outline-none disabled:opacity-50',
                                                    badge.is_verified ? 'bg-emerald-500' : 'bg-zinc-300',
                                                )}
                                            >
                                                <span
                                                    className={cn(
                                                        'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow ring-0 transition duration-200',
                                                        badge.is_verified ? 'translate-x-4' : 'translate-x-0',
                                                    )}
                                                />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Investor engagement ── */}
                    {investor_interests.length > 0 && (
                        <div className="mt-6 flex flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] lg:rounded-[22px]">
                            <div className="border-b border-zinc-100 px-6 py-4">
                                <h2 className="text-[13px] font-bold text-zinc-950">Investor Engagement</h2>
                                <p className="mt-0.5 text-[11px] text-zinc-500">
                                    Interests coordinated through Pinpoint for this profile ({investor_interests.length} total).
                                </p>
                            </div>

                            <div className="no-scrollbar overflow-x-auto">
                                <table className="w-full min-w-150">
                                    <thead>
                                        <tr className="border-b border-zinc-100 bg-zinc-50/50">
                                            <th className="px-6 py-3 text-left text-[11px] font-bold tracking-wider text-zinc-500 uppercase">
                                                Investor
                                            </th>
                                            <th className="px-6 py-3 text-left text-[11px] font-bold tracking-wider text-zinc-500 uppercase">Firm</th>
                                            <th className="px-6 py-3 text-left text-[11px] font-bold tracking-wider text-zinc-500 uppercase">
                                                Email
                                            </th>
                                            <th className="px-6 py-3 text-left text-[11px] font-bold tracking-wider text-zinc-500 uppercase">
                                                Requested
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100">
                                        {investor_interests.map((req) => (
                                            <tr key={req.id} className="group transition-colors hover:bg-zinc-50/80">
                                                <td className="px-6 py-3.5 text-[12.5px] font-bold text-zinc-900">{req.investor_name}</td>
                                                <td className="px-6 py-3.5 text-[12.5px] font-medium text-zinc-600">{req.firm_name ?? '—'}</td>
                                                <td className="px-6 py-3.5 text-[12.5px] text-zinc-600">{req.investor_email}</td>
                                                <td className="px-6 py-3.5 text-[12.5px] font-medium text-zinc-500 tabular-nums">
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
