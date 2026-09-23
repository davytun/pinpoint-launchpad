import { InvestorHeader } from '@/components/investor-header';
import { cn } from '@/lib/utils';
import { Icon } from '@iconify/react';
import { Head, Link } from '@inertiajs/react';

type Interest = {
    id: string;
    type: 'more_details' | 'founder_call' | 'data_room_access';
    message: string | null;
    status: 'pending' | 'approved' | 'denied';
    investor_facing_status?: string;
    founder_decision?: string | null;
    created_at: string;
    scheduled_at?: string | null;
    completed_at?: string | null;
    meeting_link?: string | null;
    introduction_status: 'not_requested' | 'requested' | 'approved' | 'scheduled' | 'completed' | 'denied';
    data_room_status: 'granted' | 'revoked' | 'none';
    profile: {
        slug: string;
        sector?: string | null;
        spotlight_one_liner?: string | null;
        founder: {
            company_name: string;
        } | null;
    };
};

const PLACEHOLDER_COPY = new Set([
    'What your venture builds and solves, in one compelling sentence...',
    'Describe the company, market opportunity, business model, and milestones achieved...',
]);

function formatDate(iso?: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(iso?: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

function typeLabel(type: Interest['type']) {
    return {
        data_room_access: 'Data room',
        founder_call: 'Founder call',
        more_details: 'Question',
    }[type];
}

function resolveStatus(interest: Interest): string {
    if (interest.status === 'denied' || interest.founder_decision === 'declined') {
        return 'Declined';
    }
    if (interest.type === 'data_room_access' && interest.data_room_status === 'granted') {
        return 'Open';
    }
    if (interest.type === 'data_room_access' && interest.data_room_status === 'revoked') {
        return 'Revoked';
    }
    if (interest.type === 'founder_call' && interest.completed_at) {
        return 'Done';
    }
    if (interest.type === 'founder_call' && interest.scheduled_at) {
        return 'Scheduled';
    }
    if (interest.founder_decision === 'approved' || interest.investor_facing_status === 'Founder Coordination in Progress') {
        if (interest.type === 'data_room_access') {
            return 'Activating access';
        }
        if (interest.type === 'founder_call') {
            return 'Scheduling call';
        }
        return 'Pinpoint coordinating';
    }
    if (interest.investor_facing_status === 'Data Room Granted') {
        return 'Open';
    }

    return 'In review';
}

function statusTone(status: string): 'ok' | 'wait' | 'bad' {
    if (['Open', 'Scheduled', 'Done', 'Approved'].includes(status)) return 'ok';
    if (['Declined', 'Revoked'].includes(status)) return 'bad';
    return 'wait';
}

function realOneLiner(value?: string | null): string | null {
    const trimmed = value?.trim() ?? '';
    if (!trimmed || PLACEHOLDER_COPY.has(trimmed)) return null;
    return trimmed;
}

function statusHint(interest: Interest, status: string): string | null {
    if (status === 'Activating access') {
        return 'Founder authorized. Pinpoint will open the data room.';
    }
    if (status === 'Scheduling call') {
        return 'Founder authorized. Pinpoint will set the call time.';
    }
    if (status === 'Pinpoint coordinating') {
        return 'Founder authorized. Pinpoint is handling next steps.';
    }
    if (status === 'In review') {
        return 'Pinpoint is reviewing this with the founder.';
    }
    return null;
}

export default function Interests({ interests }: { interests: Interest[] }) {
    return (
        <main className="min-h-screen bg-stone-50 text-zinc-900 antialiased">
            <Head title="My Interests" />
            <InvestorHeader activeTab="interests" />

            <section className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
                <header className="mb-6">
                    <h1 className="font-display text-[1.75rem] font-bold tracking-tight text-zinc-950">My Interests</h1>
                    <p className="mt-1 text-[14px] text-zinc-500">Mediated by Pinpoint.</p>
                </header>

                {interests.length === 0 ? (
                    <div className="border-t border-zinc-200 pt-8">
                        <p className="text-[15px] text-zinc-600">No requests yet.</p>
                        <Link
                            href={route('investor.spotlight.index')}
                            className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#3A54A5] hover:text-[#2D4182]"
                        >
                            Browse Spotlight
                            <Icon icon="solar:arrow-right-linear" className="size-3.5" />
                        </Link>
                    </div>
                ) : (
                    <ul className="divide-y divide-zinc-200 border-t border-zinc-200">
                        {interests.map((interest) => {
                            const status = resolveStatus(interest);
                            const tone = statusTone(status);
                            const oneLiner = realOneLiner(interest.profile?.spotlight_one_liner);
                            const company = interest.profile?.founder?.company_name ?? 'Startup';
                            const hint = statusHint(interest, status);
                            const isFounderCall = interest.type === 'founder_call';
                            const isDataRoom = interest.type === 'data_room_access';
                            const primaryAction =
                                isDataRoom && interest.data_room_status === 'granted' ? (
                                    <Link
                                        href={route('investor.data-rooms.show', interest.profile.slug)}
                                        className="inline-flex min-h-9 items-center rounded-lg bg-[#3A54A5] px-3.5 text-[13px] font-semibold text-white hover:bg-[#2D4182]"
                                    >
                                        Open data room
                                    </Link>
                                ) : isFounderCall && interest.scheduled_at && !interest.completed_at && interest.meeting_link ? (
                                    <a
                                        href={interest.meeting_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-[#3A54A5] px-3.5 text-[13px] font-semibold text-white hover:bg-[#2D4182]"
                                    >
                                        Join meeting
                                        <Icon icon="solar:arrow-right-up-linear" className="size-3.5" />
                                    </a>
                                ) : isFounderCall && interest.completed_at ? (
                                    <Link
                                        href={route('investor.diligence.index')}
                                        className="inline-flex min-h-9 items-center rounded-lg bg-[#3A54A5] px-3.5 text-[13px] font-semibold text-white hover:bg-[#2D4182]"
                                    >
                                        Submit diligence
                                    </Link>
                                ) : null;

                            return (
                                <li key={interest.id} className="py-4">
                                    <div className="flex items-baseline justify-between gap-3">
                                        <h2 className="min-w-0 truncate text-[15px] font-semibold text-zinc-950">
                                            {company}
                                            <span className="ml-2 font-normal text-zinc-400">{typeLabel(interest.type)}</span>
                                        </h2>
                                        <span
                                            className={cn(
                                                'shrink-0 text-[12px] font-semibold',
                                                tone === 'ok' && 'text-emerald-700',
                                                tone === 'bad' && 'text-rose-700',
                                                tone === 'wait' && 'text-[#3A54A5]',
                                            )}
                                        >
                                            {status}
                                        </span>
                                    </div>

                                    <p className="mt-1 text-[12px] text-zinc-400">
                                        {[interest.profile?.sector, `Submitted ${formatDate(interest.created_at)}`]
                                            .filter(Boolean)
                                            .join(' · ')}
                                    </p>

                                    {oneLiner && (
                                        <p className="mt-2 text-[13px] leading-snug text-zinc-500">{oneLiner}</p>
                                    )}

                                    {interest.message && (
                                        <p className="mt-2 text-[13px] leading-snug text-zinc-600">“{interest.message}”</p>
                                    )}

                                    {hint && <p className="mt-2 text-[13px] leading-snug text-zinc-500">{hint}</p>}

                                    {isFounderCall && interest.scheduled_at && !interest.completed_at && (
                                        <p className="mt-2 text-[13px] font-medium text-zinc-700">
                                            {formatDateTime(interest.scheduled_at)}
                                        </p>
                                    )}

                                    {isDataRoom && interest.data_room_status === 'revoked' && (
                                        <p className="mt-2 text-[13px] text-rose-700">Access was revoked by Pinpoint.</p>
                                    )}

                                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                                        {primaryAction}
                                        <Link
                                            href={route('investor.spotlight.show', interest.profile.slug)}
                                            className="text-[13px] font-medium text-zinc-400 hover:text-zinc-700"
                                        >
                                            Spotlight
                                        </Link>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>
        </main>
    );
}
