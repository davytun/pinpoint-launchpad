import { Icon } from '@iconify/react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface WaitlistEntry {
    id: string;
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

function getInitials(name?: string | null): string {
    if (!name) return 'W';
    return name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase();
}

function formatDate(dateStr: string | null): string {
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

// ─── Flash Banner ─────────────────────────────────────────────────────────────

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
                'mx-6 mt-4 flex items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-xs font-semibold shadow-2xs',
                msg.type === 'success'
                    ? 'border-emerald-500/25 bg-emerald-50 text-emerald-800'
                    : 'border-rose-500/25 bg-rose-50 text-rose-800',
            )}
        >
            <div className="flex items-center gap-2">
                <Icon
                    icon={msg.type === 'success' ? 'solar:check-circle-linear' : 'solar:danger-circle-linear'}
                    className="size-4 shrink-0"
                />
                <span>{msg.text}</span>
            </div>
            <button onClick={() => setVisible(false)} className="text-current opacity-60 hover:opacity-100">
                <Icon icon="solar:close-circle-linear" className="size-3.5" />
            </button>
        </div>
    );
}

// ─── Sortable Column Header ───────────────────────────────────────────────────

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
        <th className={cn('px-5 py-3', className)}>
            <button
                onClick={() => onClick(column)}
                className="flex items-center gap-1.5 text-left text-[11px] font-bold tracking-wider text-zinc-400 uppercase transition-colors hover:text-zinc-950"
            >
                <span className={cn(active && 'text-zinc-950 font-extrabold')}>{label}</span>
                <Icon
                    icon={
                        active
                            ? dir === 'asc'
                                ? 'solar:arrow-up-linear'
                                : 'solar:arrow-down-linear'
                            : 'solar:sort-vertical-linear'
                    }
                    className={cn('size-3.5 transition-colors', active ? 'text-zinc-950' : 'text-zinc-300')}
                />
            </button>
        </th>
    );
}

// ─── Delete Confirmation Modal ────────────────────────────────────────────────

function DeleteModal({
    entry,
    isOpen,
    onClose,
}: {
    entry: WaitlistEntry | null;
    isOpen: boolean;
    onClose: () => void;
}) {
    const [isDeleting, setIsDeleting] = useState(false);

    if (!isOpen || !entry) return null;

    function handleConfirmDelete() {
        if (!entry) return;
        setIsDeleting(true);
        router.delete(route('admin.waitlist.destroy', entry.id), {
            preserveScroll: true,
            onFinish: () => {
                setIsDeleting(false);
                onClose();
            },
        });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-200"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-2xl border border-zinc-200/80 animate-in zoom-in-95 duration-200">
                <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 border border-rose-100 text-rose-600">
                        <Icon icon="solar:trash-bin-trash-linear" className="size-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                        <h3 className="text-[15px] font-bold text-zinc-950">Remove Waitlist Lead</h3>
                        <p className="mt-1 text-[13px] text-zinc-500 leading-relaxed font-normal">
                            Are you sure you want to remove <span className="font-semibold text-zinc-900">{entry.name}</span> ({entry.email}) from the waitlist? This action cannot be undone.
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-zinc-100 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isDeleting}
                        className="rounded-xl border border-zinc-200/80 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 shadow-2xs hover:bg-zinc-50 transition-colors"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleConfirmDelete}
                        disabled={isDeleting}
                        className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-rose-700 transition-colors disabled:opacity-50"
                    >
                        {isDeleting && <Icon icon="solar:restart-linear" className="size-3.5 animate-spin" />}
                        <span>Delete Lead</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Row Actions ──────────────────────────────────────────────────────────────

function RowActions({
    entry,
    onRequestDelete,
}: {
    entry: WaitlistEntry;
    onRequestDelete: (entry: WaitlistEntry) => void;
}) {
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

    return (
        <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
            {/* Convert Toggle */}
            <button
                onClick={handleConvert}
                title={entry.converted_at ? 'Remove conversion mark' : 'Mark as converted'}
                className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-lg border transition-all',
                    entry.converted_at
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'border-zinc-200/70 bg-white text-zinc-400 hover:bg-zinc-100 hover:text-zinc-800',
                )}
            >
                <Icon icon="solar:shield-check-linear" className="size-3.5" />
            </button>

            {/* Resend Email */}
            <button
                onClick={handleResend}
                disabled={resending}
                title="Resend welcome email"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200/70 bg-white text-zinc-400 hover:bg-zinc-100 hover:text-zinc-800 transition-all disabled:opacity-40"
            >
                <Icon icon="solar:restart-linear" className={cn('size-3.5', resending && 'animate-spin')} />
            </button>

            {/* Delete (Opens custom modal) */}
            <button
                onClick={() => onRequestDelete(entry)}
                title="Remove lead"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200/70 bg-white text-zinc-400 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 transition-all"
            >
                <Icon icon="solar:trash-bin-trash-linear" className="size-3.5" />
            </button>
        </div>
    );
}

// ─── Main Waitlist Workspace Page ─────────────────────────────────────────────

export default function WaitlistIndex({ entries, activeType, search, sort, dir, totals }: PageProps) {
    const [searchValue, setSearchValue] = useState(search);
    const [deletingEntry, setDeletingEntry] = useState<WaitlistEntry | null>(null);
    const currentProps = { activeType, search, sort, dir };

    // Debounce search input
    useEffect(() => {
        const t = setTimeout(() => {
            if (searchValue === search) return;
            router.get(
                route('admin.waitlist.index'),
                buildParams({ search: searchValue || '' }, { activeType, search, sort, dir }),
                {
                    preserveScroll: true,
                    replace: true,
                },
            );
        }, 350);
        return () => clearTimeout(t);
    }, [searchValue, search, activeType, sort, dir]);

    function handleSort(column: string) {
        const newDir = sort === column && dir === 'asc' ? 'desc' : 'asc';
        router.get(route('admin.waitlist.index'), buildParams({ sort: column, dir: newDir }, currentProps), {
            preserveScroll: true,
        });
    }

    return (
        <AdminLayout>
            <Head title="Waitlist — Admin" />

            {/* ── Outer Card Container (Mercury Spec) ────────────────────────── */}
            <div className="flex flex-1 min-w-0 h-full max-h-full flex-col bg-white rounded-2xl lg:rounded-[22px] border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
                {/* ── Top Header & Actions Bar ───────────────────────────────── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 border-b border-zinc-100 shrink-0 bg-white">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-[16.5px] font-bold tracking-tight text-zinc-950">Waitlist</h1>
                            <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-700 tabular-nums">
                                {totals.all} Total
                            </span>
                        </div>
                        <p className="text-[12px] text-zinc-500 mt-0.5 font-normal">
                            Manage platform pre-registrations, outreach delivery, and account conversions.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <a
                            href={route('admin.waitlist.export')}
                            className="flex items-center gap-2 rounded-xl border border-zinc-200/80 bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-800 shadow-2xs hover:bg-zinc-50 hover:border-zinc-300 transition-colors"
                        >
                            <Icon icon="solar:export-linear" className="size-3.5 text-zinc-500" />
                            <span>Export CSV</span>
                        </a>
                    </div>
                </div>

                {/* ── Inline Metric Ribbon (Mercury Style) ─────────────────────── */}
                <div className="grid grid-cols-2 sm:grid-cols-5 divide-x divide-zinc-100 border-b border-zinc-100 bg-[#FAFBFD] shrink-0">
                    <div className="px-6 py-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Total Leads</span>
                        <div className="mt-0.5 flex items-baseline gap-2">
                            <span className="text-[17px] font-bold text-zinc-950 tabular-nums">{totals.all}</span>
                        </div>
                    </div>

                    <div className="px-6 py-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Founders</span>
                        <div className="mt-0.5 flex items-baseline gap-2">
                            <span className="text-[17px] font-bold text-zinc-950 tabular-nums">{totals.founder}</span>
                            <span className="text-[11px] font-medium text-zinc-400">
                                {pct(totals.founder, totals.all)}
                            </span>
                        </div>
                    </div>

                    <div className="px-6 py-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Investors</span>
                        <div className="mt-0.5 flex items-baseline gap-2">
                            <span className="text-[17px] font-bold text-zinc-950 tabular-nums">{totals.investor}</span>
                            <span className="text-[11px] font-medium text-zinc-400">
                                {pct(totals.investor, totals.all)}
                            </span>
                        </div>
                    </div>

                    <div className="px-6 py-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Emails Sent</span>
                        <div className="mt-0.5 flex items-baseline gap-2">
                            <span className="text-[17px] font-bold text-zinc-950 tabular-nums">{totals.email_sent}</span>
                            <span className="text-[11px] font-semibold text-emerald-600">
                                {pct(totals.email_sent, totals.all)}
                            </span>
                        </div>
                    </div>

                    <div className="px-6 py-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Converted</span>
                        <div className="mt-0.5 flex items-baseline gap-2">
                            <span className="text-[17px] font-bold text-zinc-950 tabular-nums">{totals.converted}</span>
                            <span className="text-[11px] font-semibold text-emerald-600">
                                {pct(totals.converted, totals.all)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Flash Notification ──────────────────────────────────────── */}
                <FlashBanner />

                {/* ── Toolbar: Segmented Views & Integrated Search ─────────────── */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-3 border-b border-zinc-100 shrink-0 bg-white">
                    {/* Filter Segmented Control */}
                    <div className="flex items-center gap-1 rounded-xl bg-[#F4F4F6] p-1 border border-zinc-200/60">
                        {(
                            [
                                { key: 'all', label: 'All', count: totals.all },
                                { key: 'founder', label: 'Founders', count: totals.founder },
                                { key: 'investor', label: 'Investors', count: totals.investor },
                            ] as const
                        ).map(({ key, label, count }) => {
                            const isSelected = activeType === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() =>
                                        router.get(
                                            route('admin.waitlist.index'),
                                            buildParams({ type: key === 'all' ? '' : key }, currentProps),
                                            { preserveScroll: true },
                                        )
                                    }
                                    className={cn(
                                        'flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition-all duration-150',
                                        isSelected
                                            ? 'bg-white text-zinc-950 shadow-2xs font-bold'
                                            : 'text-zinc-500 hover:text-zinc-900',
                                    )}
                                >
                                    <span>{label}</span>
                                    <span
                                        className={cn(
                                            'rounded-full px-1.5 py-0.2 text-[10px] font-bold tabular-nums',
                                            isSelected ? 'bg-zinc-100 text-zinc-800' : 'bg-zinc-200/70 text-zinc-500',
                                        )}
                                    >
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full sm:w-76">
                        <Icon
                            icon="solar:minimalistic-magnifer-linear"
                            className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none"
                        />
                        <input
                            type="text"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            placeholder="Search name, email, company..."
                            className="w-full rounded-xl border border-zinc-200/90 bg-[#F9F9FB] py-1.5 pr-8 pl-9 text-[13px] text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none transition-colors"
                        />
                        {searchValue && (
                            <button
                                onClick={() => setSearchValue('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                            >
                                <Icon icon="solar:close-circle-linear" className="size-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Table Container (Independently Scrollable) ──────────────── */}
                <div className="flex-1 min-h-0 overflow-auto">
                    {entries.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 mb-3">
                                <Icon icon="solar:users-group-two-rounded-linear" className="size-6" />
                            </div>
                            <h3 className="text-sm font-bold text-zinc-900">No waitlist entries found</h3>
                            <p className="text-xs text-zinc-500 mt-1 max-w-sm">
                                {searchValue
                                    ? `No entries match "${searchValue}". Try clearing your search.`
                                    : 'When new founders or investors join the waitlist, they will appear here.'}
                            </p>
                        </div>
                    ) : (
                        <table className="w-full text-left text-xs border-collapse">
                            <thead className="sticky top-0 z-10 bg-zinc-50/95 backdrop-blur-xs border-b border-zinc-200/80">
                                <tr>
                                    <SortTh column="name" label="Lead / Contact" sort={sort} dir={dir} onClick={handleSort} className="w-[26%]" />
                                    <SortTh column="type" label="Type" sort={sort} dir={dir} onClick={handleSort} className="w-[12%]" />
                                    <th className="px-5 py-3 text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
                                        Organization
                                    </th>
                                    <SortTh column="created_at" label="Signed Up" sort={sort} dir={dir} onClick={handleSort} />
                                    <SortTh column="email_sent_at" label="Email" sort={sort} dir={dir} onClick={handleSort} />
                                    <SortTh column="converted_at" label="Status" sort={sort} dir={dir} onClick={handleSort} />
                                    <th className="px-5 py-3 text-right text-[11px] font-bold tracking-wider text-zinc-400 uppercase w-25">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 bg-white">
                                {entries.data.map((entry) => {
                                    const isConverted = !!entry.converted_at;
                                    const emailSent = !!entry.email_sent_at;

                                    return (
                                        <tr
                                            key={entry.id}
                                            className="group hover:bg-[#F9F9FB] transition-colors duration-150"
                                        >
                                            {/* Lead / Contact (Soft Avatar + Name + Subtitle) */}
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-full bg-zinc-100 border border-zinc-200/80 text-[10.5px] font-bold text-zinc-700">
                                                        {getInitials(entry.name)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="truncate text-[13px] font-semibold text-zinc-950">
                                                            {entry.name}
                                                        </p>
                                                        <p className="truncate text-[11.5px] text-zinc-400 font-normal">
                                                            {entry.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Minimalist Type Badge */}
                                            <td className="px-5 py-3.5">
                                                <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700 capitalize">
                                                    {entry.type}
                                                </span>
                                            </td>

                                            {/* Organization & Subtitle Role */}
                                            <td className="px-5 py-3.5">
                                                <p className="font-medium text-[13px] text-zinc-900 truncate">
                                                    {entry.company_name ?? entry.firm_name ?? '—'}
                                                </p>
                                                {(entry.stage || entry.role) && (
                                                    <p className="text-[11.5px] text-zinc-400 font-normal truncate mt-0.5">
                                                        {humanize(entry.stage ?? entry.role)}
                                                    </p>
                                                )}
                                            </td>

                                            {/* Signed Up */}
                                            <td className="px-5 py-3.5 text-[12px] text-zinc-500 tabular-nums font-normal">
                                                {formatDate(entry.created_at)}
                                            </td>

                                            {/* Email Status Indicator */}
                                            <td className="px-5 py-3.5">
                                                {emailSent ? (
                                                    <span className="inline-flex items-center gap-1.5 text-[12px] text-zinc-700 font-medium">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                        <span>Sent</span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 text-[12px] text-zinc-400 font-normal">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
                                                        <span>Pending</span>
                                                    </span>
                                                )}
                                            </td>

                                            {/* Conversion Status */}
                                            <td className="px-5 py-3.5">
                                                {isConverted ? (
                                                    <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-700">
                                                        <Icon icon="solar:check-circle-linear" className="size-3.5 text-emerald-600" />
                                                        <span>Converted</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-[12px] text-zinc-400 font-normal">—</span>
                                                )}
                                            </td>

                                            {/* Actions Toolbar */}
                                            <td className="px-5 py-3.5">
                                                <RowActions
                                                    entry={entry}
                                                    onRequestDelete={(e) => setDeletingEntry(e)}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* ── Pagination Footer (Pinned at Bottom of Card) ────────────── */}
                {entries.total > 0 && (
                    <div className="flex items-center justify-between border-t border-zinc-100 px-6 py-3 bg-white shrink-0">
                        <p className="text-xs text-zinc-500">
                            Showing{' '}
                            <span className="font-bold text-zinc-900">
                                {(entries.current_page - 1) * entries.per_page + 1}–
                                {Math.min(entries.current_page * entries.per_page, entries.total)}
                            </span>{' '}
                            of <span className="font-bold text-zinc-900">{entries.total}</span> leads
                        </p>

                        {entries.last_page > 1 && (
                            <div className="flex items-center gap-1">
                                {entries.links.map((link, i) => {
                                    const isNav = i === 0 || i === entries.links.length - 1;
                                    if (link.url === null && isNav) return null;

                                    return link.url ? (
                                        <Link
                                            key={i}
                                            href={link.url}
                                            preserveScroll
                                            className={cn(
                                                'flex h-7.5 min-w-7.5 items-center justify-center rounded-lg px-2 text-xs font-semibold transition-colors shadow-2xs',
                                                link.active
                                                    ? 'bg-zinc-950 font-bold text-white'
                                                    : 'border border-zinc-200/80 bg-white text-zinc-700 hover:bg-zinc-50',
                                            )}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : (
                                        <span
                                            key={i}
                                            className="flex h-7.5 min-w-7.5 items-center justify-center rounded-lg px-2 text-xs font-semibold text-zinc-400"
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── Custom Styled Delete Confirmation Modal ────────────────────── */}
            <DeleteModal
                entry={deletingEntry}
                isOpen={deletingEntry !== null}
                onClose={() => setDeletingEntry(null)}
            />
        </AdminLayout>
    );
}
