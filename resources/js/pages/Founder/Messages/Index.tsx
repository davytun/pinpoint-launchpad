import { Icon } from '@iconify/react';
import { Head, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

import FounderLayout from '@/layouts/founder-layout';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
    id: number | string;
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

export default function FounderMessages({ messages: initialMessages, founder }: PageProps) {
    const threadRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [body, setBody] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

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
                router.reload({ only: ['messages'] });
            } else {
                const data = await response.json();
                setErrors(data.errors || { body: 'Failed to send message.' });
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
            <Head title="Founder Workspace — Analyst Engagement" />

            <div className="flex h-full max-h-full min-w-0 flex-1 flex-col overflow-hidden">
                {/* ── Header ── */}
                <div className="mb-4 flex shrink-0 items-center justify-between border-b border-zinc-100 pb-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold tracking-tight text-zinc-950 sm:text-2xl">
                                Analyst Engagement Channel
                            </h1>
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                                <span>Active Stream</span>
                            </span>
                        </div>
                        <p className="mt-0.5 text-xs text-zinc-400">
                            Direct line to your assigned Lead Analyst team for PARAGON audit coordination and diligence inquiries.
                        </p>
                    </div>
                </div>

                {/* ── Chat Container ── */}
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-[#FAFBFD] shadow-2xs">
                    {/* Chat Messages Stream */}
                    <div ref={threadRef} className="no-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center text-zinc-400">
                                <Icon icon="solar:chat-round-dots-linear" className="mb-2 size-8 text-zinc-300" />
                                <p className="text-xs">No messages yet. Send an inquiry or update to your analyst lead.</p>
                            </div>
                        ) : (
                            renderedMessages.map((item, index) => {
                                if (item.type === 'date') {
                                    return (
                                        <div key={`date-${index}`} className="flex items-center justify-center my-4">
                                            <span className="rounded-full bg-zinc-200/70 px-3 py-1 font-mono text-[10.5px] font-semibold text-zinc-600">
                                                {item.label}
                                            </span>
                                        </div>
                                    );
                                }

                                const msg = item.msg;
                                const isFounder = msg.is_from_founder;

                                return (
                                    <div
                                        key={msg.id}
                                        className={cn(
                                            'flex flex-col max-w-[80%]',
                                            isFounder ? 'ml-auto items-end' : 'mr-auto items-start',
                                        )}
                                    >
                                        <div className="mb-1 flex items-center gap-1.5 text-[10.5px] text-zinc-400">
                                            <span className="font-semibold text-zinc-700">{msg.sender_name}</span>
                                            <span>·</span>
                                            <span>{msg.created_at}</span>
                                        </div>

                                        <div
                                            className={cn(
                                                'rounded-2xl px-4 py-2.5 text-xs shadow-2xs',
                                                isFounder
                                                    ? 'bg-zinc-950 text-white rounded-tr-xs'
                                                    : 'border border-zinc-200/90 bg-white text-zinc-900 rounded-tl-xs',
                                            )}
                                        >
                                            {msg.body && <p className="whitespace-pre-wrap leading-relaxed">{msg.body}</p>}

                                            {msg.has_attachment && msg.attachment_filename && (
                                                <div
                                                    className={cn(
                                                        'mt-2 flex items-center justify-between gap-3 rounded-xl p-2 text-xs',
                                                        isFounder
                                                            ? 'bg-zinc-800/80 text-zinc-200'
                                                            : 'bg-zinc-50 text-zinc-700 border border-zinc-200/60',
                                                    )}
                                                >
                                                    <div className="flex items-center gap-1.5 truncate">
                                                        <Icon icon="solar:paperclip-linear" className="size-3.5 shrink-0" />
                                                        <span className="truncate">{msg.attachment_filename}</span>
                                                        {msg.attachment_size && (
                                                            <span className="text-[10px] opacity-70">({msg.attachment_size})</span>
                                                        )}
                                                    </div>
                                                    <a
                                                        href={route('founder.messages.attachment.download', { message: msg.id })}
                                                        className={cn(
                                                            'shrink-0 rounded-lg px-2 py-0.5 text-[10.5px] font-semibold',
                                                            isFounder ? 'bg-white text-zinc-900' : 'bg-zinc-900 text-white',
                                                        )}
                                                    >
                                                        Download
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Chat Composer */}
                    <div className="shrink-0 border-t border-zinc-200/80 bg-white p-3.5">
                        <div className="flex flex-col gap-2">
                            {attachment && (
                                <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-800">
                                    <div className="flex items-center gap-2 truncate">
                                        <Icon icon="solar:paperclip-linear" className="size-3.5 text-zinc-500" />
                                        <span className="truncate font-medium">{attachment.name}</span>
                                        <span className="text-[11px] text-zinc-400">
                                            ({(attachment.size / 1024).toFixed(1)} KB)
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={removeAttachment}
                                        className="text-zinc-400 hover:text-zinc-900"
                                    >
                                        <Icon icon="solar:close-circle-linear" className="size-4" />
                                    </button>
                                </div>
                            )}

                            <textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                placeholder="Write an audit inquiry or response to your analyst lead..."
                                rows={2}
                                className="w-full resize-none rounded-xl border border-zinc-200 bg-[#FAFBFD] p-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmit();
                                    }
                                }}
                            />

                            {errors.body && <p className="text-xs text-red-600">{errors.body}</p>}

                            <div className="flex items-center justify-between">
                                <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-200/80 bg-white px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-50">
                                    <Icon icon="solar:paperclip-linear" className="size-3.5 text-zinc-500" />
                                    <span className="truncate max-w-[140px]">
                                        {attachment ? 'Change attachment' : 'Attach file'}
                                    </span>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                </label>

                                <div className="flex items-center gap-2">
                                    <span className="hidden text-[11px] text-zinc-400 sm:inline">
                                        Press <kbd className="rounded border border-zinc-200 bg-zinc-50 px-1 font-mono text-[10px]">Enter</kbd> to send
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={processing || (!body.trim() && !attachment)}
                                        className="flex items-center gap-1.5 rounded-xl bg-zinc-950 px-4 py-1.5 text-xs font-semibold text-white shadow-2xs transition-all hover:bg-zinc-800 disabled:opacity-50"
                                    >
                                        {processing ? (
                                            <Icon icon="solar:refresh-linear" className="size-3 animate-spin" />
                                        ) : (
                                            <Icon icon="solar:plain-3-linear" className="size-3.5" />
                                        )}
                                        <span>Send Message</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </FounderLayout>
    );
}
