import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/admin-layout';
import { Head, router } from '@inertiajs/react';
import { Eye, EyeOff, FileCheck2, FilePenLine, Save, X } from 'lucide-react';
import { Fragment, useState } from 'react';

type Profile = {
    id: number;
    company_name: string | null;
    sector: string | null;
    overall_score: number | null;
    spotlight_one_liner: string;
    spotlight_summary: string;
    has_reviewed_pitch_deck: boolean;
    is_published: boolean;
    verified_badges_count: number;
};

export default function SpotlightIndex({ profiles }: { profiles: Profile[] }) {
    const [editingProfileId, setEditingProfileId] = useState<number | null>(null);
    const [draft, setDraft] = useState({ spotlight_one_liner: '', spotlight_summary: '' });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const updatePublishState = (profile: Profile, publish: boolean) => {
        router.patch(route('admin.spotlight.update', profile.id), { publish }, { preserveScroll: true });
    };

    const beginEditing = (profile: Profile) => {
        setEditingProfileId(profile.id);
        setDraft({
            spotlight_one_liner: profile.spotlight_one_liner,
            spotlight_summary: profile.spotlight_summary,
        });
        setErrors({});
    };

    const saveContent = (profile: Profile) => {
        router.patch(route('admin.spotlight.update', profile.id), draft, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingProfileId(null);
                setErrors({});
            },
            onError: (validationErrors) => setErrors(validationErrors as Record<string, string>),
        });
    };

    return (
        <AdminLayout>
            <Head title="Spotlight management" />

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="flex flex-col justify-between gap-4 border-b border-zinc-200 pb-6 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-xs font-bold tracking-[0.16em] text-[#3A54A5] uppercase">Dealflow</p>
                        <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-950">Spotlight management</h1>
                        <p className="mt-2 text-sm text-zinc-600">
                            Review investor-facing copy, then publish only PARAGON-complete startups with reviewed materials.
                        </p>
                    </div>
                    <p className="text-sm font-semibold text-zinc-500">
                        {profiles.filter((profile) => profile.is_published).length} currently published
                    </p>
                </div>

                <div className="mt-7 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_16px_36px_rgba(33,56,120,0.06)]">
                    <table className="w-full min-w-[860px] text-left">
                        <thead className="bg-zinc-50 text-xs font-bold tracking-wider text-zinc-500 uppercase">
                            <tr>
                                <th className="px-6 py-4">Startup</th>
                                <th className="px-6 py-4">Readiness</th>
                                <th className="px-6 py-4">Pitch deck</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {profiles.map((profile) => (
                                <Fragment key={profile.id}>
                                    <tr key={profile.id} className="border-t border-zinc-100">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-zinc-950">{profile.company_name ?? 'Unnamed startup'}</p>
                                            <p className="mt-1 max-w-md text-sm text-zinc-600">{profile.spotlight_one_liner}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-zinc-600">
                                            <p>{profile.sector ?? 'Sector pending'}</p>
                                            <p className="mt-1 text-xs text-zinc-500">
                                                Score {profile.overall_score ?? 'N/A'} | {profile.verified_badges_count} badges
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${profile.has_reviewed_pitch_deck ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}
                                            >
                                                <FileCheck2 className="size-3.5" />
                                                {profile.has_reviewed_pitch_deck ? 'Reviewed' : 'Needs review'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${profile.is_published ? 'bg-[#3A54A5]/10 text-[#3A54A5]' : 'bg-zinc-100 text-zinc-600'}`}
                                            >
                                                {profile.is_published ? 'Published' : 'Private'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="rounded-xl border-zinc-200 bg-white"
                                                    onClick={() => beginEditing(profile)}
                                                >
                                                    <FilePenLine data-icon="inline-start" /> Edit copy
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant={profile.is_published ? 'outline' : 'default'}
                                                    className={profile.is_published ? 'rounded-xl' : 'rounded-xl bg-[#3A54A5] hover:bg-[#2D4182]'}
                                                    disabled={!profile.is_published && !profile.has_reviewed_pitch_deck}
                                                    onClick={() => updatePublishState(profile, !profile.is_published)}
                                                >
                                                    {profile.is_published ? (
                                                        <>
                                                            <EyeOff data-icon="inline-start" /> Unpublish
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Eye data-icon="inline-start" /> Publish
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                    {editingProfileId === profile.id && (
                                        <tr key={`${profile.id}-editor`} className="border-t border-zinc-100 bg-zinc-50/70">
                                            <td colSpan={5} className="px-6 py-5">
                                                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)_auto] lg:items-end">
                                                    <label className="block text-sm font-bold text-zinc-900">
                                                        One-liner{' '}
                                                        <span className="font-medium text-zinc-500">{draft.spotlight_one_liner.length}/120</span>
                                                        <input
                                                            value={draft.spotlight_one_liner}
                                                            onChange={(event) => setDraft({ ...draft, spotlight_one_liner: event.target.value })}
                                                            maxLength={120}
                                                            className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-950 focus:border-[#3A54A5] focus:ring-2 focus:ring-[#3A54A5]/20 focus:outline-none"
                                                        />
                                                        {errors.spotlight_one_liner && (
                                                            <p className="mt-2 text-xs font-medium text-rose-600">{errors.spotlight_one_liner}</p>
                                                        )}
                                                    </label>
                                                    <label className="block text-sm font-bold text-zinc-900">
                                                        Summary{' '}
                                                        <span className="font-medium text-zinc-500">{draft.spotlight_summary.length}/500</span>
                                                        <textarea
                                                            value={draft.spotlight_summary}
                                                            onChange={(event) => setDraft({ ...draft, spotlight_summary: event.target.value })}
                                                            maxLength={500}
                                                            rows={3}
                                                            className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm leading-6 text-zinc-950 focus:border-[#3A54A5] focus:ring-2 focus:ring-[#3A54A5]/20 focus:outline-none"
                                                        />
                                                        {errors.spotlight_summary && (
                                                            <p className="mt-2 text-xs font-medium text-rose-600">{errors.spotlight_summary}</p>
                                                        )}
                                                    </label>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            className="rounded-xl bg-[#3A54A5] hover:bg-[#2D4182]"
                                                            onClick={() => saveContent(profile)}
                                                        >
                                                            <Save data-icon="inline-start" /> Save copy
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="rounded-xl border-zinc-200 bg-white"
                                                            onClick={() => {
                                                                setEditingProfileId(null);
                                                                setErrors({});
                                                            }}
                                                        >
                                                            <X data-icon="inline-start" /> Cancel
                                                        </Button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            ))}
                        </tbody>
                    </table>

                    {profiles.length === 0 && (
                        <p className="p-12 text-center text-sm text-zinc-500">No founder Spotlight profiles are ready for review.</p>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
