import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ConfirmActionDialog } from '@/components/studio/ConfirmActionDialog';
import { AssignLeadForm } from '@/components/studio/leads/AssignLeadForm';
import { LeadNotesForm } from '@/components/studio/leads/LeadNotesForm';
import { LeadStatusButtons } from '@/components/studio/leads/LeadStatusButtons';
import { PageHeader } from '@/components/studio/PageHeader';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Tag } from '@/components/ui/Tag';
import { roleHasCapability } from '@/config/permissions';
import { auth } from '@/lib/auth';
import { canActOnEntry } from '@/lib/auth/permissions';
import { careerInterestRepository } from '@/lib/db/repositories/career-interest';
import { careerRepository } from '@/lib/db/repositories/career';
import { userRepository } from '@/lib/db/repositories/user';
import {
  assignCareerInterestAction,
  deleteCareerInterestAction,
  setCareerInterestArchivedAction,
  updateCareerInterestNotesAction,
  updateCareerInterestStatusAction,
} from '@/lib/studio/actions/career-interest';
import { formatRelativeTime } from '@/lib/utils/relative-time';

export const metadata: Metadata = { title: 'Candidate — HubZero Studio' };

const RESOURCE_LINKS: Array<{
  key: 'resumeUrl' | 'portfolioUrl' | 'githubUrl' | 'linkedinUrl' | 'websiteUrl';
  label: string;
}> = [
  { key: 'resumeUrl', label: 'Resume' },
  { key: 'portfolioUrl', label: 'Portfolio' },
  { key: 'githubUrl', label: 'GitHub' },
  { key: 'linkedinUrl', label: 'LinkedIn' },
  { key: 'websiteUrl', label: 'Website' },
];

export default async function CandidateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const candidate = await careerInterestRepository.findById(id);
  if (!candidate) {
    notFound();
  }

  const session = await auth();
  const { role, id: userId } = session!.user;
  const canWork = canActOnEntry(candidate, { role, userId });
  const canManage = roleHasCapability(role, 'editAnyEntry');

  const [users, career] = await Promise.all([
    canManage ? userRepository.list() : Promise.resolve([]),
    candidate.careerId ? careerRepository.findById(candidate.careerId.toString()) : null,
  ]);

  const boundUpdateNotes = updateCareerInterestNotesAction.bind(null, id);
  const boundAssign = assignCareerInterestAction.bind(null, id);
  const boundToggleArchived = setCareerInterestArchivedAction.bind(null, id, !candidate.archived);
  const boundDelete = deleteCareerInterestAction.bind(null, id);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={candidate.name} description={candidate.email} />

      <div className="flex flex-wrap items-center gap-3">
        <Tag>{career ? `Interested in: ${career.title}` : 'General interest'}</Tag>
        {candidate.location ? <Tag>{candidate.location}</Tag> : null}
        {candidate.archived ? <Tag>Archived</Tag> : null}
        <span className="text-text-muted text-xs">
          Received {formatRelativeTime(candidate.createdAt)}
        </span>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">
          Introduction
        </h2>
        <p className="text-text-secondary text-sm whitespace-pre-line">{candidate.introduction}</p>
      </section>

      {candidate.areasOfInterest.length > 0 ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">
            Areas of interest
          </h2>
          <div className="flex flex-wrap gap-2">
            {candidate.areasOfInterest.map((area) => (
              <Tag key={area}>{area}</Tag>
            ))}
          </div>
        </section>
      ) : null}

      {RESOURCE_LINKS.some(({ key }) => candidate[key]) ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">Links</h2>
          <ul className="flex flex-col gap-1 text-sm">
            {RESOURCE_LINKS.filter(({ key }) => candidate[key]).map(({ key, label }) => (
              <li key={key}>
                <a
                  href={candidate[key]}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent hover:underline"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {canWork ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">Status</h2>
          <LeadStatusButtons
            leadId={id}
            status={candidate.status}
            action={updateCareerInterestStatusAction}
          />
        </section>
      ) : null}

      {canManage ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">
            Assignment
          </h2>
          <AssignLeadForm
            assignedToUserId={candidate.assignedToUserId?.toString()}
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
          <LeadNotesForm internalNotes={candidate.internalNotes} action={boundUpdateNotes} />
        </section>
      ) : null}

      {career ? (
        <ButtonLink href={`/studio/content/careers/${career._id.toString()}`} variant="ghost">
          View listing: {career.title}
        </ButtonLink>
      ) : null}

      {canManage ? (
        <div className="flex flex-wrap items-center gap-3">
          <ConfirmActionDialog
            triggerLabel={candidate.archived ? 'Unarchive' : 'Archive'}
            title={candidate.archived ? 'Unarchive this candidate?' : 'Archive this candidate?'}
            description={
              candidate.archived
                ? 'It will reappear in the default list.'
                : 'It drops out of the default list but stays searchable — nothing is deleted.'
            }
            confirmLabel={candidate.archived ? 'Unarchive' : 'Archive'}
            action={boundToggleArchived}
          />
          <ConfirmActionDialog
            triggerLabel="Delete"
            title="Delete this candidate?"
            description="This permanently removes the record. This cannot be undone."
            confirmLabel="Delete"
            action={boundDelete}
          />
        </div>
      ) : null}
    </div>
  );
}
