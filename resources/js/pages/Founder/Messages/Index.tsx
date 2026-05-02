import { Head, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Paperclip, Send, X, FileText, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Textarea } from '@/components/ui/textarea';
import FounderLayout from '@/layouts/founder-layout';

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
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay, ease: [0.25, 1, 0.5, 1] }}
        >
            {children}
        </motion.div>
    );
}

export default function FounderMessages({ messages: initialMessages, founder }: PageProps) {
    const threadRef      = useRef<HTMLDivElement>(null);
    const fileInputRef   = useRef<HTMLInputElement>(null);
    
    const [messages, setMessages]       = useState<Message[]>(initialMessages);
    const [body, setBody]               = useState('');
    const [attachment, setAttachment]   = useState<File | null>(null);
    const [processing, setProcessing]   = useState(false);
    const [errors, setErrors]           = useState<Record<string, string>>({});

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

        setMessages(prev => [...prev, optimisticMsg]);
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
                document.cookie.split('; ').find((c) => c.startsWith('XSRF-TOKEN='))?.split('=').slice(1).join('=') ?? ''
            );

            const response = await fetch(route('founder.messages.store'), {
                method: 'POST',
                body: formData,
                headers: {
                    'X-XSRF-TOKEN': xsrf,
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                }
            });

            if (response.ok) {
                // Success — let Inertia reload the real data in background
                router.reload({ only: ['messages'] });
            } else {
                const data = await response.json();
                setErrors(data.errors || { body: 'Failed to send message.' });
                // Rollback optimistic message if failed
                setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
                setBody(originalBody);
                setAttachment(originalAttachment);
            }
        } catch {
            setErrors({ body: 'Network error. Please try again.' });
            setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
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
                            <h1 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">Engagement Channel</h1>
                            <p className="mt-2 text-[15px] text-[#788CBA]">Direct line to your assigned analytical team for audit coordination.</p>
                        </div>
                        <div className="hidden sm:block">
                            <div className="flex items-center gap-2 rounded-full border border-[#232C43] bg-[#0C1427] px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-[#576FA8]">
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                                Active Thread
                            </div>
                        </div>
                    </div>
                </FadeUp>

                {/* Chat Container */}
                <FadeUp delay={0.1}>
                    <div className="flex flex-col overflow-hidden rounded-xl border border-[#232C43] bg-[#101623] shadow-2xl">
                        
                        {/* Thread Header */}
                        <div className="flex items-center justify-between border-b border-[#232C43] bg-[#0C1427]/50 px-6 py-4">
                            <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1B294B] border border-[#4468BB]/20 text-[#ECF0F9]">
                                    <MessageSquare className="size-5" />
                                </div>
                                <div>
                                    <p className="text-[14px] font-medium text-[#ECF0F9]">Analytical Review Team</p>
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#576FA8]">Official Audit Support</p>
                                </div>
                            </div>
                        </div>

                        {/* Message list */}
                        <div
                            ref={threadRef}
                            className="overflow-y-auto bg-[#080B11]/40 p-6 scroll-smooth scrollbar-thin scrollbar-thumb-[#232C43]"
                            style={{ height: 'calc(100vh - 480px)', minHeight: '400px' }}
                        >
                            {renderedMessages.length === 0 ? (
                                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0C1427] border border-[#232C43]">
                                        <MessageSquare className="size-6 text-[#455987]" />
                                    </div>
                                    <div>
                                        <p className="text-[15px] font-medium text-[#788CBA]">Engagement Initialized</p>
                                        <p className="mt-1 text-[13px] text-[#455987] max-w-[240px]">
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
                                                <div className="h-[1px] flex-1 bg-[#232C43]/40" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#455987]">
                                                    {item.label}
                                                </span>
                                                <div className="h-[1px] flex-1 bg-[#232C43]/40" />
                                            </div>
                                        );
                                    }

                                    const { msg } = item;
                                    const isFounder = msg.is_from_founder;

                                    return (
                                        <div
                                            key={msg.id}
                                            className={`flex flex-col group ${isFounder ? 'items-end' : 'items-start'}`}
                                        >
                                            <div className="mb-2 flex items-center gap-3">
                                                {!isFounder && <span className="text-[11px] font-bold uppercase tracking-widest text-[#4468BB]">Audit Lead</span>}
                                                <span className="text-[11px] font-medium text-[#455987] opacity-60 group-hover:opacity-100 transition-opacity">
                                                    {msg.created_at}
                                                </span>
                                                {isFounder && <span className="text-[11px] font-bold uppercase tracking-widest text-[#788CBA]">Authorized Founder</span>}
                                            </div>

                                            <div
                                                className={[
                                                    'max-w-[80%] rounded-lg px-5 py-4 text-[14px] leading-relaxed relative',
                                                    isFounder
                                                        ? 'bg-[#1B294B] text-[#ECF0F9] border border-[#4468BB]/20'
                                                        : 'bg-[#0C1427] text-[#BCC5DC] border border-[#232C43]',
                                                    msg.is_optimistic && 'opacity-60 grayscale-[0.5]'
                                                ].join(' ')}
                                            >
                                                {msg.body && (
                                                    <p className="whitespace-pre-wrap">{msg.body}</p>
                                                )}

                                                {msg.has_attachment && (
                                                    <div className="mt-4 flex items-center gap-3 rounded-md bg-[#080B11]/60 border border-[#232C43] p-3 transition-colors hover:border-[#4468BB]/30">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded bg-[#101623] border border-[#232C43] shadow-inner">
                                                            <FileText className="size-5 text-[#4468BB]" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="truncate text-[13px] font-medium text-[#ECF0F9]">{msg.attachment_filename}</p>
                                                            {msg.attachment_size && (
                                                                <p className="text-[11px] font-bold text-[#455987] uppercase mt-0.5 tracking-tighter">{msg.attachment_size}</p>
                                                            )}
                                                        </div>
                                                        <a
                                                            href={msg.is_optimistic ? '#' : route('founder.messages.attachment.download', { message: msg.id })}
                                                            className="rounded-md bg-[#101623] p-2 text-[#788CBA] hover:text-white border border-transparent hover:border-[#232C43] transition-all"
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
                        <div className="border-t border-[#232C43] bg-[#0C1427]/40 p-6">
                            
                            <AnimatePresence>
                                {attachment && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="mb-4 inline-flex items-center gap-3 rounded-md border border-[#4468BB]/40 bg-[#1B294B] px-4 py-2 text-[12px] text-[#ECF0F9]"
                                    >
                                        <Paperclip className="size-4 text-[#4468BB]" />
                                        <span className="truncate max-w-[240px] font-medium">{attachment.name}</span>
                                        <button
                                            type="button"
                                            onClick={removeAttachment}
                                            className="ml-2 rounded-full p-1 transition-colors hover:bg-white/10"
                                        >
                                            <X className="size-4" />
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {errors.body && <p className="mb-3 text-[13px] text-red-400 font-medium">{errors.body}</p>}
                            {errors.attachment && <p className="mb-3 text-[13px] text-red-400 font-medium">{errors.attachment}</p>}

                            <div className="relative group">
                                <Textarea
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Enter audit inquiry or engagement update..."
                                    className="min-h-[120px] max-h-[300px] w-full resize-none rounded-xl border-[#232C43] bg-[#080B11]/60 p-5 text-[15px] text-[#ECF0F9] placeholder:text-[#455987] focus:ring-1 focus:ring-[#4468BB]/50 transition-all group-hover:border-[#4468BB]/20"
                                />
                                
                                <div className="absolute bottom-5 right-5 flex items-center gap-5">
                                    <div className="text-[12px] font-bold tracking-tighter text-[#455987]">
                                        {body.length} / 2000
                                    </div>
                                    
                                    <div className="flex items-center gap-3 border-l border-[#232C43] pl-5">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="rounded-lg p-2.5 text-[#576FA8] transition-all hover:bg-[#1B294B] hover:text-[#ECF0F9] border border-transparent hover:border-[#4468BB]/20"
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
                                            className={[
                                                'flex h-11 items-center justify-center gap-3 rounded-lg px-6 text-[13px] font-bold uppercase tracking-widest transition-all',
                                                (body.trim() || attachment) && !processing
                                                    ? 'bg-[#4468BB] text-white hover:bg-[#365396] shadow-lg shadow-[#4468BB]/20 active:scale-[0.98]'
                                                    : 'bg-[#232C43] text-[#455987] cursor-not-allowed',
                                            ].join(' ')}
                                        >
                                            {processing ? (
                                                <Loader2 className="size-4.5 animate-spin" />
                                            ) : (
                                                <Send className="size-4.5" />
                                            )}
                                            Post Update
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between text-[11px] text-[#455987]">
                                <div className="flex items-center gap-2">
                                    <div className="h-1 w-1 rounded-full bg-[#4468BB]" />
                                    Secure Connection
                                </div>
                                <div>
                                    Press <kbd className="rounded bg-[#101623] px-1.5 py-0.5 border border-[#232C43] mx-1">Enter</kbd> to post update
                                </div>
                            </div>
                        </div>
                    </div>
                </FadeUp>
            </div>
        </FounderLayout>
    );
}
