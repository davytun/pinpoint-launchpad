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
            <span className="rounded-full bg-slate-700 px-2.5 py-0.5 text-xs font-semibold text-slate-300">
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
        <span className="rounded-full bg-slate-700 px-2.5 py-0.5 text-xs font-semibold text-slate-300">
            Draft
        </span>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminProfilesIndex({ profiles }: PageProps) {
    return (
        <AdminLayout>
            <Head title="Verification Profiles — Admin" />

            <div className="min-h-screen bg-slate-950 px-4 py-10 text-white lg:px-8">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-white">Verification Profiles</h1>
                        <p className="mt-1 text-sm text-slate-400">
                            {profiles.length} profile{profiles.length !== 1 ? 's' : ''} total
                        </p>
                    </div>

                    {profiles.length === 0 ? (
                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center">
                            <p className="text-slate-500">No profiles yet. They are created automatically when an audit is marked complete.</p>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-800">
                                            <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-slate-500">Company</th>
                                            <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-slate-500">Founder</th>
                                            <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-slate-500">Score</th>
                                            <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-slate-500">Status</th>
                                            <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-slate-500">Badges</th>
                                            <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-slate-500">Expires</th>
                                            <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-slate-500">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {profiles.map((p) => (
                                            <tr key={p.id} className="border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30">
                                                <td className="px-5 py-4">
                                                    <div className="font-semibold text-white">{p.company_name ?? '—'}</div>
                                                    <div className="text-xs text-slate-500">{p.batch ?? ''}{p.batch && p.sector ? ' · ' : ''}{p.sector ?? ''}</div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="text-slate-300">{p.founder_name ?? '—'}</div>
                                                    <div className="text-xs text-slate-500">{p.founder_email}</div>
                                                </td>
                                                <td className="px-5 py-4 font-mono font-bold text-white">
                                                    {p.overall_score ?? '—'}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <StatusBadge row={p} />
                                                </td>
                                                <td className="px-5 py-4 text-slate-400">
                                                    {p.verified_badges_count} / 7
                                                </td>
                                                <td className="px-5 py-4 text-slate-400">
                                                    {p.expires_at ?? '—'}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <a
                                                            href={`/verify/${p.slug}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                                                        >
                                                            View <ExternalLink className="size-3" />
                                                        </a>
                                                        <Link
                                                            href={`/admin/profiles/${p.id}`}
                                                            className="text-xs text-slate-400 hover:text-white"
                                                        >
                                                            Edit
                                                        </Link>
                                                        <Link
                                                            href={`/admin/profiles/${p.id}/access-requests`}
                                                            className="text-xs text-slate-400 hover:text-white"
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
