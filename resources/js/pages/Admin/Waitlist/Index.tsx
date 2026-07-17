import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowUpDown,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Clock,
    Download,
    Mail,
    RefreshCw,
    Search,
    Trash2,
    TrendingUp,
    User,
    Users,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface WaitlistEntry {
    id: number;
    type: 'founder' | 'investor';
    name: string;
    email: string;
    company_name: string | null;
    firm_name: string | null;
    stage: string | null;
    role: string | null;
    email_sent_at: string | null;
    converted_at: string | null;
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
    founder: number;
    investor: number;
    email_sent: number;
    converted: number;
}

interface PageProps {
    entries: Paginated<WaitlistEntry>;
    activeType: 'all' | 'founder' | 'investor';
    search: string;
    sort: string;
    dir: 'asc' | 'desc';
    totals: Totals;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(dateStr: string | null): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Ensure safe conversion value percentage
function pct(value: number, total: number): string {
    if (total === 0) return '0%';
    return Math.round((value / total) * 100) + '%';
}

function humanize(str: string | null): string {
    if (!str) return '—';
    return str.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildParams(overrides: Record<string, string | undefined>, current: Partial<PageProps>) {
    const p: Record<string, string> = {};
    const type = overrides.type !== undefined ? overrides.type : current.activeType !== 'all' ? current.activeType : undefined;
    const srch = overrides.search !== undefined ? overrides.search : current.search;
    const srt = overrides.sort !== undefined ? overrides.sort : current.sort;
    const dir = overrides.dir !== undefined ? overrides.dir : current.dir;
    if (type) p.type = type;
    if (srch) p.search = srch;
    if (srt && srt !== 'created_at') p.sort = srt;
    if (dir && dir !== 'desc') p.dir = dir;
    return p;
}

// ─── Flash banner ─────────────────────────────────────────────────────────────

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
                'mb-4 flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm font-semibold',
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

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon: Icon }: { label: string; value: number; sub?: string; icon: React.ElementType }) {
    return (
        <div className="flex items-center gap-3.5 rounded-xl border border-white/80 bg-white/30 px-4 py-4 shadow-[0_8px_30px_rgba(0,0,0,0.025)] backdrop-blur-md">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
                <Icon className="text-zinc-550 h-4 w-4" />
            </div>
            <div className="min-w-0">
                <p className="truncate text-[11px] font-bold tracking-widest text-zinc-500 uppercase">{label}</p>
                <div className="mt-0.5 flex items-baseline gap-1.5">
                    <span className="text-xl font-extrabold text-zinc-950 tabular-nums">{value.toLocaleString()}</span>
                    {sub && <span className="text-zinc-550 text-xs font-bold">{sub}</span>}
                </div>
            </div>
        </div>
    );
}

// ─── Type badge ───────────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: 'founder' | 'investor' }) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-bold tracking-wider uppercase',
                type === 'founder' ? 'border-emerald-250/85 bg-emerald-50 text-emerald-700' : 'border-[#3A54A5]/25 bg-[#3A54A5]/10 text-[#3A54A5]',
            )}
        >
            {type}
        </span>
    );
}

// ─── Status pill ──────────────────────────────────────────────────────────────

function StatusPill({ value, label }: { value: boolean; label: string }) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold shadow-xs',
                value ? 'border-emerald-250 bg-emerald-50 text-emerald-700' : 'border-zinc-200/80 bg-zinc-100 text-zinc-500',
            )}
        >
            {value ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
            {label}
        </span>
    );
}

// ─── Sort header ──────────────────────────────────────────────────────────────

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
    dir: string;
    onClick: (col: string) => void;
    className?: string;
}) {
    const active = sort === column;
    return (
        <th className={cn('px-4 py-3', className)}>
            <button
                onClick={() => onClick(column)}
                className="flex items-center gap-1 text-left text-[11px] font-bold tracking-wider uppercase transition-colors hover:text-zinc-950"
                style={{ color: active ? '#09090b' : '#71717a' }}
            >
                {label}
                {active ? (
                    dir === 'asc' ? (
                        <ChevronUp className="h-3 w-3" />
                    ) : (
                        <ChevronDown className="h-3 w-3" />
                    )
                ) : (
                    <ArrowUpDown className="h-3 w-3 opacity-30" />
                )}
            </button>
        </th>
    );
}

// ─── Filter tabs ──────────────────────────────────────────────────────────────

function FilterTabs({ activeType, totals, currentProps }: { activeType: PageProps['activeType']; totals: Totals; currentProps: Partial<PageProps> }) {
    const tabs: { key: PageProps['activeType']; label: string; count: number }[] = [
        { key: 'all', label: 'All', count: totals.all },
        { key: 'founder', label: 'Founders', count: totals.founder },
        { key: 'investor', label: 'Investors', count: totals.investor },
    ];

    return (
        <div className="flex gap-1 rounded-xl border border-zinc-200/80 bg-zinc-100/80 p-1 shadow-xs">
            {tabs.map(({ key, label, count }) => (
                <button
                    key={key}
                    onClick={() =>
                        router.get(route('admin.waitlist.index'), buildParams({ type: key === 'all' ? '' : key }, currentProps), {
                            preserveScroll: true,
                        })
                    }
                    className={cn(
                        'flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors duration-150',
                        activeType === key ? 'bg-white font-bold text-zinc-950 shadow-sm' : 'text-zinc-550 hover:text-zinc-950',
                    )}
                >
                    {label}
                    <span
                        className={cn(
                            'rounded-full px-1.5 py-px text-[10px] font-extrabold tabular-nums',
                            activeType === key ? 'bg-[#3A54A5]/10 text-[#3A54A5]' : 'bg-zinc-200 text-zinc-500',
                        )}
                    >
                        {count}
                    </span>
                </button>
            ))}
        </div>
    );
}

// ─── Search input ─────────────────────────────────────────────────────────────

function SearchInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return (
        <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Search name, email, company…"
                className="h-9 w-full rounded-xl border border-zinc-200 bg-white pr-8 pl-8 text-sm text-zinc-950 shadow-xs placeholder:text-zinc-400 focus:border-[#3A54A5]/60 focus:ring-2 focus:ring-[#3A54A5]/10 focus:outline-none"
            />
            {value && (
                <button onClick={() => onChange('')} className="hover:text-zinc-650 absolute top-1/2 right-2.5 -translate-y-1/2 text-zinc-400">
                    <X className="h-3.5 w-3.5" />
                </button>
            )}
        </div>
    );
}

// ─── Row actions ──────────────────────────────────────────────────────────────

function RowActions({ entry }: { entry: WaitlistEntry }) {
    const [resending, setResending] = useState(false);

    function handleConvert() {
        router.patch(route('admin.waitlist.convert', entry.id), {}, { preserveScroll: true });
    }

    function handleResend() {
        setResending(true);
        router.post(
            route('admin.waitlist.resend', entry.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => setResending(false),
            },
        );
    }

    function handleDelete() {
        router.delete(route('admin.waitlist.destroy', entry.id), {
            preserveScroll: true,
            onBefore: () => confirm(`Remove ${entry.name} from the waitlist? This cannot be undone.`),
        });
    }

    return (
        <div className="flex items-center gap-1">
            {/* Mark converted */}
            <button
                onClick={handleConvert}
                title={entry.converted_at ? 'Unmark converted' : 'Mark as converted'}
                className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-md border border-transparent transition-colors',
                    entry.converted_at
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        : 'text-zinc-450 hover:bg-zinc-105 hover:text-zinc-800',
                )}
            >
                <CheckCircle2 className="h-3.5 w-3.5" />
            </button>

            {/* Resend email */}
            <button
                onClick={handleResend}
                disabled={resending}
                title="Resend waitlist email"
                className="text-zinc-450 hover:bg-zinc-105 flex h-7 w-7 items-center justify-center rounded-md border border-transparent transition-colors hover:text-zinc-800 disabled:opacity-40"
            >
                <RefreshCw className={cn('h-3.5 w-3.5', resending && 'animate-spin')} />
            </button>

            {/* Delete */}
            <button
                onClick={handleDelete}
                title="Delete entry"
                className="text-zinc-450 flex h-7 w-7 items-center justify-center rounded-md border border-transparent transition-colors hover:bg-rose-50 hover:text-rose-600"
            >
                <Trash2 className="h-3.5 w-3.5" />
            </button>
        </div>
    );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({ entries }: { entries: Paginated<WaitlistEntry> }) {
    if (entries.last_page <= 1) return null;

    const { current_page, total, per_page } = entries;
    const from = (current_page - 1) * per_page + 1;
    const to = Math.min(current_page * per_page, total);

    return (
        <div className="flex items-center justify-between border-t border-zinc-200 px-1 pt-4">
            <p className="text-xs text-zinc-500">
                Showing {from}–{to} of {total}
            </p>
            <div className="flex gap-1">
                {entries.links.map((link, i) => {
                    const isNav = i === 0 || i === entries.links.length - 1;
                    const isDisabled = link.url === null;
                    if (isDisabled && isNav) return null;
                    return link.url ? (
                        <Link
                            key={i}
                            href={link.url}
                            preserveScroll
                            className={cn(
                                'flex h-8 min-w-[2rem] items-center justify-center rounded-md px-2 text-xs font-semibold transition-colors',
                                link.active ? 'bg-[#3A54A5] font-bold text-white shadow-xs' : 'text-zinc-650 hover:bg-zinc-150 hover:text-zinc-950',
                            )}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ) : (
                        <span
                            key={i}
                            className="flex h-8 min-w-[2rem] items-center justify-center rounded-md px-2 text-xs font-semibold text-zinc-400"
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    );
                })}
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WaitlistIndex({ entries, activeType, search, sort, dir, totals }: PageProps) {
    const [searchValue, setSearchValue] = useState(search);
    const currentProps = { activeType, search, sort, dir };

    // Debounce search → URL
    useEffect(() => {
        const t = setTimeout(() => {
            if (searchValue === search) return;
            router.get(route('admin.waitlist.index'), buildParams({ search: searchValue || '' }, { activeType, search, sort, dir }), {
                preserveScroll: true,
                replace: true,
            });
        }, 380);
        return () => clearTimeout(t);
    }, [searchValue, search, activeType, sort, dir]);

    function handleSort(column: string) {
        const newDir = sort === column && dir === 'asc' ? 'desc' : 'asc';
        router.get(route('admin.waitlist.index'), buildParams({ sort: column, dir: newDir }, currentProps), { preserveScroll: true });
    }

    return (
        <AdminLayout>
            <Head title="Waitlist — Admin" />

            <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase">Admin</p>
                            <h1 className="mt-1 text-2xl font-extrabold text-zinc-950">Waitlist</h1>
                        </div>
                        <a
                            href={route('admin.waitlist.export')}
                            className="text-zinc-650 hover:border-zinc-350 hover:text-zinc-955 inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold shadow-xs transition-colors hover:bg-zinc-50"
                        >
                            <Download className="h-4 w-4" />
                            Export CSV
                        </a>
                    </div>

                    {/* Flash */}
                    <FlashBanner />

                    {/* Stats */}
                    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                        <StatCard label="Total" value={totals.all} icon={Users} />
                        <StatCard label="Founders" value={totals.founder} icon={User} />
                        <StatCard label="Investors" value={totals.investor} icon={User} />
                        <StatCard label="Emails Sent" value={totals.email_sent} sub={pct(totals.email_sent, totals.all)} icon={Mail} />
                        <StatCard label="Converted" value={totals.converted} sub={pct(totals.converted, totals.all)} icon={TrendingUp} />
                    </div>

                    {/* Toolbar */}
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                        <FilterTabs activeType={activeType} totals={totals} currentProps={currentProps} />
                        <div className="max-w-sm min-w-[220px] flex-1">
                            <SearchInput value={searchValue} onChange={setSearchValue} />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-hidden rounded-2xl border border-white/80 bg-white/30 shadow-[0_8px_30px_rgba(0,0,0,0.025)] backdrop-blur-md">
                        {entries.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
                                <Users className="mb-3 h-8 w-8 opacity-40" />
                                <p className="text-sm font-bold">{searchValue ? 'No results for that search.' : 'No entries yet.'}</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[820px] text-sm">
                                    <thead>
                                        <tr className="border-b border-zinc-200 bg-zinc-50/50">
                                            <SortTh column="name" label="Name" sort={sort} dir={dir} onClick={handleSort} className="w-[22%]" />
                                            <SortTh column="type" label="Type" sort={sort} dir={dir} onClick={handleSort} />
                                            <th className="px-4 py-3 text-left text-[11px] font-bold tracking-wider text-zinc-500 uppercase">
                                                Company / Firm
                                            </th>
                                            <th className="px-4 py-3 text-left text-[11px] font-bold tracking-wider text-zinc-500 uppercase">
                                                Stage / Role
                                            </th>
                                            <SortTh column="created_at" label="Signed Up" sort={sort} dir={dir} onClick={handleSort} />
                                            <SortTh column="email_sent_at" label="Email" sort={sort} dir={dir} onClick={handleSort} />
                                            <SortTh column="converted_at" label="Converted" sort={sort} dir={dir} onClick={handleSort} />
                                            <th className="px-4 py-3 text-right text-[11px] font-bold tracking-wider text-zinc-500 uppercase">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-200/80">
                                        {entries.data.map((entry) => (
                                            <tr key={entry.id} className="group transition-colors hover:bg-zinc-50/40">
                                                <td className="px-4 py-3.5">
                                                    <p className="font-semibold text-zinc-900">{entry.name}</p>
                                                    <p className="mt-0.5 text-xs text-zinc-500">{entry.email}</p>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <TypeBadge type={entry.type} />
                                                </td>
                                                <td className="text-zinc-650 px-4 py-3.5 font-medium">
                                                    {entry.company_name ?? entry.firm_name ?? '—'}
                                                </td>
                                                <td className="text-zinc-650 px-4 py-3.5 font-medium">{humanize(entry.stage ?? entry.role)}</td>
                                                <td className="text-zinc-450 px-4 py-3.5 font-semibold tabular-nums">{fmt(entry.created_at)}</td>
                                                <td className="px-4 py-3.5">
                                                    <StatusPill value={!!entry.email_sent_at} label={entry.email_sent_at ? 'Sent' : 'Pending'} />
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <StatusPill
                                                        value={!!entry.converted_at}
                                                        label={entry.converted_at ? fmt(entry.converted_at) : 'No'}
                                                    />
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <div className="flex justify-end">
                                                        <RowActions entry={entry} />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    <div className="mt-4">
                        <Pagination entries={entries} />
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
