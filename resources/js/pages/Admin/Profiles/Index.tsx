import { Head, Link } from '@inertiajs/react';
import { ExternalLink } from 'lucide-react';

import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';

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
        return <span className="rounded-full bg-zinc-100 border border-zinc-200 px-2.5 py-0.5 text-xs font-bold text-zinc-650 shadow-xs">Draft</span>;
    }
    if (row.is_expired) {
        return <span className="rounded-full bg-amber-50 border border-amber-250 px-2.5 py-0.5 text-xs font-bold text-amber-700 shadow-xs">Expired</span>;
    }
    if (row.is_live) {
        return <span className="rounded-full bg-emerald-50 border border-emerald-250 px-2.5 py-0.5 text-xs font-bold text-emerald-700 shadow-xs">Live</span>;
    }
    return <span className="rounded-full bg-zinc-100 border border-zinc-200 px-2.5 py-0.5 text-xs font-bold text-zinc-650 shadow-xs">Draft</span>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminProfilesIndex({ profiles }: PageProps) {
    return (
        <AdminLayout>
            <Head title="Verification Profiles — Admin" />

            <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-8">
                        <h1 className="text-2xl font-extrabold text-zinc-950">Verification Profiles</h1>
                        <p className="mt-1 text-sm text-zinc-555 font-medium">
                            {profiles.length} profile{profiles.length !== 1 ? 's' : ''} total
                        </p>
                    </div>

                    {profiles.length === 0 ? (
                        <div className="rounded-2xl border border-white/80 bg-white/30 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.025)] p-12 text-center">
                            <p className="text-zinc-500 font-semibold">No profiles yet. They are created automatically when an audit is marked complete.</p>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-2xl border border-white/80 bg-white/30 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.025)]">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[800px] text-sm">
                                    <thead>
                                        <tr className="border-b border-zinc-200 bg-zinc-50/50">
                                            <th className="px-5 py-3.5 text-left text-xs font-bold tracking-widest text-zinc-500 uppercase">
                                                Company
                                            </th>
                                            <th className="px-5 py-3.5 text-left text-xs font-bold tracking-widest text-zinc-500 uppercase">
                                                Founder
                                            </th>
                                            <th className="px-5 py-3.5 text-left text-xs font-bold tracking-widest text-zinc-500 uppercase">
                                                Score
                                            </th>
                                            <th className="px-5 py-3.5 text-left text-xs font-bold tracking-widest text-zinc-500 uppercase">
                                                Status
                                            </th>
                                            <th className="px-5 py-3.5 text-left text-xs font-bold tracking-widest text-zinc-500 uppercase">
                                                Badges
                                            </th>
                                            <th className="px-5 py-3.5 text-left text-xs font-bold tracking-widest text-zinc-500 uppercase">
                                                Expires
                                            </th>
                                            <th className="px-5 py-3.5 text-left text-xs font-bold tracking-widest text-zinc-500 uppercase">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-200/80">
                                        {profiles.map((p) => (
                                            <tr
                                                key={p.id}
                                                className="group transition-colors hover:bg-zinc-50/40"
                                            >
                                                <td className="px-5 py-4">
                                                    <div className="font-bold text-zinc-900">{p.company_name ?? '—'}</div>
                                                    <div className="text-xs text-zinc-500 mt-0.5">
                                                        {p.batch ?? ''}
                                                        {p.batch && p.sector ? ' · ' : ''}
                                                        {p.sector ?? ''}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="text-zinc-650 font-semibold">{p.founder_name ?? '—'}</div>
                                                    <div className="text-xs text-zinc-500 mt-0.5">{p.founder_email}</div>
                                                </td>
                                                <td className="px-5 py-4 font-mono font-bold text-zinc-950">{p.overall_score ?? '—'}</td>
                                                <td className="px-5 py-4">
                                                    <StatusBadge row={p} />
                                                </td>
                                                <td className="px-5 py-4 text-zinc-650 font-semibold">{p.verified_badges_count} / 7</td>
                                                <td className="px-5 py-4 text-zinc-650 font-semibold">{p.expires_at ?? '—'}</td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <a
                                                            href={`/verify/${p.slug}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1 text-xs text-[#3A54A5] hover:text-[#2D4182] font-extrabold"
                                                        >
                                                            View <ExternalLink className="size-3" />
                                                        </a>
                                                        <Link
                                                            href={`/admin/profiles/${p.id}`}
                                                            className="text-xs text-zinc-550 hover:text-zinc-950 font-bold"
                                                        >
                                                            Edit
                                                        </Link>
                                                        <Link
                                                            href={`/admin/profiles/${p.id}/access-requests`}
                                                            className="text-xs text-zinc-550 hover:text-zinc-950 font-bold"
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
