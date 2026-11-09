import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, LoaderCircle, RotateCcw, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';

interface PageProps {
    member: {
        id: number;
        name: string;
        email: string;
        role: 'superadmin' | 'analyst' | 'compliance' | 'investor_relations' | 'support';
        two_factor_enabled: boolean;
    };
    user_role: string;
    is_self: boolean;
}

export default function AdminUsersEdit({ member, is_self }: PageProps) {
    const [resetDialogOpen, setResetDialogOpen] = useState(false);
    const { data, setData, patch, processing, errors } = useForm({
        name: member.name,
        role: member.role,
    });
    const twoFactorReset = useForm({ two_factor: '' });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        patch(route('admin.users.update', { user: member.id }));
    }

    function resetTwoFactor() {
        twoFactorReset.delete(route('admin.users.two-factor.destroy', { user: member.id }), {
            onSuccess: () => setResetDialogOpen(false),
        });
    }

    const inputClass =
        'w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-955 placeholder:text-zinc-400 focus:border-[#3A54A5]/60 focus:ring-2 focus:ring-[#3A54A5]/10 focus:outline-none shadow-xs';

    return (
        <AdminLayout>
            <Head title={`Edit ${member.name} — Admin`} />

            <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                <Link
                    href={route('admin.users.index')}
                    className="text-zinc-550 hover:text-zinc-955 mb-6 inline-flex items-center gap-2 text-sm font-bold transition-colors"
                >
                    <ArrowLeft className="size-4" /> Back to Team
                </Link>

                <div className="mb-6">
                    <h1 className="text-zinc-955 text-2xl font-extrabold">Edit Team Member</h1>
                    <p className="text-zinc-555 mt-1 text-sm font-semibold">{member.email}</p>
                </div>

                <form onSubmit={submit} className="max-w-lg space-y-5">
                    <div>
                        <label className="mb-1.5 block text-xs font-bold tracking-widest text-zinc-500 uppercase">Full Name</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            maxLength={100}
                            className={inputClass}
                            required
                        />
                        {errors.name && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-bold tracking-widest text-zinc-500 uppercase">Role</label>
                        <select
                            value={data.role}
                            onChange={(e) => setData('role', e.target.value as typeof data.role)}
                            disabled={is_self}
                            className={cn(inputClass, 'disabled:opacity-50')}
                        >
                            <option value="analyst">Analyst — Founder desk</option>
                            <option value="compliance">Compliance — Investor desk</option>
                            <option value="investor_relations">Investor Relations — Investor desk</option>
                            <option value="superadmin">Super Admin — Platform</option>
                        </select>
                        {is_self && <p className="mt-1 text-xs font-semibold text-amber-600">You cannot change your own role.</p>}
                        {errors.role && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.role}</p>}
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Link
                            href={route('admin.users.index')}
                            className="text-zinc-650 flex-1 rounded-xl border border-zinc-200 bg-white py-2.5 text-center text-sm font-bold shadow-xs transition-colors hover:bg-zinc-50 hover:text-zinc-950"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 rounded-xl bg-[#3A54A5] py-2.5 text-sm font-bold text-white shadow-md shadow-[#3A54A5]/20 transition-colors hover:bg-[#2D4182] hover:shadow-lg disabled:opacity-50"
                        >
                            {processing ? 'Saving…' : 'Save Changes'}
                        </button>
                    </div>
                </form>

                <Card className="mt-10 max-w-lg rounded-xl">
                    <CardHeader className="flex-row items-start justify-between gap-4">
                        <div className="flex flex-col gap-1.5">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <ShieldCheck aria-hidden="true" className="size-4" />
                                Two-factor authentication
                            </CardTitle>
                            <CardDescription>Authenticator protection for this operations account.</CardDescription>
                        </div>
                        <Badge variant={member.two_factor_enabled ? 'default' : 'secondary'}>
                            {member.two_factor_enabled ? 'Enabled' : 'Setup required'}
                        </Badge>
                    </CardHeader>

                    <CardContent className="flex flex-col gap-4">
                        {member.two_factor_enabled ? (
                            <>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    Reset this only if {member.name} has lost access to their authenticator and recovery codes. They will need to set it up again.
                                </p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="self-start"
                                    disabled={is_self}
                                    onClick={() => setResetDialogOpen(true)}
                                >
                                    <RotateCcw data-icon="inline-start" />
                                    Reset two-factor authentication
                                </Button>
                                {is_self ? (
                                    <p className="text-xs text-muted-foreground">Another superadmin must reset your own two-factor authentication.</p>
                                ) : null}
                            </>
                        ) : (
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                This team member will be guided through setup the next time they sign in.
                            </p>
                        )}

                        {twoFactorReset.errors.two_factor ? (
                            <p role="alert" className="text-sm text-destructive">
                                {twoFactorReset.errors.two_factor}
                            </p>
                        ) : null}
                    </CardContent>
                </Card>

                <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Reset two-factor authentication?</DialogTitle>
                            <DialogDescription>
                                This removes {member.name}&apos;s authenticator and recovery codes. Their current admin access will stop until they enroll again.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button type="button" variant="destructive" disabled={twoFactorReset.processing} onClick={resetTwoFactor}>
                                {twoFactorReset.processing ? <LoaderCircle data-icon="inline-start" className="animate-spin" /> : null}
                                {twoFactorReset.processing ? 'Resetting' : 'Reset authentication'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}
