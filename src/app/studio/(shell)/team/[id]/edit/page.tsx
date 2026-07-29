import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/studio/PageHeader';
import { TeamForm } from '@/components/studio/team/TeamForm';
import { mediaRepository } from '@/lib/db/repositories/media';
import { teamRepository } from '@/lib/db/repositories/team';
import { updateTeamAction } from '@/lib/studio/actions/team';
import { toMediaAssetDTO } from '@/lib/media/dto';

export const metadata: Metadata = { title: 'Edit Team member — HubZero Studio' };

export default async function EditTeamMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = await teamRepository.findById(id);
  if (!member) {
    notFound();
  }

  const portrait = member.portraitId
    ? await mediaRepository.findById(member.portraitId.toString())
    : null;
  const boundUpdateAction = updateTeamAction.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={`Edit — ${member.name}`} />
      <TeamForm
        action={boundUpdateAction}
        submitLabel="Save changes"
        initialValues={{
          name: member.name,
          role: member.role,
          bio: member.bio,
          group: member.group,
          order: member.order,
          founder: member.founder,
          publicCategory: member.publicCategory,
          engineeringProfileEligible: member.engineeringProfileEligible,
          joinedAt: member.joinedAt ? member.joinedAt.toISOString().slice(0, 10) : undefined,
          publicProfile: member.publicProfile,
          socialLinks: member.socialLinks,
        }}
        initialPortrait={portrait ? toMediaAssetDTO(portrait) : undefined}
      />
    </div>
  );
}
