import { Head, Link } from '@inertiajs/react';

interface ErrorProps {
    status: number;
    title: string;
    message: string;
    primaryLabel?: string;
    primaryHref?: string;
}

/**
 * A single, on-brand page that renders every HTTP error (429, 419, 404, 403, 5xx)
 * with plain-language guidance and a clear way forward — replacing Laravel's raw
 * status page that confused users mid-flow.
 */
export default function ErrorPage({ status, title, message, primaryLabel, primaryHref }: ErrorProps) {
    const isServerError = status >= 500;
    const goBack = () => {
        if (typeof window !== 'undefined') {
            window.history.back();
        }
    };

    return (
        <DiagnosticShell status={status} isServerError={isServerError}>
            <Head title={`${status} — ${title}`} />

            <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[520px] flex-col items-center justify-center px-5 py-16 text-center">
                <img src="/pinpoint-logo.png" alt="Pinpoint" className="h-8 w-auto" />

                <p className="font-display mt-10 text-[5.5rem] leading-none font-bold tracking-tight text-[#3A54A5] sm:text-[7rem]">{status}</p>

                <h1 className="font-display mt-2 text-[1.6rem] leading-tight font-bold tracking-tight text-zinc-950 sm:text-[1.9rem]">{title}</h1>

                <p className="mt-4 max-w-[42ch] text-[15px] leading-relaxed text-zinc-600">{message}</p>

                <div className="mt-9 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
                    {primaryHref ? (
                        <a
                            href={primaryHref}
                            className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#3A54A5] px-6 text-[14px] font-semibold text-white transition-colors hover:bg-[#2D4182] sm:w-auto"
                        >
                            {primaryLabel ?? 'Try again'}
                        </a>
                    ) : (
                        <button
                            type="button"
                            onClick={goBack}
                            className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#3A54A5] px-6 text-[14px] font-semibold text-white transition-colors hover:bg-[#2D4182] sm:w-auto"
                        >
                            {primaryLabel ?? 'Go back'}
                        </button>
                    )}

                    <Link
                        href="/"
                        className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 text-[14px] font-semibold text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50 sm:w-auto"
                    >
                        Return home
                    </Link>
                </div>

                {isServerError && <p className="mt-8 text-[12px] text-zinc-400">Reference code {status} — safe to share with the Pinpoint team.</p>}
            </div>
        </DiagnosticShell>
    );
}

function DiagnosticShell({ children, status, isServerError }: { children: React.ReactNode; status: number; isServerError: boolean }) {
    return (
        <div className="relative flex min-h-screen flex-col overflow-hidden bg-white">
            {/* Soft brand glow, mirroring the onboarding aesthetic */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-0"
                style={{
                    background: isServerError
                        ? 'radial-gradient(60% 50% at 50% 0%, rgba(58, 84, 165, 0.10) 0%, rgba(255, 255, 255, 0) 70%)'
                        : status === 429
                          ? 'radial-gradient(60% 50% at 50% 0%, rgba(234, 179, 8, 0.10) 0%, rgba(255, 255, 255, 0) 70%)'
                          : 'radial-gradient(60% 50% at 50% 0%, rgba(58, 84, 165, 0.08) 0%, rgba(255, 255, 255, 0) 70%)',
                }}
            />
            {children}
        </div>
    );
}
