import { Head, Link, router, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, FileText, MessageSquare, Paperclip, Send, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Textarea } from '@/components/ui/textarea';

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

interface Thread {
    id: number;
    founder_id: number;
    founder_name: string | null;
    company_name: string | null;
    email: string;
}

interface Founder {
    id: number;
    full_name: string | null;
    company_name: string | null;
    email: string;
}

interface PageProps {
    thread: Thread;
    messages: Message[];
    founder: Founder;
}

function formatDateLabel(dateStr: string): string {
    const today     = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const msgDate = new Date(dateStr);
    if (msgDate.toDateString() === today.toDateString())     return 'Today';
    if (msgDate.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return msgDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminMessagesShow({ thread, messages, founder }: PageProps) {
    const threadRef    = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [attachment, setAttachment] = useState<File | null>(null);
    const [charCount, setCharCount]   = useState(0);

    const { data, setData, post, processing, errors, reset } = useForm<{
        body: string;
        attachment: File | null;
    }>({ body: '', attachment: null });

    useEffect(() => {
        if (threadRef.current) {
            threadRef.current.scrollTop = threadRef.current.scrollHeight;
        }
    }, [messages.length]);

    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['messages'] });
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    function handleBodyChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
        setData('body', e.target.value);
        setCharCount(e.target.value.length);
    }

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
        if (!data.body.trim() && !attachment) return;
        post(route('admin.messages.reply', { thread: thread.id }), {
            forceFormData: true,
            onSuccess: () => {
                reset('body');
                setAttachment(null);
                setCharCount(0);
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
        });
    }

    const canSend = (data.body.trim().length > 0 || attachment !== null) && !processing;

    const charColor =
        charCount >= 2000 ? 'text-red-400' :
        charCount >= 1800 ? 'text-amber-400' :
        'text-slate-500';

    // Group messages with date separators
    const renderedMessages: Array<{ type: 'date'; label: string } | { type: 'message'; msg: Message }> = [];
    let lastDate = '';
    for (const msg of messages) {
        if (msg.created_at_date !== lastDate) {
            renderedMessages.push({ type: 'date', label: formatDateLabel(msg.created_at_date) });
            lastDate = msg.created_at_date;
        }
        renderedMessages.push({ type: 'message', msg });
    }

    return (
        <>
            <Head title={`${founder.company_name ?? founder.full_name} — Messages`} />

            <div className="min-h-screen bg-[#050505] text-white antialiased">
                <div className="mx-auto max-w-6xl px-6 py-8">

                    {/* Back link */}
                    <Link
                        href={route('admin.messages.inbox')}
                        className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
                    >
                        <ArrowLeft className="size-4" />
                        Back to Inbox
                    </Link>

                    <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-start">

                        {/* ── Left: founder info sidebar ── */}
                        <aside className="w-full shrink-0 lg:w-64">
                            <div className="rounded-2xl border border-white/[0.06] bg-[#0A0A0A] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                                <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Founder</p>
                                <h2 className="text-lg font-bold text-white">{founder.full_name ?? '—'}</h2>
                                <p className="mt-0.5 text-sm text-slate-400">{founder.company_name ?? '—'}</p>
                                <p className="mt-0.5 text-xs text-slate-600 break-all">{founder.email}</p>

                                <div className="my-4 h-px bg-white/[0.06]" />

                                <div className="flex flex-col gap-2">
                                    <Link
                                        href={`/admin/founders/${founder.id}/documents`}
                                        className="flex items-center gap-2 rounded-lg border border-white/[0.06] px-3 py-2 text-xs text-slate-400 transition-colors hover:border-white/[0.12] hover:text-white"
                                    >
                                        <FileText className="size-3.5 shrink-0" />
                                        View Documents →
                                    </Link>
                                </div>
                            </div>
                        </aside>

                        {/* ── Right: message thread ── */}
                        <div className="flex-1 min-w-0">
                            <div className="rounded-3xl border border-white/[0.06] bg-[#0A0A0A] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">

                                {/* Thread */}
                                <div
                                    ref={threadRef}
                                    className="overflow-y-auto p-6"
                                    style={{ height: 'calc(100vh - 320px)', minHeight: '400px' }}
                                >
                                    {renderedMessages.length === 0 ? (
                                        <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                                            <MessageSquare className="size-12 text-slate-500" />
                                            <p className="text-sm font-semibold text-slate-400">No messages yet</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-4">
                                            {renderedMessages.map((item, i) => {
                                                if (item.type === 'date') {
                                                    return (
                                                        <div key={`date-${i}`} className="flex justify-center">
                                                            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-500">
                                                                {item.label}
                                                            </span>
                                                        </div>
                                                    );
                                                }

                                                const { msg } = item;
                                                // Admin messages on RIGHT, founder on LEFT
                                                const isAdmin = msg.sender_type === 'admin';

                                                return (
                                                    <motion.div
                                                        key={msg.id}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                                                    >
                                                        <span className={`mb-1 text-xs ${isAdmin ? 'text-blue-300 text-right' : 'text-slate-400 text-left'}`}>
                                                            {msg.sender_name}
                                                        </span>

                                                        <div
                                                            className={[
                                                                'max-w-[75%] rounded-2xl px-4 py-3 text-sm text-white',
                                                                isAdmin
                                                                    ? 'rounded-br-sm bg-blue-600'
                                                                    : 'rounded-bl-sm bg-slate-700/80',
                                                            ].join(' ')}
                                                        >
                                                            {msg.body && (
                                                                <p className="leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                                                            )}

                                                            {msg.has_attachment && (
                                                                <a
                                                                    href={route('admin.messages.attachment.download', { message: msg.id })}
                                                                    className="mt-2 flex items-center gap-2 rounded-lg bg-white/10 p-2 text-xs transition-colors hover:bg-white/20"
                                                                >
                                                                    <Paperclip className="size-3.5 shrink-0" />
                                                                    <span className="truncate">{msg.attachment_filename}</span>
                                                                    {msg.attachment_size && (
                                                                        <span className="shrink-0 text-white/50">{msg.attachment_size}</span>
                                                                    )}
                                                                </a>
                                                            )}
                                                        </div>

                                                        <span className={`mt-1 text-[10px] ${isAdmin ? 'text-blue-300/70 text-right' : 'text-slate-500 text-left'}`}>
                                                            {msg.created_at}
                                                        </span>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Reply compose */}
                                <div className="border-t border-slate-700/50 p-4">

                                    {attachment && (
                                        <div className="mb-2 flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-xs text-slate-300">
                                            <Paperclip className="size-3.5 shrink-0 text-slate-400" />
                                            <span className="truncate">{attachment.name}</span>
                                            <button type="button" onClick={removeAttachment} className="ml-auto shrink-0 text-slate-500 hover:text-slate-300">
                                                <X className="size-3.5" />
                                            </button>
                                        </div>
                                    )}

                                    {errors.body && <p className="mb-2 text-xs text-red-400">{errors.body}</p>}
                                    {errors.attachment && <p className="mb-2 text-xs text-red-400">{errors.attachment}</p>}

                                    <div className="flex items-end gap-2">
                                        <div className="flex-1">
                                            <Textarea
                                                value={data.body}
                                                onChange={handleBodyChange}
                                                onKeyDown={handleKeyDown}
                                                placeholder="Type your reply..."
                                                className="min-h-[80px] max-h-[200px] resize-none border-slate-700 bg-slate-800/50 text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-blue-500/20"
                                                maxLength={2000}
                                            />
                                            <div className={`mt-1 text-right text-xs ${charColor}`}>
                                                {charCount}/2000
                                            </div>
                                        </div>

                                        <div className="flex shrink-0 flex-col items-center gap-2 pb-6">
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-700/50 hover:text-white"
                                                title="Attach file"
                                            >
                                                <Paperclip className="size-4" />
                                            </button>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                className="hidden"
                                                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.jpg,.jpeg,.png"
                                                onChange={handleFileChange}
                                            />

                                            <button
                                                type="button"
                                                onClick={handleSubmit}
                                                disabled={!canSend}
                                                className={[
                                                    'relative overflow-hidden rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] transition-all duration-200',
                                                    canSend
                                                        ? 'bg-blue-600 text-white hover:bg-blue-500'
                                                        : 'cursor-not-allowed bg-slate-700/50 text-slate-500',
                                                ].join(' ')}
                                            >
                                                <span className="flex items-center gap-1.5">
                                                    {processing ? (
                                                        <span className="inline-block size-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                                    ) : (
                                                        <Send className="size-3.5" />
                                                    )}
                                                    Reply
                                                </span>
                                            </button>
                                        </div>
                                    </div>

                                    <p className="mt-1 text-[10px] text-slate-600">
                                        Press Enter to send · Shift+Enter for new line
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
