import type { Metadata } from 'next';
import { PageHeader } from '@/components/studio/PageHeader';
import { TeamForm } from '@/components/studio/team/TeamForm';
import { createTeamAction } from '@/lib/studio/actions/team';

export const metadata: Metadata = { title: 'New Team member — HubZero Studio' };

export default function NewTeamMemberPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="New Team member"
        description="A reference ID is assigned automatically on save (§27). An Engineering Profile, if earned, is created separately and links back here."
      />
      <TeamForm action={createTeamAction} submitLabel="Create Team member" />
    </div>
  );
}
