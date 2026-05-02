import { cn } from '@/lib/utils';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
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
    const type = overrides.type   !== undefined ? overrides.type   : current.activeType !== 'all' ? current.activeType : undefined;
    const srch = overrides.search !== undefined ? overrides.search : current.search;
    const srt  = overrides.sort   !== undefined ? overrides.sort   : current.sort;
    const dir  = overrides.dir    !== undefined ? overrides.dir    : current.dir;
    if (type)                p.type   = type;
    if (srch)                p.search = srch;
    if (srt && srt !== 'created_at') p.sort = srt;
    if (dir && dir !== 'desc')       p.dir  = dir;
    return p;
}

// ─── Flash banner ─────────────────────────────────────────────────────────────

function FlashBanner() {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;
    const [visible, setVisible] = useState(false);
    const [msg, setMsg]         = useState<{ text: string; type: 'success' | 'error' } | null>(null);
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
        <div className={cn(
            'mb-4 flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm',
            msg.type === 'success'
                ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300'
                : 'border-rose-500/25 bg-rose-500/10 text-rose-300',
        )}>
            <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {msg.text}
            </div>
            <button onClick={() => setVisible(false)} className="text-current opacity-50 hover:opacity-100">
                <X className="h-3.5 w-3.5" />
            </button>
        </div>
    );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
    label, value, sub, icon: Icon,
}: { label: string; value: number; sub?: string; icon: React.ElementType }) {
    return (
        <div className="flex items-center gap-3.5 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
                <Icon className="h-4 w-4 text-zinc-400" />
            </div>
            <div className="min-w-0">
                <p className="truncate text-[11px] font-medium uppercase tracking-widest text-zinc-500">{label}</p>
                <div className="mt-0.5 flex items-baseline gap-1.5">
                    <span className="text-xl font-semibold tabular-nums text-white">{value.toLocaleString()}</span>
                    {sub && <span className="text-xs text-zinc-500">{sub}</span>}
                </div>
            </div>
        </div>
    );
}

// ─── Type badge ───────────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: 'founder' | 'investor' }) {
    return (
        <span className={cn(
            'inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider',
            type === 'founder'
                ? 'bg-[#5CA336]/15 text-[#8fd168] ring-1 ring-[#5CA336]/25'
                : 'bg-[#3C53A8]/15 text-[#8da4e8] ring-1 ring-[#3C53A8]/25',
        )}>
            {type}
        </span>
    );
}

// ─── Status pill ──────────────────────────────────────────────────────────────

function StatusPill({ value, label }: { value: boolean; label: string }) {
    return (
        <span className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium',
            value
                ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20'
                : 'bg-zinc-800 text-zinc-500 ring-1 ring-zinc-700',
        )}>
            {value ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
            {label}
        </span>
    );
}

// ─── Sort header ──────────────────────────────────────────────────────────────

function SortTh({
    column, label, sort, dir, onClick, className,
}: { column: string; label: string; sort: string; dir: string; onClick: (col: string) => void; className?: string }) {
    const active = sort === column;
    return (
        <th className={cn('px-4 py-3', className)}>
            <button
                onClick={() => onClick(column)}
                className="flex items-center gap-1 text-left text-[11px] font-semibold uppercase tracking-wider transition-colors hover:text-zinc-200"
                style={{ color: active ? '#e4e4e7' : '#71717a' }}
            >
                {label}
                {active
                    ? (dir === 'asc'
                        ? <ChevronUp className="h-3 w-3" />
                        : <ChevronDown className="h-3 w-3" />)
                    : <ArrowUpDown className="h-3 w-3 opacity-30" />
                }
            </button>
        </th>
    );
}

// ─── Filter tabs ──────────────────────────────────────────────────────────────

function FilterTabs({ activeType, totals, currentProps }: {
    activeType: PageProps['activeType'];
    totals: Totals;
    currentProps: Partial<PageProps>;
}) {
    const tabs: { key: PageProps['activeType']; label: string; count: number }[] = [
        { key: 'all',      label: 'All',       count: totals.all },
        { key: 'founder',  label: 'Founders',  count: totals.founder },
        { key: 'investor', label: 'Investors', count: totals.investor },
    ];

    return (
        <div className="flex gap-1 rounded-lg border border-zinc-800 bg-zinc-900 p-1">
            {tabs.map(({ key, label, count }) => (
                <button
                    key={key}
                    onClick={() => router.get(
                        route('admin.waitlist.index'),
                        buildParams({ type: key === 'all' ? '' : key }, currentProps),
                        { preserveScroll: true },
                    )}
                    className={cn(
                        'flex items-center gap-2 rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors duration-150',
                        activeType === key ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200',
                    )}
                >
                    {label}
                    <span className={cn(
                        'rounded-full px-1.5 py-px text-[10px] font-bold tabular-nums',
                        activeType === key ? 'bg-zinc-600 text-zinc-200' : 'bg-zinc-800 text-zinc-500',
                    )}>
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
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Search name, email, company…"
                className="h-9 w-full rounded-lg border border-zinc-800 bg-zinc-900 pl-8 pr-8 text-sm text-white placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none focus:ring-0"
            />
            {value && (
                <button onClick={() => onChange('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
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
        router.post(route('admin.waitlist.resend', entry.id), {}, {
            preserveScroll: true,
            onFinish: () => setResending(false),
        });
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
                    'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
                    entry.converted_at
                        ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
                        : 'text-zinc-600 hover:bg-zinc-800 hover:text-zinc-300',
                )}
            >
                <CheckCircle2 className="h-3.5 w-3.5" />
            </button>

            {/* Resend email */}
            <button
                onClick={handleResend}
                disabled={resending}
                title="Resend waitlist email"
                className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-600 transition-colors hover:bg-zinc-800 hover:text-zinc-300 disabled:opacity-40"
            >
                <RefreshCw className={cn('h-3.5 w-3.5', resending && 'animate-spin')} />
            </button>

            {/* Delete */}
            <button
                onClick={handleDelete}
                title="Delete entry"
                className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-600 transition-colors hover:bg-rose-500/15 hover:text-rose-400"
            >
                <Trash2 className="h-3.5 w-3.5" />
            </button>
        </div>
    );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({ entries }: { entries: Paginated<WaitlistEntry> }) {
    if (entries.last_page <= 1) return null;

    const { current_page, last_page, total, per_page } = entries;
    const from = (current_page - 1) * per_page + 1;
    const to   = Math.min(current_page * per_page, total);

    return (
        <div className="flex items-center justify-between border-t border-zinc-800 px-1 pt-4">
            <p className="text-xs text-zinc-500">Showing {from}–{to} of {total}</p>
            <div className="flex gap-1">
                {entries.links.map((link, i) => {
                    const isNav     = i === 0 || i === entries.links.length - 1;
                    const isDisabled = link.url === null;
                    if (isDisabled && isNav) return null;
                    return link.url ? (
                        <Link
                            key={i}
                            href={link.url}
                            preserveScroll
                            className={cn(
                                'flex h-8 min-w-[2rem] items-center justify-center rounded-md px-2 text-xs font-medium transition-colors',
                                link.active ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200',
                            )}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ) : (
                        <span
                            key={i}
                            className="flex h-8 min-w-[2rem] items-center justify-center rounded-md px-2 text-xs font-medium text-zinc-600"
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
            router.get(
                route('admin.waitlist.index'),
                buildParams({ search: searchValue || '' }, currentProps),
                { preserveScroll: true, replace: true },
            );
        }, 380);
        return () => clearTimeout(t);
    }, [searchValue]);

    function handleSort(column: string) {
        const newDir = sort === column && dir === 'asc' ? 'desc' : 'asc';
        router.get(
            route('admin.waitlist.index'),
            buildParams({ sort: column, dir: newDir }, currentProps),
            { preserveScroll: true },
        );
    }

    return (
        <AdminLayout>
            <Head title="Waitlist — Admin" />

            <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                <div className="mx-auto max-w-7xl">

                    {/* Header */}
                    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">Admin</p>
                            <h1 className="mt-1 text-2xl font-semibold text-white">Waitlist</h1>
                        </div>
                        <a
                            href={route('admin.waitlist.export')}
                            className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:border-zinc-600 hover:bg-zinc-700 hover:text-white"
                        >
                            <Download className="h-4 w-4" />
                            Export CSV
                        </a>
                    </div>

                    {/* Flash */}
                    <FlashBanner />

                    {/* Stats */}
                    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                        <StatCard label="Total"       value={totals.all}        icon={Users} />
                        <StatCard label="Founders"    value={totals.founder}    icon={User} />
                        <StatCard label="Investors"   value={totals.investor}   icon={User} />
                        <StatCard label="Emails Sent" value={totals.email_sent} sub={pct(totals.email_sent, totals.all)} icon={Mail} />
                        <StatCard label="Converted"   value={totals.converted}  sub={pct(totals.converted, totals.all)}  icon={TrendingUp} />
                    </div>

                    {/* Toolbar */}
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                        <FilterTabs activeType={activeType} totals={totals} currentProps={currentProps} />
                        <div className="flex-1 min-w-[220px] max-w-sm">
                            <SearchInput value={searchValue} onChange={setSearchValue} />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
                        {entries.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
                                <Users className="mb-3 h-8 w-8 opacity-40" />
                                <p className="text-sm">{searchValue ? 'No results for that search.' : 'No entries yet.'}</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[820px] text-sm">
                                    <thead>
                                        <tr className="border-b border-zinc-800">
                                            <SortTh column="name"         label="Name"           sort={sort} dir={dir} onClick={handleSort} className="w-[22%]" />
                                            <SortTh column="type"         label="Type"           sort={sort} dir={dir} onClick={handleSort} />
                                            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                                                Company / Firm
                                            </th>
                                            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                                                Stage / Role
                                            </th>
                                            <SortTh column="created_at"   label="Signed Up"      sort={sort} dir={dir} onClick={handleSort} />
                                            <SortTh column="email_sent_at" label="Email"          sort={sort} dir={dir} onClick={handleSort} />
                                            <SortTh column="converted_at" label="Converted"       sort={sort} dir={dir} onClick={handleSort} />
                                            <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-800/60">
                                        {entries.data.map((entry) => (
                                            <tr key={entry.id} className="group transition-colors hover:bg-zinc-800/40">
                                                <td className="px-4 py-3.5">
                                                    <p className="font-medium text-white">{entry.name}</p>
                                                    <p className="mt-0.5 text-xs text-zinc-500">{entry.email}</p>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <TypeBadge type={entry.type} />
                                                </td>
                                                <td className="px-4 py-3.5 text-zinc-300">
                                                    {entry.company_name ?? entry.firm_name ?? '—'}
                                                </td>
                                                <td className="px-4 py-3.5 text-zinc-300">
                                                    {humanize(entry.stage ?? entry.role)}
                                                </td>
                                                <td className="px-4 py-3.5 text-zinc-400 tabular-nums">
                                                    {fmt(entry.created_at)}
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <StatusPill value={!!entry.email_sent_at} label={entry.email_sent_at ? 'Sent' : 'Pending'} />
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <StatusPill value={!!entry.converted_at} label={entry.converted_at ? fmt(entry.converted_at) : 'No'} />
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
