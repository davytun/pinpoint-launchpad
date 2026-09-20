import { InvestorHeader } from '@/components/investor-header';
import { cn } from '@/lib/utils';
import { Icon } from '@iconify/react';
import { Head, Link } from '@inertiajs/react';

type KycStatus = 'not_submitted' | 'pending' | 'approved' | 'rejected';

interface PageProps {
    investor: {
        full_name: string;
        email: string;
        kyc_status: KycStatus;
        can_access_protected: boolean;
    };
    stats: {
        published_startups: number;
        open_interests: number;
        active_data_rooms: number;
        open_diligence: number;
    };
    next_step: {
        title: string;
        body: string;
        cta_label: string;
        cta_route: string;
        tone: 'amber' | 'blue' | 'emerald';
    };
}

function kycLabel(status: KycStatus) {
    switch (status) {
        case 'approved':
            return { text: 'Verified', className: 'border-emerald-200 bg-emerald-50 text-emerald-700' };
        case 'pending':
            return { text: 'Pending review', className: 'border-amber-200 bg-amber-50 text-amber-800' };
        case 'rejected':
            return { text: 'Needs update', className: 'border-rose-200 bg-rose-50 text-rose-700' };
        default:
            return { text: 'Not submitted', className: 'border-zinc-200 bg-zinc-50 text-zinc-600' };
    }
}

function toneClasses(tone: PageProps['next_step']['tone']) {
    switch (tone) {
        case 'amber':
            return 'border-amber-200/80 bg-amber-50';
        case 'blue':
            return 'border-blue-200/80 bg-blue-50';
        default:
            return 'border-emerald-200/80 bg-emerald-50';
    }
}

function toneButton(tone: PageProps['next_step']['tone']) {
    switch (tone) {
        case 'amber':
            return 'bg-amber-900 text-white hover:bg-amber-800';
        case 'blue':
            return 'bg-[#3A54A5] text-white hover:bg-[#2D4182]';
        default:
            return 'bg-zinc-950 text-white hover:bg-zinc-800';
    }
}

export default function InvestorDashboard({ investor, stats, next_step }: PageProps) {
    const kyc = kycLabel(investor.kyc_status);

    const shortcuts = [
        {
            href: route('investor.spotlight.index'),
            icon: 'solar:stars-linear',
            title: 'Spotlight',
            body: `${stats.published_startups} verified startup${stats.published_startups === 1 ? '' : 's'} to explore`,
            locked: false,
        },
        {
            href: route('investor.interests.index'),
            icon: 'solar:hand-heart-linear',
            title: 'Interests',
            body: `${stats.open_interests} open engagement${stats.open_interests === 1 ? '' : 's'}`,
            locked: false,
        },
        {
            href: investor.can_access_protected ? route('investor.data-rooms.index') : route('investor.kyc.create'),
            icon: 'solar:folder-with-files-linear',
            title: 'Data Rooms',
            body: investor.can_access_protected
                ? `${stats.active_data_rooms} active room${stats.active_data_rooms === 1 ? '' : 's'}`
                : 'Unlocks after KYC approval',
            locked: !investor.can_access_protected,
        },
        {
            href: route('investor.diligence.index'),
            icon: 'solar:document-medicine-linear',
            title: 'Diligence',
            body: `${stats.open_diligence} open thread${stats.open_diligence === 1 ? '' : 's'}`,
            locked: false,
        },
    ];

    return (
        <main className="min-h-screen bg-[#F4F4F6] text-zinc-900 antialiased selection:bg-zinc-900 selection:text-white">
            <Head title="Investor Home" />
            <InvestorHeader activeTab="home" />

            <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-bold tracking-[0.18em] text-zinc-400 uppercase">Investor portal</p>
                        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
                            Welcome, {investor.full_name}
                        </h1>
                        <p className="mt-2 text-sm text-zinc-500">Here is where you stand and what to do next.</p>
                    </div>
                    <span className={cn('inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-semibold', kyc.className)}>
                        Identity: {kyc.text}
                    </span>
                </div>

                <div className={cn('mb-8 rounded-2xl border p-5 sm:p-6', toneClasses(next_step.tone))}>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="max-w-2xl">
                            <p className="text-[11px] font-bold tracking-[0.16em] text-zinc-500 uppercase">Next step</p>
                            <h2 className="mt-1 text-lg font-bold text-zinc-950">{next_step.title}</h2>
                            <p className="mt-1.5 text-sm leading-relaxed text-zinc-700">{next_step.body}</p>
                        </div>
                        <Link
                            href={route(next_step.cta_route)}
                            className={cn(
                                'inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition',
                                toneButton(next_step.tone),
                            )}
                        >
                            {next_step.cta_label}
                            <Icon icon="solar:arrow-right-linear" className="size-4" />
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                        { label: 'Startups live', value: stats.published_startups },
                        { label: 'Open interests', value: stats.open_interests },
                        { label: 'Data rooms', value: stats.active_data_rooms },
                        { label: 'Diligence', value: stats.open_diligence },
                    ].map((card) => (
                        <div key={card.label} className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-2xs">
                            <p className="text-[11px] font-semibold tracking-wide text-zinc-400 uppercase">{card.label}</p>
                            <p className="mt-2 font-mono text-2xl font-bold text-zinc-950">{card.value}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {shortcuts.map((item) => (
                        <Link
                            key={item.title}
                            href={item.href}
                            className="group flex items-start justify-between gap-4 rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs transition hover:border-zinc-400"
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-800 transition group-hover:bg-zinc-950 group-hover:text-white">
                                    <Icon icon={item.locked ? 'solar:lock-linear' : item.icon} className="size-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-zinc-950">{item.title}</h3>
                                    <p className="mt-1 text-xs text-zinc-500">{item.body}</p>
                                </div>
                            </div>
                            <Icon icon="solar:arrow-right-linear" className="mt-1 size-4 shrink-0 text-zinc-400 transition group-hover:text-zinc-950" />
                        </Link>
                    ))}
                </div>

                <p className="mt-10 text-center text-xs text-zinc-400">
                    Pinpoint mediates every founder engagement. You will not message founders directly from this portal.
                </p>
            </section>
        </main>
    );
}
