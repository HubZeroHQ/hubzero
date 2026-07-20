import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ConfirmActionDialog } from '@/components/studio/ConfirmActionDialog';
import { AssignLeadForm } from '@/components/studio/leads/AssignLeadForm';
import { LeadNotesForm } from '@/components/studio/leads/LeadNotesForm';
import { LeadStatusButtons } from '@/components/studio/leads/LeadStatusButtons';
import { PageHeader } from '@/components/studio/PageHeader';
import { Tag } from '@/components/ui/Tag';
import { roleHasCapability } from '@/config/permissions';
import { auth } from '@/lib/auth';
import { canActOnEntry } from '@/lib/auth/permissions';
import { leadRepository } from '@/lib/db/repositories/lead';
import { userRepository } from '@/lib/db/repositories/user';
import {
  assignLeadAction,
  deleteLeadAction,
  setLeadArchivedAction,
  updateLeadNotesAction,
  updateLeadStatusAction,
} from '@/lib/studio/actions/lead';
import { formatRelativeTime } from '@/lib/utils/relative-time';

export const metadata: Metadata = { title: 'Lead — HubZero Studio' };

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await leadRepository.findById(id);
  if (!lead) {
    notFound();
  }

  const session = await auth();
  const { role, id: userId } = session!.user;
  const canWork = canActOnEntry(lead, { role, userId });
  const canManage = roleHasCapability(role, 'editAnyEntry');

  const users = canManage ? await userRepository.list() : [];
  const boundUpdateNotes = updateLeadNotesAction.bind(null, id);
  const boundAssign = assignLeadAction.bind(null, id);
  const boundToggleArchived = setLeadArchivedAction.bind(null, id, !lead.archived);
  const boundDelete = deleteLeadAction.bind(null, id);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={lead.name} description={lead.email} />

      <div className="flex flex-wrap items-center gap-3">
        <Tag>{lead.source}</Tag>
        {lead.archived ? <Tag>Archived</Tag> : null}
        <span className="text-text-muted text-xs">
          Received {formatRelativeTime(lead.createdAt)}
        </span>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">Message</h2>
        <p className="text-text-secondary text-sm whitespace-pre-line">{lead.message}</p>
      </section>

      {canWork ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">Status</h2>
          <LeadStatusButtons leadId={id} status={lead.status} action={updateLeadStatusAction} />
        </section>
      ) : null}

      {canManage ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">
            Assignment
          </h2>
          <AssignLeadForm
            assignedToUserId={lead.assignedToUserId?.toString()}
            userOptions={users.map((user) => ({ id: user._id.toString(), label: user.name }))}
            action={boundAssign}
          />
        </section>
      ) : null}

      {canWork ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">
            Internal notes
          </h2>
          <LeadNotesForm internalNotes={lead.internalNotes} action={boundUpdateNotes} />
        </section>
      ) : null}

      {canManage ? (
        <div className="flex flex-wrap items-center gap-3">
          <ConfirmActionDialog
            triggerLabel={lead.archived ? 'Unarchive' : 'Archive'}
            title={lead.archived ? 'Unarchive this Lead?' : 'Archive this Lead?'}
            description={
              lead.archived
                ? 'It will reappear in the default list.'
                : 'It drops out of the default list but stays searchable — nothing is deleted.'
            }
            confirmLabel={lead.archived ? 'Unarchive' : 'Archive'}
            action={boundToggleArchived}
          />
          <ConfirmActionDialog
            triggerLabel="Delete"
            title="Delete this Lead?"
            description="This permanently removes the record. This cannot be undone."
            confirmLabel="Delete"
            action={boundDelete}
          />
        </div>
      ) : null}
    </div>
  );
}
