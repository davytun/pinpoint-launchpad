import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Clock, ExternalLink, Lock, Mail } from 'lucide-react';

import AdminLayout from '@/layouts/admin-layout';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AccessRequest {
    id: number;
    investor_name: string;
    investor_email: string;
    firm_name: string | null;
    linkedin_url: string | null;
    message: string | null;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
}

interface ProfileInfo {
    id: number;
    slug: string;
    company_name: string;
}

interface PageProps {
    profile: ProfileInfo;
    access_requests: AccessRequest[];
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: 'pending' | 'approved' | 'rejected' }) {
    if (status === 'approved') {
        return (
            <span className="border-emerald-250 inline-flex items-center gap-1 rounded-full border bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 shadow-xs">
                <CheckCircle2 className="size-3.5" /> Approved
            </span>
        );
    }
    if (status === 'rejected') {
        return (
            <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-100 px-2.5 py-0.5 text-xs font-bold text-zinc-500">
                Rejected
            </span>
        );
    }
    return (
        <span className="border-amber-250 inline-flex items-center gap-1 rounded-full border bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 shadow-xs">
            <Clock className="size-3.5" /> Pending Review
        </span>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminAccessRequests({ profile, access_requests }: PageProps) {
    function fmtDateTime(iso: string): string {
        return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    }

    return (
        <AdminLayout>
            <Head title={`Data Room Requests — ${profile.company_name} — Admin`} />

            <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                <div className="mx-auto max-w-6xl">
                    {/* Back Button */}
                    <div className="mb-6">
                        <Link
                            href="/admin/profiles"
                            className="text-zinc-550 inline-flex items-center gap-1.5 text-sm font-bold transition-colors hover:text-zinc-950"
                        >
                            <ArrowLeft className="size-4" /> Back to Profiles
                        </Link>
                    </div>

                    {/* Header */}
                    <div className="mb-8">
                        <span className="text-[10px] font-bold tracking-widest text-[#3A54A5] uppercase">Security Portal</span>
                        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-zinc-950">Data Room Access Requests</h1>
                        <p className="text-zinc-555 mt-1 text-sm font-medium">
                            Reviewing requests for <span className="font-bold text-zinc-900">{profile.company_name}</span> · {access_requests.length}{' '}
                            total request{access_requests.length !== 1 ? 's' : ''}
                        </p>
                    </div>

                    {/* Content */}
                    {access_requests.length === 0 ? (
                        <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center shadow-xs">
                            <Lock className="mx-auto mb-3 size-8 text-zinc-300" />
                            <p className="text-sm font-bold text-zinc-500">No data room access requests have been submitted for this company.</p>
                            <p className="mt-1 text-xs text-zinc-400">When investors request access, they will show up here.</p>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[800px] text-sm">
                                    <thead>
                                        <tr className="border-b border-zinc-200 bg-zinc-50/50">
                                            <th className="px-5 py-3.5 text-left text-xs font-bold tracking-widest text-zinc-500 uppercase">
                                                Investor
                                            </th>
                                            <th className="px-5 py-3.5 text-left text-xs font-bold tracking-widest text-zinc-500 uppercase">
                                                Venture Firm
                                            </th>
                                            <th className="px-5 py-3.5 text-left text-xs font-bold tracking-widest text-zinc-500 uppercase">
                                                Status
                                            </th>
                                            <th className="px-5 py-3.5 text-left text-xs font-bold tracking-widest text-zinc-500 uppercase">
                                                Requested Date
                                            </th>
                                            <th className="px-5 py-3.5 text-left text-xs font-bold tracking-widest text-zinc-500 uppercase">
                                                Message
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-zinc-150 divide-y">
                                        {access_requests.map((req) => (
                                            <tr key={req.id} className="transition-colors hover:bg-zinc-50/40">
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-1.5 font-bold text-zinc-900">
                                                        {req.investor_name}
                                                        {req.linkedin_url && (
                                                            <a
                                                                href={req.linkedin_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-[#3A54A5] hover:text-[#2D4182]"
                                                            >
                                                                <ExternalLink className="size-3" />
                                                            </a>
                                                        )}
                                                    </div>
                                                    <div className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500">
                                                        <Mail className="size-3 text-zinc-400" />
                                                        <a href={`mailto:${req.investor_email}`} className="hover:underline">
                                                            {req.investor_email}
                                                        </a>
                                                    </div>
                                                </td>
                                                <td className="text-zinc-650 px-5 py-4 font-semibold">{req.firm_name ?? '—'}</td>
                                                <td className="px-5 py-4">
                                                    <StatusBadge status={req.status} />
                                                </td>
                                                <td className="text-zinc-550 px-5 py-4 font-medium">{fmtDateTime(req.created_at)}</td>
                                                <td className="max-w-xs truncate px-5 py-4 font-medium text-zinc-600">
                                                    {req.message ? (
                                                        <span title={req.message} className="text-zinc-500 italic">
                                                            "{req.message}"
                                                        </span>
                                                    ) : (
                                                        <span className="font-normal text-zinc-400 italic">No message provided</span>
                                                    )}
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
