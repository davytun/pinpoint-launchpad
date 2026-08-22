import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { FolderLock, ShieldAlert } from 'lucide-react';

type Grant = {
    id: number;
    granted_at: string;
    revoked_at: string | null;
    investor: {
        profile: {
            full_name: string;
        } | null;
    } | null;
    profile: {
        founder: {
            company_name: string;
        } | null;
    } | null;
};

type PaginatedData<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
};

type AuditEvent = {
    id: number;
    event: string;
    created_at: string | null;
    actor: string;
    profile_id: number | null;
};

function eventLabel(event: string) {
    return event.replaceAll('.', ' ').replaceAll('_', ' ');
}

export default function AdminDataRooms({ grants, audit_events: auditEvents }: { grants: PaginatedData<Grant>; audit_events: AuditEvent[] }) {
    function revokeGrant(id: number) {
        if (confirm('Are you sure you want to revoke this investor\'s access to the data room?')) {
            router.patch(route('admin.dealflow.data-rooms.revoke', id), {}, {
                preserveScroll: true
            });
        }
    }

    return (
        <AdminLayout>
            <Head title="Data Rooms | Dealflow" />
            <div className="px-6 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-black tracking-tight text-zinc-950">Active Data Rooms</h1>
                    <p className="mt-1 text-sm text-zinc-500">Monitor and manage investor access to startup data rooms.</p>
                </div>

                <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs">
                    <table className="w-full text-left text-sm text-zinc-600">
                        <thead className="bg-zinc-50 text-xs font-bold text-zinc-500 uppercase">
                            <tr>
                                <th className="px-6 py-4">Investor</th>
                                <th className="px-6 py-4">Startup</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Granted At</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {grants.data.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                                        No data room grants found.
                                    </td>
                                </tr>
                            ) : (
                                grants.data.map((grant) => {
                                    const isActive = grant.revoked_at === null;
                                    return (
                                        <tr key={grant.id} className={`transition-colors hover:bg-zinc-50/50 ${!isActive ? 'opacity-50' : ''}`}>
                                            <td className="px-6 py-4 font-semibold text-zinc-900">
                                                {grant.investor?.profile?.full_name ?? 'Anonymous'}
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-zinc-900">
                                                {grant.profile?.founder?.company_name ?? 'Unknown Startup'}
                                            </td>
                                            <td className="px-6 py-4">
                                                {isActive ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                                                        <FolderLock className="size-3.5" /> Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-bold text-zinc-800">
                                                        <ShieldAlert className="size-3.5" /> Revoked
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-xs font-medium text-zinc-500">
                                                {new Date(grant.granted_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {isActive && (
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                        onClick={() => revokeGrant(grant.id)}
                                                    >
                                                        Revoke Access
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <section className="mt-8" aria-labelledby="access-log-heading">
                    <div className="mb-4">
                        <p className="text-xs font-bold tracking-[0.14em] text-[#3A54A5] uppercase">Audit trail</p>
                        <h2 id="access-log-heading" className="mt-1 text-xl font-black tracking-tight text-zinc-950">Recent access activity</h2>
                        <p className="mt-1 text-sm text-zinc-500">Interest submissions, founder decisions, grants, revocations, and document downloads.</p>
                    </div>
                    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs">
                        <table className="w-full text-left text-sm text-zinc-600">
                            <thead className="bg-zinc-50 text-xs font-bold text-zinc-500 uppercase">
                                <tr><th className="px-6 py-4">Activity</th><th className="px-6 py-4">Actor</th><th className="px-6 py-4">Startup profile</th><th className="px-6 py-4">When</th></tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {auditEvents.length === 0 ? <tr><td colSpan={4} className="px-6 py-12 text-center text-zinc-500">No access activity has been recorded yet.</td></tr> : auditEvents.map((event) => (
                                    <tr key={event.id} className="transition-colors hover:bg-zinc-50/50">
                                        <td className="px-6 py-4 font-semibold capitalize text-zinc-900">{eventLabel(event.event)}</td>
                                        <td className="px-6 py-4">{event.actor}</td>
                                        <td className="px-6 py-4 text-xs font-medium text-zinc-500">{event.profile_id ? `#${event.profile_id}` : '—'}</td>
                                        <td className="px-6 py-4 text-xs font-medium text-zinc-500">{event.created_at ? new Date(event.created_at).toLocaleString() : '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </AdminLayout>
    );
}
