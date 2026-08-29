import { PinpointLogo } from '@/components/pinpoint-logo';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowRight, BadgeCheck, Bell, Clock3, FileLock2, ShieldCheck } from 'lucide-react';

type Investor = {
    kyc_status: 'not_submitted' | 'pending' | 'approved' | 'rejected';
    profile: { full_name: string };
    kyc_submissions: { review_notes: string | null }[];
};
const accessItems = [
    { label: 'Startup summaries', detail: 'Available as opportunities are published.', icon: ShieldCheck },
    { label: 'Pitch decks', detail: 'Available after KYC approval.', icon: FileLock2 },
    { label: 'Interest and data rooms', detail: 'Available after KYC approval and founder grant.', icon: BadgeCheck },
];

export default function Dashboard({ investor }: { investor: Investor }) {
    const unreadNotifications =
        usePage<{ platform_unread_notifications?: { investor?: number } }>().props.platform_unread_notifications?.investor ?? 0;
    const approved = investor.kyc_status === 'approved';
    const pending = investor.kyc_status === 'pending';
    const rejected = investor.kyc_status === 'rejected';
    const title = approved
        ? 'Protected access is ready.'
        : pending
          ? 'Your KYC is being reviewed.'
          : rejected
            ? 'Your KYC needs attention.'
            : 'Complete KYC to unlock protected access.';
    const description = approved
        ? 'Your PIN account is verified for pitch decks, interest submissions, and founder-granted data rooms.'
        : pending
          ? 'Compliance is reviewing your document. We will update your access as soon as that review is complete.'
          : rejected
            ? 'Review the compliance note and submit a replacement document.'
            : 'Your account is active. Submit one identity document to continue into protected investor materials.';
    return (
        <main className="min-h-screen bg-[#f4f7ff] text-zinc-950">
            <Head title="Investor dashboard" />
            <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-7">
                <div className="flex items-center gap-8">
                    <PinpointLogo height={24} />
                    <nav className="hidden items-center gap-6 text-sm font-bold text-zinc-600 md:flex">
                        <Link href={route('investor.spotlight.index')} className="hover:text-zinc-950">
                            Spotlight
                        </Link>
                        {approved && (
                            <Link href={route('investor.interests.index')} className="hover:text-zinc-950">
                                My Interests
                            </Link>
                        )}
                        <Link href={route('investor.notifications.index')} className="inline-flex items-center gap-1.5 hover:text-zinc-950">
                            <Bell className="size-4" />
                            Alerts
                            {unreadNotifications > 0 && (
                                <span className="rounded-full bg-[#3A54A5] px-1.5 py-0.5 text-[10px] text-white">{unreadNotifications}</span>
                            )}
                        </Link>
                        {approved && (
                            <Link href={route('investor.data-rooms.index')} className="hover:text-zinc-950">
                                Data Rooms
                            </Link>
                        )}
                    </nav>
                </div>
                <Button variant="ghost" className="rounded-xl" onClick={() => router.post(route('investor.logout'))}>
                    Log out
                </Button>
            </header>
            <section className="mx-auto max-w-5xl px-6 py-12">
                <div className="grid gap-7 lg:grid-cols-[1.15fr_0.85fr]">
                    <div className="rounded-2xl border border-white/80 bg-white p-7 shadow-[0_20px_55px_rgba(33,56,120,0.10)] sm:p-9">
                        <div className="flex items-center justify-between">
                            <div className="flex size-11 items-center justify-center rounded-xl bg-[#3A54A5]/10 text-[#3A54A5]">
                                {approved ? <BadgeCheck /> : <Clock3 />}
                            </div>
                            <Badge variant={rejected ? 'destructive' : approved ? 'default' : 'secondary'}>
                                {investor.kyc_status.replace('_', ' ')}
                            </Badge>
                        </div>
                        <p className="mt-6 text-xs font-bold tracking-[0.16em] text-[#3A54A5] uppercase">Account active</p>
                        <h1 className="mt-3 text-3xl font-black tracking-tight">Welcome, {investor.profile.full_name}.</h1>
                        <h2 className="mt-5 text-xl font-bold">{title}</h2>
                        <p className="mt-3 max-w-2xl leading-7 text-zinc-600">{description}</p>
                        {rejected && (
                            <Alert variant="destructive" className="mt-6">
                                <AlertTitle>Compliance note</AlertTitle>
                                <AlertDescription>
                                    {investor.kyc_submissions[0]?.review_notes ?? 'Please upload a clear, valid replacement document.'}
                                </AlertDescription>
                            </Alert>
                        )}
                        {approved ? (
                            <div className="mt-7 flex flex-wrap gap-3">
                                <Button asChild>
                                    <Link href={route('investor.spotlight.index')}>
                                        Browse Spotlight <ArrowRight data-icon="inline-end" />
                                    </Link>
                                </Button>
                                <Button asChild variant="outline">
                                    <Link href={route('investor.data-rooms.index')}>View Data Rooms</Link>
                                </Button>
                            </div>
                        ) : (
                            <Button asChild className="mt-7">
                                <Link href={route('investor.kyc.create')}>
                                    {pending ? 'View KYC status' : rejected ? 'Replace KYC document' : 'Continue to KYC'}{' '}
                                    <ArrowRight data-icon="inline-end" />
                                </Link>
                            </Button>
                        )}
                    </div>
                    <aside className="rounded-2xl border border-[#3A54A5]/12 bg-[#eef2ff] p-7">
                        <p className="text-xs font-bold tracking-[0.16em] text-[#3A54A5] uppercase">Your access</p>
                        <div className="mt-6 flex flex-col gap-5">
                            {accessItems.map(({ label, detail, icon: Icon }) => (
                                <div key={label} className="flex gap-3">
                                    <Icon className="mt-0.5 size-4 text-[#3A54A5]" />
                                    <div>
                                        <p className="text-sm font-bold">{label}</p>
                                        <p className="mt-1 text-sm text-zinc-600">{detail}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </aside>
                </div>
            </section>
        </main>
    );
}
