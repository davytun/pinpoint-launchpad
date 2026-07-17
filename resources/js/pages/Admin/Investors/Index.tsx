import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowUpDown,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Clock,
    Search,
    User,
    Users,
    X,
    Filter,
    ArrowRight
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface InvestorApplication {
    id: number;
    investor_type: 'angel' | 'vc' | 'family_office' | 'syndicate' | 'dfi' | 'corporate';
    name: string;
    email: string;
    organisation: string | null;
    role: string | null;
    country: string;
    status: 'pending' | 'approved' | 'rejected' | 'request_more_info';
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: PaginationLink[];
}

interface Totals {
    all: number;
    pending: number;
    approved: number;
    rejected: number;
    request_more_info: number;
}

interface PageProps {
    applications: Paginated<InvestorApplication>;
    activeStatus: 'all' | 'pending' | 'approved' | 'rejected' | 'request_more_info';
    activeType: string;
    search: string;
    sort: string;
    dir: 'asc' | 'desc';
    totals: Totals;
}

function fmt(dateStr: string | null): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function buildParams(overrides: Record<string, string | undefined>, current: Partial<PageProps>) {
    const p: Record<string, string> = {};
    const status = overrides.status !== undefined ? overrides.status : current.activeStatus !== 'all' ? current.activeStatus : undefined;
    const type = overrides.type !== undefined ? overrides.type : current.activeType !== 'all' ? current.activeType : undefined;
    const srch = overrides.search !== undefined ? overrides.search : current.search;
    const srt = overrides.sort !== undefined ? overrides.sort : current.sort;
    const dir = overrides.dir !== undefined ? overrides.dir : current.dir;
    if (status) p.status = status;
    if (type) p.type = type;
    if (srch) p.search = srch;
    if (srt && srt !== 'created_at') p.sort = srt;
    if (dir && dir !== 'desc') p.dir = dir;
    return p;
}

function FlashBanner() {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;
    const [visible, setVisible] = useState(false);
    const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    useEffect(() => {
        const text = flash?.success || flash?.error;
        const type = flash?.success ? 'success' : 'error';
        if (!text) return;
        clearTimeout(timerRef.current);
        setMsg({ text, type });
        setVisible(true);
        timerRef.current = setTimeout(() => setVisible(false), 4000);
    }, [flash]);

    if (!msg || !visible) return null;

    return (
        <div
            className={cn(
                'mb-6 flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition-all duration-300',
                msg.type === 'success' ? 'border-emerald-500/25 bg-emerald-50 text-emerald-700' : 'border-rose-500/25 bg-rose-50 text-rose-700',
            )}
        >
            <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {msg.text}
            </div>
            <button onClick={() => setVisible(false)} className="text-current opacity-55 hover:opacity-100">
                <X className="h-3.5 w-3.5" />
            </button>
        </div>
    );
}

function StatCard({ label, value, sub, icon: Icon }: { label: string; value: number; sub?: string; icon: React.ElementType }) {
    return (
        <div className="flex items-center gap-3.5 rounded-xl border border-white/80 bg-white/30 px-4 py-4 shadow-[0_8px_30px_rgba(0,0,0,0.025)] backdrop-blur-md">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
                <Icon className="text-zinc-550 h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate text-[10px] font-bold tracking-widest text-zinc-400 uppercase">{label}</p>
                <div className="mt-0.5 flex items-baseline gap-1.5">
                    <span className="text-xl font-extrabold text-zinc-950 tabular-nums">{value.toLocaleString()}</span>
                    {sub && <span className="text-zinc-550 text-xs font-bold">{sub}</span>}
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: InvestorApplication['status'] }) {
    const config: Record<InvestorApplication['status'], { label: string; className: string }> = {
        pending: { label: 'Pending', className: 'border-amber-250 bg-amber-50 text-amber-700' },
        approved: { label: 'Approved', className: 'border-emerald-250 bg-emerald-50 text-emerald-700' },
        rejected: { label: 'Rejected', className: 'border-rose-250 bg-rose-50 text-rose-700' },
        request_more_info: { label: 'Needs Info', className: 'border-blue-250 bg-blue-50 text-blue-700' },
    };
    const c = config[status] || config.pending;
    return (
        <span className={cn('inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase', c.className)}>
            {c.label}
        </span>
    );
}

function SortTh({
    column,
    label,
    sort,
    dir,
    onClick,
    className,
}: {
    column: string;
    label: string;
    sort: string;
    dir: 'asc' | 'desc';
    onClick: (col: string) => void;
    className?: string;
}) {
    const active = sort === column;
    return (
        <th className={cn('px-6 py-3.5 text-left text-[11px] font-bold tracking-wider text-zinc-400 uppercase cursor-pointer select-none group hover:text-zinc-950', className)} onClick={() => onClick(column)}>
            <div className="flex items-center gap-1.5">
                {label}
                <span className={cn('transition-opacity duration-150', active ? 'opacity-100' : 'opacity-0 group-hover:opacity-60')}>
                    {active ? (
                        dir === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
                    ) : (
                        <ArrowUpDown className="h-3.5 w-3.5" />
                    )}
                </span>
            </div>
        </th>
    );
}

export default function Index({ applications, activeStatus, activeType, search: initialSearch, sort, dir, totals }: PageProps) {
    const [search, setSearch] = useState(initialSearch);
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const applyFilters = (overrides: Record<string, string | undefined>) => {
        const query = buildParams(overrides, { activeStatus, activeType, search, sort, dir });
        router.get('/admin/investors', query, { replace: true, preserveState: true });
    };

    useEffect(() => {
        if (search === initialSearch) return;
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            applyFilters({ search });
        }, 350);
        return () => clearTimeout(searchTimeout.current);
    }, [search]);

    const handleSort = (col: string) => {
        const nextDir = sort === col && dir === 'desc' ? 'asc' : 'desc';
        applyFilters({ sort: col, dir: nextDir });
    };

    const handleClearFilters = () => {
        setSearch('');
        router.get('/admin/investors', {}, { replace: true });
    };

    const isFiltered = activeStatus !== 'all' || activeType !== 'all' || search !== '';

    return (
        <AdminLayout>
            <Head title="Investor Applications — Pinpoint Command" />

            <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-5">
                    <div>
                        <h1 className="font-display text-2xl font-black tracking-tight text-zinc-950">Investors</h1>
                        <p className="mt-1 text-sm text-zinc-500">Manage PIN membership applications and admission review</p>
                    </div>
                </div>

                <FlashBanner />

                {/* Stat Band */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard label="Total Applications" value={totals.all} icon={Users} />
                    <StatCard label="Pending Review" value={totals.pending} icon={Clock} />
                    <StatCard label="Admitted Members" value={totals.approved} icon={CheckCircle2} />
                    <StatCard label="Needs More Info" value={totals.request_more_info} icon={User} />
                </div>

                {/* Filter and Search controls */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-zinc-50/50 p-4 border border-zinc-200 rounded-2xl">
                    <div className="flex flex-1 flex-wrap items-center gap-3">
                        {/* Search Input */}
                        <div className="relative w-full max-w-xs">
                            <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by name, email, organisation..."
                                className="w-full h-9 rounded-xl border border-zinc-200 bg-white pl-10 pr-4 text-xs outline-none focus:border-[#3A54A5] transition-colors"
                            />
                        </div>

                        {/* Status Filter */}
                        <select
                            value={activeStatus}
                            onChange={(e) => applyFilters({ status: e.target.value })}
                            className="h-9 rounded-xl border border-zinc-200 bg-white px-3 text-xs outline-none focus:border-[#3A54A5]"
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="request_more_info">Needs Info</option>
                        </select>

                        {/* Type Filter */}
                        <select
                            value={activeType}
                            onChange={(e) => applyFilters({ type: e.target.value })}
                            className="h-9 rounded-xl border border-zinc-200 bg-white px-3 text-xs outline-none focus:border-[#3A54A5]"
                        >
                            <option value="all">All Investor Types</option>
                            <option value="angel">Angel Investor</option>
                            <option value="vc">Venture Fund</option>
                            <option value="family_office">Family Office</option>
                            <option value="syndicate">Syndicate</option>
                            <option value="dfi">DFI / Impact</option>
                            <option value="corporate">Corporate / CVC</option>
                        </select>

                        {isFiltered && (
                            <button
                                onClick={handleClearFilters}
                                className="h-9 px-3 text-xs font-semibold text-[#3A54A5] hover:text-[#2D4182] flex items-center gap-1.5"
                            >
                                <X className="h-3.5 w-3.5" />
                                Clear Filters
                            </button>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden border border-zinc-200 bg-white rounded-2xl shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-zinc-200 bg-zinc-50/50">
                                    <SortTh column="name" label="Name" sort={sort} dir={dir} onClick={handleSort} />
                                    <SortTh column="investor_type" label="Type" sort={sort} dir={dir} onClick={handleSort} />
                                    <th className="px-6 py-3.5 text-left text-[11px] font-bold tracking-wider text-zinc-400 uppercase">Organisation / Role</th>
                                    <th className="px-6 py-3.5 text-left text-[11px] font-bold tracking-wider text-zinc-400 uppercase">Country</th>
                                    <SortTh column="created_at" label="Applied" sort={sort} dir={dir} onClick={handleSort} />
                                    <SortTh column="status" label="Status" sort={sort} dir={dir} onClick={handleSort} />
                                    <th className="relative px-6 py-3.5" />
                                </tr>
                            </thead>
                            <tbody>
                                {applications.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-sm text-zinc-400">
                                            No investor applications found.
                                        </td>
                                    </tr>
                                ) : (
                                    applications.data.map((app) => (
                                        <tr key={app.id} className="border-b border-zinc-150 hover:bg-zinc-50/40 last:border-0">
                                            <td className="px-6 py-4.5">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-zinc-950">{app.name}</p>
                                                    <p className="mt-0.5 text-xs text-zinc-500 font-mono">{app.email}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4.5">
                                                <span className="text-xs font-mono capitalize">
                                                    {app.investor_type.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4.5">
                                                {app.organisation ? (
                                                    <div>
                                                        <p className="text-xs font-bold text-zinc-800">{app.organisation}</p>
                                                        <p className="mt-0.5 text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">{app.role || '—'}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-zinc-450 italic">Independent</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4.5">
                                                <span className="text-xs text-zinc-700 font-semibold">{app.country}</span>
                                            </td>
                                            <td className="px-6 py-4.5">
                                                <span className="text-xs text-zinc-500 font-mono">{fmt(app.created_at)}</span>
                                            </td>
                                            <td className="px-6 py-4.5">
                                                <StatusBadge status={app.status} />
                                            </td>
                                            <td className="px-6 py-4.5 text-right">
                                                <Link
                                                    href={`/admin/investors/${app.id}`}
                                                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#3A54A5]/25 bg-[#3A54A5]/10 px-3 text-xs font-bold text-[#3A54A5] transition-colors hover:bg-[#3A54A5] hover:text-white"
                                                >
                                                    Review
                                                    <ArrowRight className="h-3 w-3" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {applications.total > applications.per_page && (
                        <div className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50/50 px-6 py-4">
                            <p className="text-xs text-zinc-500">
                                Showing <span className="font-bold tabular-nums">{(applications.current_page - 1) * applications.per_page + 1}</span> to{' '}
                                <span className="font-bold tabular-nums">{Math.min(applications.current_page * applications.per_page, applications.total)}</span> of{' '}
                                <span className="font-bold tabular-nums">{applications.total}</span> entries
                            </p>
                            <div className="flex gap-1.5">
                                {applications.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        disabled={!link.url}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={cn(
                                            'inline-flex h-8 min-w-8 items-center justify-center rounded-lg border text-xs font-semibold px-2 transition-all',
                                            link.active
                                                ? 'border-[#3A54A5] bg-[#3A54A5] text-white shadow-xs'
                                                : link.url
                                                ? 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50'
                                                : 'border-zinc-150 bg-zinc-50 text-zinc-400 cursor-not-allowed opacity-50',
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
