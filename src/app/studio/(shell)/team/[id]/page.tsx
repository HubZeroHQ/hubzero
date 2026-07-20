import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ConfirmActionDialog } from '@/components/studio/ConfirmActionDialog';
import { PageHeader } from '@/components/studio/PageHeader';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { EmptyState } from '@/components/ui/EmptyState';
import { ReferenceIdBadge } from '@/components/ui/ReferenceIdBadge';
import { Tag } from '@/components/ui/Tag';
import { engineeringProfileRepository } from '@/lib/db/repositories/engineering-profile';
import { teamRepository } from '@/lib/db/repositories/team';
import { mediaRepository } from '@/lib/db/repositories/media';
import { deleteTeamAction, setTeamArchivedAction } from '@/lib/studio/actions/team';

export const metadata: Metadata = { title: 'Team member — HubZero Studio' };

export default async function TeamMemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const member = await teamRepository.findById(id);
  if (!member) {
    notFound();
  }

  const [portrait, linkedProfile] = await Promise.all([
    member.portraitId ? mediaRepository.findById(member.portraitId.toString()) : null,
    engineeringProfileRepository.findByTeamMemberId(id),
  ]);

  const boundToggleArchived = setTeamArchivedAction.bind(null, id, !member.archived);
  const boundDelete = deleteTeamAction.bind(null, id);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={member.name}
        description={`${member.role} · ${member.group}`}
        actions={
          <ButtonLink href={`/studio/team/${id}/edit`} variant="secondary">
            Edit
          </ButtonLink>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <ReferenceIdBadge referenceId={member.referenceId} />
        {member.founder ? <Tag>Founder</Tag> : null}
        <Tag>{member.publicProfile ? 'Public' : 'Private'}</Tag>
        {member.archived ? <Tag>Archived</Tag> : null}
      </div>

      {portrait ? (
        <div className="border-border-default rounded-card relative aspect-square w-40 overflow-hidden border">
          <Image
            src={portrait.url}
            alt={portrait.altText}
            fill
            sizes="160px"
            className="object-cover"
          />
        </div>
      ) : null}

      <section className="flex flex-col gap-2">
        <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">Bio</h2>
        <p className="text-text-secondary text-sm">{member.bio}</p>
      </section>

      {member.socialLinks.length > 0 ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">
            Social links
          </h2>
          <ul className="flex flex-col gap-1 text-sm">
            {member.socialLinks.map((link) => (
              <li key={`${link.platform}-${link.url}`}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-text-secondary hover:text-text-primary duration-fast ease-standard transition-colors"
                >
                  {link.platform}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="flex flex-col gap-2">
        <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">
          Engineering Profile
        </h2>
        {linkedProfile ? (
          <ButtonLink
            href={`/studio/engineering-profiles/${linkedProfile._id.toString()}`}
            variant="secondary"
            className="self-start"
          >
            View Engineering Profile ({linkedProfile.referenceId})
          </ButtonLink>
        ) : (
          <EmptyState
            title="No Engineering Profile yet."
            description="An Engineering Profile is earned, not automatic — create one when this member has real evidence to show."
            action={
              <ButtonLink href="/studio/engineering-profiles/new" variant="secondary">
                Create Engineering Profile
              </ButtonLink>
            }
          />
        )}
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <ConfirmActionDialog
          triggerLabel={member.archived ? 'Unarchive' : 'Archive'}
          title={member.archived ? 'Unarchive this Team member?' : 'Archive this Team member?'}
          description={
            member.archived
              ? 'They will become visible on the public site again (if their profile is set to public) and reappear in the default admin list.'
              : 'They will drop out of the public site and the default admin list, but the record is kept and can be unarchived later.'
          }
          confirmLabel={member.archived ? 'Unarchive' : 'Archive'}
          action={boundToggleArchived}
        />
        <ConfirmActionDialog
          triggerLabel="Delete"
          title="Delete this Team member?"
          description={
            linkedProfile
              ? 'Blocked while an Engineering Profile is still linked.'
              : 'This permanently removes the record. This cannot be undone.'
          }
          confirmLabel="Delete"
          action={boundDelete}
        />
      </div>
    </div>
  );
}
