import { Icon } from '@iconify/react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';

interface Thread {
    id: number;
    founder_name: string | null;
    company_name: string | null;
    email: string;
    unread_count: number;
    total_messages: number;
    last_message_at: string | null;
    last_message_preview: string;
}

interface Message {
    id: number;
    sender_type: 'founder' | 'admin';
    sender_name: string;
    body: string | null;
    has_attachment: boolean;
    attachment_filename: string | null;
    attachment_size: string | null;
    created_at: string;
    created_at_date: string;
    is_from_founder: boolean;
}

interface ActiveThread {
    id: number;
    founder_id: number | null;
    founder_name: string | null;
    company_name: string | null;
    email: string;
}

interface FounderDetails {
    id: number;
    full_name: string | null;
    company_name: string | null;
    email: string;
    phone?: string | null;
    tier?: string;
    diagnostic_score?: number | null;
    diagnostic_status?: string;
    created_at?: string;
}

interface PageProps {
    threads: Thread[];
    active_thread: ActiveThread | null;
    messages: Message[];
    founder: FounderDetails | null;
    total_unread: number;
}

function getInitials(name?: string | null): string {
    if (!name) return 'F';
    return name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase();
}

export default function AdminMessagesInbox({
    threads,
    active_thread,
    messages,
    founder,
}: PageProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterTab, setFilterTab] = useState<'all' | 'unread'>('all');
    const [attachment, setAttachment] = useState<File | null>(null);
    const [copiedEmail, setCopiedEmail] = useState(false);

    const threadRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, reset } = useForm<{
        body: string;
        attachment: File | null;
    }>({ body: '', attachment: null });

    useEffect(() => {
        if (threadRef.current) {
            threadRef.current.scrollTop = threadRef.current.scrollHeight;
        }
    }, [messages.length, active_thread?.id]);

    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['threads', 'messages', 'total_unread'] });
        }, 25000);
        return () => clearInterval(interval);
    }, []);

    const filteredThreads = threads.filter((t) => {
        const matchesFilter = filterTab === 'all' || (filterTab === 'unread' && t.unread_count > 0);
        const matchesSearch =
            !searchQuery.trim() ||
            (t.founder_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
            (t.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
            t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.last_message_preview.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;
        setAttachment(file);
        setData('attachment', file);
    }

    function removeAttachment() {
        setAttachment(null);
        setData('attachment', null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    }

    function handleSubmit() {
        if (!active_thread || (!data.body.trim() && !attachment)) return;
        post(route('admin.messages.reply', { thread: active_thread.id }), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                reset('body');
                setAttachment(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
        });
    }

    function copyEmail() {
        if (founder?.email) {
            navigator.clipboard.writeText(founder.email);
            setCopiedEmail(true);
            setTimeout(() => setCopiedEmail(false), 2000);
        }
    }

    const canSend = (data.body.trim().length > 0 || attachment !== null) && !processing;

    return (
        <AdminLayout>
            <Head title={active_thread ? `${active_thread.founder_name} — Inbox` : 'Message Inbox — Admin'} />

            {/* ── Fixed Viewport Multi-Container (Zero Window Scrolling) ───────── */}
            <div className="flex flex-1 min-w-0 gap-3.5 h-full max-h-full overflow-hidden">
                {/* ── Container 1: Master Thread List Card (Left) ─────────────── */}
                <section className="flex w-full md:w-80 lg:w-84 shrink-0 flex-col bg-white rounded-2xl lg:rounded-[22px] border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] h-full max-h-full overflow-hidden">
                    {/* Header */}
                    <div className="p-4 pb-3 border-b border-zinc-100 shrink-0">
                        <div className="flex items-center justify-between mb-3">
                            <h1 className="text-[16px] font-bold tracking-tight text-zinc-950">Inbox</h1>
                            <button
                                onClick={() => setFilterTab(filterTab === 'all' ? 'unread' : 'all')}
                                className={cn(
                                    'flex h-7 items-center gap-1 rounded-lg px-2 text-[12px] font-semibold transition-colors',
                                    filterTab === 'unread'
                                        ? 'bg-zinc-900 text-white'
                                        : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900',
                                )}
                            >
                                <Icon icon="solar:filter-linear" className="size-3.5" />
                                <span>Filter</span>
                            </button>
                        </div>

                        {/* Search Input */}
                        <div className="relative flex items-center">
                            <Icon
                                icon="solar:minimalistic-magnifer-linear"
                                className="absolute left-3 size-4 text-zinc-400 pointer-events-none"
                            />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search founders or messages..."
                                className="w-full rounded-xl border border-zinc-200/90 bg-[#F9F9FB] py-1.5 pr-8 pl-9 text-[13px] text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none transition-colors"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2.5 text-zinc-400 hover:text-zinc-700"
                                >
                                    <Icon icon="solar:close-circle-linear" className="size-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Thread Items List (Independently Scrollable) */}
                    <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-2 space-y-1">
                        {filteredThreads.length === 0 ? (
                            <div className="p-8 text-center">
                                <Icon icon="solar:inbox-line-linear" className="mx-auto size-8 text-zinc-300 mb-2" />
                                <p className="text-xs font-bold text-zinc-700">No conversations</p>
                                <p className="text-[11px] text-zinc-400 mt-0.5">
                                    {searchQuery ? 'No matching threads.' : 'Messages will appear here.'}
                                </p>
                            </div>
                        ) : (
                            filteredThreads.map((t) => {
                                const isSelected = active_thread?.id === t.id;
                                const hasUnread = t.unread_count > 0;

                                return (
                                    <Link
                                        key={t.id}
                                        href={route('admin.messages.inbox', { thread: t.id })}
                                        preserveState
                                        preserveScroll
                                        className={cn(
                                            'group relative flex flex-col gap-1 rounded-xl p-3 text-left transition-all duration-150',
                                            isSelected
                                                ? 'bg-[#EAEAEC] text-zinc-950 shadow-2xs font-medium'
                                                : 'hover:bg-zinc-100/70 text-zinc-700',
                                        )}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                {/* Unified Elegant Monochrome Avatar */}
                                                <div className="flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-[10.5px] font-bold text-white shadow-2xs">
                                                    {getInitials(t.founder_name)}
                                                </div>
                                                <p
                                                    className={cn(
                                                        'truncate text-[13px] tracking-tight',
                                                        isSelected
                                                            ? 'font-bold text-zinc-950'
                                                            : hasUnread
                                                            ? 'font-bold text-zinc-900'
                                                            : 'font-semibold text-zinc-800',
                                                    )}
                                                >
                                                    {t.founder_name ?? 'Unknown'}
                                                </p>
                                            </div>
                                            {t.last_message_at && (
                                                <span className="shrink-0 text-[11px] text-zinc-400 tabular-nums font-normal">
                                                    {t.last_message_at}
                                                </span>
                                            )}
                                        </div>

                                        <p className="line-clamp-1 text-[12px] text-zinc-500 pl-9 mt-0.5 font-normal">
                                            {t.last_message_preview}
                                        </p>

                                        {hasUnread && (
                                            <div className="absolute top-3.5 right-3 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
                                        )}
                                    </Link>
                                );
                            })
                        )}
                    </div>
                </section>

                {/* ── Container 2: Active Conversation & Context Inspector Card ─── */}
                <section className="flex flex-1 min-w-0 bg-white rounded-2xl lg:rounded-[22px] border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] h-full max-h-full overflow-hidden">
                    {active_thread ? (
                        <>
                            {/* Left Sub-Pane: Conversation Canvas */}
                            <div className="flex flex-1 flex-col min-w-0 h-full max-h-full overflow-hidden">
                                {/* Fixed Top Header */}
                                <div className="flex h-14 items-center justify-between border-b border-zinc-100 px-6 shrink-0 bg-white">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white shadow-2xs">
                                            {getInitials(active_thread.founder_name)}
                                        </div>
                                        <div className="min-w-0">
                                            <h2 className="truncate text-[14.5px] font-bold text-zinc-950">
                                                {active_thread.founder_name ?? 'Founder'}
                                            </h2>
                                            <p className="truncate text-[11.5px] text-zinc-500">
                                                {active_thread.company_name !== 'N/A' ? active_thread.company_name : active_thread.email}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {founder?.id && (
                                            <Link
                                                href={`/admin/founders/${founder.id}`}
                                                className="flex items-center gap-1.5 rounded-xl border border-zinc-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-2xs hover:bg-zinc-50 hover:text-zinc-950 transition-colors"
                                            >
                                                <span>Profile</span>
                                                <Icon icon="solar:arrow-right-up-linear" className="size-3 text-zinc-400" />
                                            </Link>
                                        )}
                                    </div>
                                </div>

                                {/* Message Timeline (Independently Scrollable Stream) */}
                                <div ref={threadRef} className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-6 space-y-6">
                                    {messages.map((msg, idx) => {
                                        const isFounder = msg.is_from_founder;

                                        return (
                                            <div key={msg.id} className="space-y-2">
                                                {/* Sender Header Line */}
                                                <div className="flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-zinc-900">
                                                            {isFounder
                                                                ? `${active_thread.founder_name} <${active_thread.email}>`
                                                                : 'Pinpoint Analyst Team'}
                                                        </span>
                                                        {!isFounder && (
                                                            <span className="rounded-md bg-zinc-100 px-1.5 py-0.2 text-[9.5px] font-bold uppercase tracking-wider text-zinc-600">
                                                                Analyst
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-[11px] text-zinc-400 tabular-nums">
                                                        {msg.created_at}
                                                    </span>
                                                </div>

                                                {/* Message Body */}
                                                {msg.body && (
                                                    <p className="text-[13.5px] leading-relaxed text-zinc-800 whitespace-pre-wrap font-normal">
                                                        {msg.body}
                                                    </p>
                                                )}

                                                {/* Structured Attachment Card */}
                                                {msg.has_attachment && (
                                                    <div className="mt-3 rounded-2xl border border-zinc-200/80 bg-[#F9F9FB] p-3.5 max-w-md">
                                                        <div className="flex items-center justify-between gap-3">
                                                            <div className="flex items-center gap-2.5 min-w-0">
                                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white border border-zinc-200 shadow-2xs text-zinc-700">
                                                                    <Icon icon="solar:document-text-linear" className="size-4" />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="truncate text-xs font-bold text-zinc-900">
                                                                        {msg.attachment_filename ?? 'Attachment'}
                                                                    </p>
                                                                    {msg.attachment_size && (
                                                                        <p className="text-[11px] text-zinc-400">
                                                                            {msg.attachment_size}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <a
                                                                href={route('admin.messages.attachment.download', { message: msg.id })}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 shadow-2xs hover:bg-zinc-50 transition-colors"
                                                            >
                                                                <span>Download</span>
                                                                <Icon icon="solar:download-minimalistic-linear" className="size-3.5 text-zinc-400" />
                                                            </a>
                                                        </div>
                                                    </div>
                                                )}

                                                {idx < messages.length - 1 && (
                                                    <hr className="border-zinc-100 pt-4" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Fixed Bottom Command Composer (Always in Viewport!) */}
                                <div className="border-t border-zinc-100 p-3.5 bg-white shrink-0">
                                    {attachment && (
                                        <div className="mb-2 flex items-center gap-2 rounded-xl bg-zinc-100 px-3 py-1.5 text-xs text-zinc-800 w-fit">
                                            <Icon icon="solar:paperclip-linear" className="size-3.5 text-zinc-500" />
                                            <span className="font-semibold max-w-50 truncate">{attachment.name}</span>
                                            <button
                                                type="button"
                                                onClick={removeAttachment}
                                                className="text-zinc-400 hover:text-zinc-700 ml-1"
                                            >
                                                <Icon icon="solar:close-circle-linear" className="size-3.5" />
                                            </button>
                                        </div>
                                    )}

                                    <div className="rounded-2xl border border-zinc-200/90 bg-[#F9F9FB] p-3 shadow-2xs focus-within:border-zinc-400 focus-within:bg-white transition-all">
                                        <textarea
                                            value={data.body}
                                            onChange={(e) => setData('body', e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            placeholder={`Write a response to ${active_thread.founder_name ?? 'founder'}... (Enter to send)`}
                                            rows={2}
                                            className="w-full resize-none border-0 bg-transparent text-[13.5px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
                                        />

                                        <div className="flex items-center justify-between pt-2 border-t border-zinc-200/60">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    title="Attach file"
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-200/70 hover:text-zinc-900 transition-colors"
                                                >
                                                    <Icon icon="solar:paperclip-linear" className="size-4" />
                                                </button>
                                            </div>

                                            <button
                                                type="button"
                                                disabled={!canSend}
                                                onClick={handleSubmit}
                                                className={cn(
                                                    'flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-bold transition-all shadow-2xs',
                                                    canSend
                                                        ? 'bg-zinc-950 text-white hover:bg-zinc-800'
                                                        : 'bg-zinc-200 text-zinc-400 cursor-not-allowed',
                                                )}
                                            >
                                                <span>Send</span>
                                                <Icon icon="solar:plain-linear" className="size-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Sub-Pane: Clean Structured Inspector (Mercury / Polar Spec) */}
                            {founder && (
                                <aside className="hidden w-84 shrink-0 border-l border-zinc-100 bg-[#FAFBFD] p-5 h-full max-h-full overflow-y-auto no-scrollbar xl:flex xl:flex-col justify-between">
                                    <div className="space-y-5">
                                        {/* Top Profile Summary Card */}
                                        <div className="flex items-start gap-3.5">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-sm font-bold text-white shadow-2xs">
                                                {getInitials(founder.full_name)}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="truncate text-[15px] font-bold text-zinc-950 leading-tight">
                                                    {founder.full_name ?? '—'}
                                                </h3>
                                                <p className="truncate text-[12.5px] font-medium text-zinc-500 mt-0.5">
                                                    {founder.company_name !== 'N/A' ? founder.company_name : 'No Company'}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10.5px] font-bold text-emerald-700">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                        Active
                                                    </span>
                                                    <span className="inline-flex items-center rounded-md bg-zinc-100 border border-zinc-200/60 px-2 py-0.5 text-[10.5px] font-bold text-zinc-700 uppercase tracking-wide">
                                                        {founder.tier ?? 'Foundation'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Section: Properties Table (Bordered Panel) */}
                                        <div className="rounded-2xl border border-zinc-200/80 bg-white overflow-hidden divide-y divide-zinc-100/90 shadow-2xs">
                                            <div className="flex items-center justify-between p-3 text-xs">
                                                <span className="font-medium text-zinc-400">Email</span>
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    <span className="font-mono text-[12px] text-zinc-800 truncate max-w-35">
                                                        {founder.email}
                                                    </span>
                                                    <button
                                                        onClick={copyEmail}
                                                        title="Copy email"
                                                        className="text-zinc-400 hover:text-zinc-800 transition-colors"
                                                    >
                                                        <Icon
                                                            icon={copiedEmail ? 'solar:check-circle-linear' : 'solar:copy-linear'}
                                                            className="size-3.5 text-zinc-500"
                                                        />
                                                    </button>
                                                </div>
                                            </div>

                                            {founder.phone && (
                                                <div className="flex items-center justify-between p-3 text-xs">
                                                    <span className="font-medium text-zinc-400">Phone</span>
                                                    <span className="font-mono text-[12px] text-zinc-800">
                                                        {founder.phone}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between p-3 text-xs">
                                                <span className="font-medium text-zinc-400">Diagnostic Score</span>
                                                <span className="font-bold text-zinc-950">
                                                    {founder.diagnostic_score != null ? `${founder.diagnostic_score} / 100` : 'Pending'}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between p-3 text-xs">
                                                <span className="font-medium text-zinc-400">Assigned</span>
                                                <span className="font-semibold text-zinc-800">Analyst Team</span>
                                            </div>

                                            {founder.created_at && (
                                                <div className="flex items-center justify-between p-3 text-xs">
                                                    <span className="font-medium text-zinc-400">Member Since</span>
                                                    <span className="font-semibold text-zinc-800">{founder.created_at}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Section: Thread Context Card */}
                                        <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-3.5 space-y-1">
                                            <p className="text-[10.5px] font-bold uppercase tracking-wider text-zinc-400">
                                                Thread Context
                                            </p>
                                            <p className="text-xs font-bold text-zinc-900">
                                                Diligence & Matching
                                            </p>
                                            <p className="text-[11.5px] text-zinc-500 leading-relaxed font-normal">
                                                Founder uploaded updated metrics and presentation deck for review.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Links */}
                                    <div className="pt-4 space-y-2 border-t border-zinc-200/70 mt-6">
                                        <Link
                                            href={`/admin/founders/${founder.id}`}
                                            className="group flex items-center justify-between rounded-xl border border-zinc-200/80 bg-white p-3 text-[12.5px] font-semibold text-zinc-800 shadow-2xs hover:bg-zinc-50 hover:border-zinc-300 transition-all"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <Icon icon="solar:user-circle-linear" className="size-4 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
                                                <span>Founder Overview</span>
                                            </div>
                                            <Icon icon="solar:alt-arrow-right-linear" className="size-3.5 text-zinc-400 group-hover:text-zinc-700 transition-transform group-hover:translate-x-0.5" />
                                        </Link>

                                        <Link
                                            href={`/admin/profiles/${founder.id}`}
                                            className="group flex items-center justify-between rounded-xl border border-zinc-200/80 bg-white p-3 text-[12.5px] font-semibold text-zinc-800 shadow-2xs hover:bg-zinc-50 hover:border-zinc-300 transition-all"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <Icon icon="solar:chart-square-linear" className="size-4 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
                                                <span>Diagnostic Audit</span>
                                            </div>
                                            <Icon icon="solar:alt-arrow-right-linear" className="size-3.5 text-zinc-400 group-hover:text-zinc-700 transition-transform group-hover:translate-x-0.5" />
                                        </Link>
                                    </div>
                                </aside>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-1 flex-col items-center justify-center p-12 text-center">
                            <Icon icon="solar:inbox-line-linear" className="size-12 text-zinc-300 mb-3" />
                            <h3 className="text-sm font-bold text-zinc-900">Select a conversation</h3>
                            <p className="text-xs text-zinc-500 mt-1 max-w-sm">
                                Choose a thread from the list on the left to start viewing and replying to messages.
                            </p>
                        </div>
                    )}
                </section>
            </div>
        </AdminLayout>
    );
}
