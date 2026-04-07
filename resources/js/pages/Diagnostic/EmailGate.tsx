import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

import DiagnosticLayout from '@/layouts/diagnostic-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface PageProps {
    blurred_score: number;
}

// ─── Blurred hexagon placeholder ──────────────────────────────────────────────

function BlurredRadar() {
    const cx = 100, cy = 100, r = 72;
    const count = 7;

    function pt(i: number, radius: number): string {
        const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
        return `${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`;
    }

    const gridLevels = [0.3, 0.55, 0.8, 1.0];
    const dataRadii  = [0.55, 0.75, 0.45, 0.85, 0.65, 0.5, 0.7];
    const dataPath   = Array.from({ length: count })
        .map((_, i) => `${i === 0 ? 'M' : 'L'}${pt(i, r * dataRadii[i])}`)
        .join(' ') + ' Z';

    return (
        <svg
            viewBox="0 0 200 200"
            className="w-full max-w-[180px]"
            aria-hidden="true"
            style={{ filter: 'blur(8px)', opacity: 0.35 }}
        >
            {gridLevels.map((level, li) => {
                const path = Array.from({ length: count })
                    .map((_, i) => `${i === 0 ? 'M' : 'L'}${pt(i, r * level)}`)
                    .join(' ') + ' Z';
                return <path key={li} d={path} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />;
            })}
            {Array.from({ length: count }).map((_, i) => {
                const [lx, ly] = pt(i, r).split(',').map(Number);
                return (
                    <line
                        key={i}
                        x1={cx} y1={cy}
                        x2={lx} y2={ly}
                        stroke="rgba(255,255,255,0.12)"
                        strokeWidth="1"
                    />
                );
            })}
            <path d={dataPath} fill="rgba(37,99,235,0.25)" stroke="rgba(37,99,235,0.6)" strokeWidth="1.5" />
        </svg>
    );
}

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function EmailGate({ blurred_score }: PageProps) {
    const form = useForm({ email: '' });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.post(route('diagnostic.capture-email'));
    }

    return (
        <>
            <Head title="Unlock Your Score — PARAGON Diagnostic" />

            <DiagnosticLayout>
                <div className="flex min-h-[calc(100vh-72px)] flex-col items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">

                    {/* Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 28 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                    >
                        <Card className="waitlist-panel overflow-hidden rounded-3xl border border-white/[0.06] bg-[#111] p-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] md:rounded-[1.75rem]">

                            {/* Top — blurred score + radar */}
                            <CardContent className="flex flex-col items-center border-b border-white/[0.06] px-8 pb-8 pt-10 text-center">

                                {/* "PARAGON Score Ready" badge with pulsing green dot */}
                                <div className="mb-5 flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5">
                                    <span className="relative flex size-2">
                                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                        <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                                    </span>
                                    <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-400">
                                        PARAGON Score Ready
                                    </span>
                                </div>

                                {/* Headline */}
                                <h1 className="mb-2 font-display text-2xl font-bold text-white">
                                    Your results are waiting.
                                </h1>
                                <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                                    Enter your email to unlock your full diagnostic and radar chart.
                                </p>

                                {/* Blurred score + lock overlay */}
                                <div className="relative mb-2 flex select-none flex-col items-center">
                                    <span
                                        className="font-sans text-[5.5rem] font-black leading-none text-foreground"
                                        style={{ filter: 'blur(12px)', opacity: 0.65 }}
                                        aria-hidden="true"
                                    >
                                        {String(blurred_score).padStart(2, '0')}
                                    </span>
                                    {/* Lock overlay */}
                                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1.5">
                                        <Lock className="size-5 text-muted-foreground" />
                                        <span className="text-xs font-medium text-muted-foreground">Unlock to reveal</span>
                                    </div>
                                </div>

                                {/* Blurred radar */}
                                <div className="mt-2 flex items-center justify-center">
                                    <BlurredRadar />
                                </div>
                            </CardContent>

                            {/* Bottom — email form */}
                            <CardContent className="px-8 pb-8 pt-7">
                                <form onSubmit={submit} noValidate className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <Label htmlFor="email" className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                                            Email address
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            autoComplete="email"
                                            // eslint-disable-next-line jsx-a11y/no-autofocus
                                            autoFocus
                                            placeholder="founder@startup.com"
                                            value={form.data.email}
                                            onChange={e => form.setData('email', e.target.value)}
                                            aria-invalid={!!form.errors.email}
                                            className="waitlist-input focus:border-[#2563EB]/50 focus:ring-[#2563EB]/15 h-12"
                                        />
                                        {form.errors.email && (
                                            <p className="text-xs text-destructive">{form.errors.email}</p>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={form.processing || !form.data.email.trim()}
                                        className="group relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl px-5 py-4 text-[13px] font-bold uppercase tracking-[0.18em] text-white outline-none transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60"
                                        style={{
                                            background: '#2563EB',
                                            boxShadow: '0 0 28px rgba(37,99,235,0.35)',
                                        }}
                                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.1)'; }}
                                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.filter = ''; }}
                                    >
                                        <span className="waitlist-shimmer absolute inset-0 opacity-50 mix-blend-overlay transition-opacity duration-300 group-hover:opacity-100" />
                                        <span className="relative z-10 flex items-center gap-2">
                                            {form.processing ? (
                                                <>
                                                    <span className="size-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                                                    Unlocking…
                                                </>
                                            ) : (
                                                'Unlock My Results →'
                                            )}
                                        </span>
                                    </button>
                                </form>

                                <p className="mt-4 text-center text-[11px] text-muted-foreground/60">
                                    No spam. No account required.
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
                </div>
            </DiagnosticLayout>
        </>
    );
}
