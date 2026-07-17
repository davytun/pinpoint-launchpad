import { Head, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { FileText, Loader2, MessageSquare, Paperclip, Send, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Textarea } from '@/components/ui/textarea';
import FounderLayout from '@/layouts/founder-layout';
import { cn } from '@/lib/utils';

interface Message {
    id: number | string; // string for optimistic IDs
    sender_type: 'founder' | 'admin';
    sender_name: string;
    body: string | null;
    has_attachment: boolean;
    attachment_filename: string | null;
    attachment_size: string | null;
    created_at: string;
    created_at_date: string;
    is_from_founder: boolean;
    is_optimistic?: boolean;
}

interface PageProps {
    messages: Message[];
    founder: {
        id: number;
        email: string;
        full_name?: string | null;
        company_name?: string | null;
    };
}

function formatDateLabel(dateStr: string): string {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const msgDate = new Date(dateStr);
    if (msgDate.toDateString() === today.toDateString()) return 'Today';
    if (msgDate.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return msgDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function FadeUp({ delay = 0, children }: { delay?: number; children: React.ReactNode }) {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay, ease: [0.25, 1, 0.5, 1] }}>
            {children}
        </motion.div>
    );
}

export default function FounderMessages({ messages: initialMessages, founder }: PageProps) {
    const threadRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [body, setBody] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Update local state when server props change
    useEffect(() => {
        setMessages(initialMessages);
    }, [initialMessages]);

    useEffect(() => {
        if (threadRef.current) {
            threadRef.current.scrollTop = threadRef.current.scrollHeight;
        }
    }, [messages]);

    // Auto-refresh every 30s
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['messages'] });
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;
        setAttachment(file);
    }

    async function handleSubmit() {
        if ((!body.trim() && !attachment) || processing) return;

        const originalBody = body;
        const originalAttachment = attachment;

        // Optimistic Update
        const optimisticMsg: Message = {
            id: `opt-${Date.now()}`,
            sender_type: 'founder',
            sender_name: founder.full_name ?? 'You',
            body: originalBody,
            has_attachment: !!originalAttachment,
            attachment_filename: originalAttachment?.name ?? null,
            attachment_size: originalAttachment ? `${(originalAttachment.size / 1024).toFixed(1)} KB` : null,
            created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            created_at_date: new Date().toISOString().split('T')[0],
            is_from_founder: true,
            is_optimistic: true,
        };

        setMessages((prev) => [...prev, optimisticMsg]);
        setBody('');
        setAttachment(null);
        setProcessing(true);
        setErrors({});

        // AJAX Send
        try {
            const formData = new FormData();
            formData.append('body', originalBody);
            if (originalAttachment) formData.append('attachment', originalAttachment);

            const xsrf = decodeURIComponent(
                document.cookie
                    .split('; ')
                    .find((c) => c.startsWith('XSRF-TOKEN='))
                    ?.split('=')
                    .slice(1)
                    .join('=') ?? '',
            );

            const response = await fetch(route('founder.messages.store'), {
                method: 'POST',
                body: formData,
                headers: {
                    'X-XSRF-TOKEN': xsrf,
                    'X-Requested-With': 'XMLHttpRequest',
                    Accept: 'application/json',
                },
            });

            if (response.ok) {
                // Success — let Inertia reload the real data in background
                router.reload({ only: ['messages'] });
            } else {
                const data = await response.json();
                setErrors(data.errors || { body: 'Failed to send message.' });
                // Rollback optimistic message if failed
                setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
                setBody(originalBody);
                setAttachment(originalAttachment);
            }
        } catch {
            setErrors({ body: 'Network error. Please try again.' });
            setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
            setBody(originalBody);
            setAttachment(originalAttachment);
        } finally {
            setProcessing(false);
        }
    }

    function removeAttachment() {
        setAttachment(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    }

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
        <FounderLayout founder={founder}>
            <Head title="Channel — Pinpoint Launchpad" />

            <div className="mx-auto max-w-[56rem] px-4 py-8 sm:px-6 sm:py-12">
                {/* Header */}
                <FadeUp delay={0}>
                    <div className="mb-8 flex items-end justify-between">
                        <div>
                            <h1 className="font-display text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl">Engagement Channel</h1>
                            <p className="text-zinc-550 mt-2 text-[15px]">Direct line to your assigned analytical team for audit coordination.</p>
                        </div>
                        <div className="hidden sm:block">
                            <div className="flex items-center gap-2 rounded-full border border-[#3A54A5]/25 bg-[#3A54A5]/5 px-3 py-1.5 text-[11px] font-bold tracking-widest text-[#3A54A5] uppercase">
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                                Active Thread
                            </div>
                        </div>
                    </div>
                </FadeUp>

                {/* Chat Container */}
                <FadeUp delay={0.1}>
                    <div className="flex flex-col overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/30 shadow-[0_8px_30px_rgba(0,0,0,0.025)] backdrop-blur-md">
                        {/* Thread Header */}
                        <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50/40 px-6 py-4">
                            <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#3A54A5]/20 bg-[#3A54A5]/10 text-[#3A54A5]">
                                    <MessageSquare className="size-5" />
                                </div>
                                <div>
                                    <p className="text-[14px] font-bold text-zinc-900">Analytical Review Team</p>
                                    <p className="mt-0.5 text-[11px] font-bold tracking-wider text-[#3A54A5] uppercase">Official Audit Support</p>
                                </div>
                            </div>
                        </div>

                        {/* Message list */}
                        <div
                            ref={threadRef}
                            className="scrollbar-thin scrollbar-thumb-zinc-200 overflow-y-auto scroll-smooth bg-zinc-50/20 p-6"
                            style={{ height: 'calc(100vh - 480px)', minHeight: '400px' }}
                        >
                            {renderedMessages.length === 0 ? (
                                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50/50">
                                        <MessageSquare className="size-6 text-zinc-400" />
                                    </div>
                                    <div>
                                        <p className="text-[15px] font-bold text-zinc-900">Engagement Initialized</p>
                                        <p className="mt-1 max-w-[240px] text-[13px] text-zinc-500">
                                            Transmit your first inquiry or status update to begin the audit coordination.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-8">
                                    {renderedMessages.map((item, i) => {
                                        if (item.type === 'date') {
                                            return (
                                                <div key={`date-${i}`} className="flex items-center gap-4 py-2">
                                                    <div className="h-[1px] flex-1 bg-zinc-200/80" />
                                                    <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                                                        {item.label}
                                                    </span>
                                                    <div className="h-[1px] flex-1 bg-zinc-200/80" />
                                                </div>
                                            );
                                        }

                                        const { msg } = item;
                                        const isFounder = msg.is_from_founder;

                                        return (
                                            <div key={msg.id} className={`group flex flex-col ${isFounder ? 'items-end' : 'items-start'}`}>
                                                <div className="mb-2 flex items-center gap-3">
                                                    {!isFounder && (
                                                        <span className="text-[11px] font-bold tracking-widest text-[#3A54A5] uppercase">
                                                            Audit Lead
                                                        </span>
                                                    )}
                                                    <span className="text-zinc-450 text-[11px] font-medium opacity-60 transition-opacity group-hover:opacity-100">
                                                        {msg.created_at}
                                                    </span>
                                                    {isFounder && (
                                                        <span className="text-[11px] font-bold tracking-widest text-zinc-500 uppercase">
                                                            Authorized Founder
                                                        </span>
                                                    )}
                                                </div>

                                                <div
                                                    className={cn(
                                                        'relative max-w-[80%] rounded-xl px-5 py-4 text-[14px] leading-relaxed',
                                                        isFounder
                                                            ? 'border border-[#3A54A5]/30 bg-[#3A54A5]/10 text-zinc-900'
                                                            : 'border border-zinc-200 bg-white text-zinc-800 shadow-xs',
                                                        msg.is_optimistic && 'opacity-65 grayscale-[0.4]',
                                                    )}
                                                >
                                                    {msg.body && <p className="whitespace-pre-wrap">{msg.body}</p>}

                                                    {msg.has_attachment && (
                                                        <div className="border-zinc-250 mt-4 flex items-center gap-3 rounded-xl border bg-zinc-50/55 p-3 transition-colors hover:border-[#3A54A5]/30">
                                                            <div className="flex h-10 w-10 items-center justify-center rounded border border-zinc-200 bg-white shadow-inner">
                                                                <FileText className="size-5 text-[#3A54A5]" />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="truncate text-[13px] font-bold text-zinc-900">
                                                                    {msg.attachment_filename}
                                                                </p>
                                                                {msg.attachment_size && (
                                                                    <p className="text-zinc-550 mt-0.5 text-[11px] font-bold tracking-tighter uppercase">
                                                                        {msg.attachment_size}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <a
                                                                href={
                                                                    msg.is_optimistic
                                                                        ? '#'
                                                                        : route('founder.messages.attachment.download', { message: msg.id })
                                                                }
                                                                className="rounded-md border border-zinc-200 bg-white p-2 text-zinc-500 shadow-xs transition-all hover:border-zinc-300 hover:text-zinc-800"
                                                            >
                                                                <Send className="size-4 rotate-90" />
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Input Zone */}
                        <div className="border-t border-zinc-200 bg-zinc-50/40 p-6">
                            <AnimatePresence>
                                {attachment && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="mb-4 inline-flex items-center gap-3 rounded-lg border border-[#3A54A5]/30 bg-[#3A54A5]/10 px-4 py-2 text-[12px] font-bold text-[#3A54A5]"
                                    >
                                        <Paperclip className="size-4 text-[#3A54A5]" />
                                        <span className="max-w-[240px] truncate">{attachment.name}</span>
                                        <button
                                            type="button"
                                            onClick={removeAttachment}
                                            className="ml-2 rounded-full p-1 transition-colors hover:bg-zinc-200/50"
                                        >
                                            <X className="size-4" />
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {errors.body && <p className="mb-3 text-[13px] font-medium text-red-500">{errors.body}</p>}
                            {errors.attachment && <p className="mb-3 text-[13px] font-medium text-red-500">{errors.attachment}</p>}

                            <div className="group relative">
                                <Textarea
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Enter audit inquiry or engagement update..."
                                    className="max-h-[300px] min-h-[120px] w-full resize-none rounded-xl border-zinc-200 bg-white p-5 text-[15px] text-zinc-950 shadow-xs transition-all group-hover:border-zinc-300 placeholder:text-zinc-400 focus:border-[#3A54A5]/60 focus:ring-2 focus:ring-[#3A54A5]/10"
                                />

                                <div className="absolute right-5 bottom-5 flex items-center gap-5">
                                    <div className="text-[12px] font-bold tracking-tighter text-zinc-400">{body.length} / 2000</div>

                                    <div className="flex items-center gap-3 border-l border-zinc-200 pl-5">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="rounded-lg border border-transparent p-2.5 text-zinc-500 transition-all hover:border-zinc-200 hover:bg-zinc-100 hover:text-zinc-800"
                                            title="Attach supporting evidence"
                                        >
                                            <Paperclip className="size-5" />
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
                                            disabled={(!body.trim() && !attachment) || processing}
                                            className={cn(
                                                'flex h-11 items-center justify-center gap-3 rounded-lg px-6 text-[13px] font-bold tracking-widest uppercase transition-all',
                                                (body.trim() || attachment) && !processing
                                                    ? 'bg-[#3A54A5] text-white shadow-lg shadow-[#3A54A5]/25 hover:bg-[#2D4182] active:scale-[0.98]'
                                                    : 'cursor-not-allowed border border-zinc-200/50 bg-zinc-100 text-zinc-400',
                                            )}
                                        >
                                            {processing ? <Loader2 className="size-4.5 animate-spin" /> : <Send className="size-4.5" />}
                                            Post Update
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between text-[11px] text-zinc-400">
                                <div className="flex items-center gap-2">
                                    <div className="h-1 w-1 rounded-full bg-[#3A54A5]" />
                                    Secure Connection
                                </div>
                                <div>
                                    Press <kbd className="mx-1 rounded border border-zinc-200 bg-white px-1.5 py-0.5">Enter</kbd> to post update
                                </div>
                            </div>
                        </div>
                    </div>
                </FadeUp>
            </div>
        </FounderLayout>
    );
}
