import { Head, Link } from '@inertiajs/react';
import { ExternalLink } from 'lucide-react';

import AdminLayout from '@/layouts/admin-layout';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileRow {
    id: number;
    slug: string;
    company_name: string | null;
    founder_name: string | null;
    founder_email: string;
    overall_score: number | null;
    is_public: boolean;
    is_live: boolean;
    is_expired: boolean;
    verified_badges_count: number;
    verified_at: string | null;
    expires_at: string | null;
    batch: string | null;
    sector: string | null;
}

interface PageProps {
    profiles: ProfileRow[];
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ row }: { row: ProfileRow }) {
    if (!row.is_public) {
        return (
            <span className="rounded-full bg-[#232C43] px-2.5 py-0.5 text-xs font-semibold text-[#C1CDE8]">
                Draft
            </span>
        );
    }
    if (row.is_expired) {
        return (
            <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
                Expired
            </span>
        );
    }
    if (row.is_live) {
        return (
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                Live
            </span>
        );
    }
    return (
        <span className="rounded-full bg-[#232C43] px-2.5 py-0.5 text-xs font-semibold text-[#C1CDE8]">
            Draft
        </span>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminProfilesIndex({ profiles }: PageProps) {
    return (
        <AdminLayout>
            <Head title="Verification Profiles — Admin" />

            <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-[#D8E0F3]">Verification Profiles</h1>
                        <p className="mt-1 text-sm text-[#C1CDE8]">
                            {profiles.length} profile{profiles.length !== 1 ? 's' : ''} total
                        </p>
                    </div>

                    {profiles.length === 0 ? (
                        <div className="rounded-xl border border-[#232C43] bg-[#101623] p-12 text-center">
                            <p className="text-[#91A7D8]">No profiles yet. They are created automatically when an audit is marked complete.</p>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-xl border border-[#232C43] bg-[#101623]">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-[#232C43] bg-[#0C1427]/50">
                                            <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-[#91A7D8]">Company</th>
                                            <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-[#91A7D8]">Founder</th>
                                            <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-[#91A7D8]">Score</th>
                                            <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-[#91A7D8]">Status</th>
                                            <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-[#91A7D8]">Badges</th>
                                            <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-[#91A7D8]">Expires</th>
                                            <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-[#91A7D8]">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {profiles.map((p) => (
                                            <tr key={p.id} className="border-b border-[#232C43] last:border-0 hover:bg-[#1B294B]/30 transition-colors">
                                                <td className="px-5 py-4">
                                                    <div className="font-semibold text-[#D8E0F3]">{p.company_name ?? '—'}</div>
                                                    <div className="text-xs text-[#91A7D8]">{p.batch ?? ''}{p.batch && p.sector ? ' · ' : ''}{p.sector ?? ''}</div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="text-[#C1CDE8]">{p.founder_name ?? '—'}</div>
                                                    <div className="text-xs text-[#91A7D8]">{p.founder_email}</div>
                                                </td>
                                                <td className="px-5 py-4 font-mono font-bold text-[#D8E0F3]">
                                                    {p.overall_score ?? '—'}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <StatusBadge row={p} />
                                                </td>
                                                <td className="px-5 py-4 text-[#C1CDE8]">
                                                    {p.verified_badges_count} / 7
                                                </td>
                                                <td className="px-5 py-4 text-[#C1CDE8]">
                                                    {p.expires_at ?? '—'}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <a
                                                            href={`/verify/${p.slug}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1 text-xs text-[#3A54A5] hover:text-[#2F4587]"
                                                        >
                                                            View <ExternalLink className="size-3" />
                                                        </a>
                                                        <Link
                                                            href={`/admin/profiles/${p.id}`}
                                                            className="text-xs text-[#91A7D8] hover:text-[#D8E0F3]"
                                                        >
                                                            Edit
                                                        </Link>
                                                        <Link
                                                            href={`/admin/profiles/${p.id}/access-requests`}
                                                            className="text-xs text-[#91A7D8] hover:text-[#D8E0F3]"
                                                        >
                                                            Requests
                                                        </Link>
                                                    </div>
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
