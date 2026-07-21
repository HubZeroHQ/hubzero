import { Clock } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { StatusStepper } from '@/components/studio/collection/StatusStepper';
import { PageHeader } from '@/components/studio/PageHeader';
import { BlockRenderer } from '@/components/documents/BlockRenderer';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { EmptyState } from '@/components/ui/EmptyState';
import { ReferenceIdBadge } from '@/components/ui/ReferenceIdBadge';
import { Tag } from '@/components/ui/Tag';
import { auth } from '@/lib/auth';
import { canActOnEntry } from '@/lib/auth/permissions';
import { transitionNoteStatusAction } from '@/lib/studio/actions/note';
import { canUnpublishOverride, getAvailableTransitions } from '@/lib/studio/workflow-permissions';
import { blueprintRepository } from '@/lib/db/repositories/blueprint';
import { buildRepository } from '@/lib/db/repositories/build';
import { documentRepository } from '@/lib/db/repositories/document';
import { engineeringProfileRepository } from '@/lib/db/repositories/engineering-profile';
import { labRepository } from '@/lib/db/repositories/lab';
import { noteRepository } from '@/lib/db/repositories/note';
import { taxonomyRepository } from '@/lib/db/repositories/taxonomy';
import { teamRepository } from '@/lib/db/repositories/team';
import { userRepository } from '@/lib/db/repositories/user';
import { workRepository } from '@/lib/db/repositories/work';
import { estimateReadingTimeMinutes } from '@/lib/documents/reading-time';
import { resolveHeroAndGallery } from '@/lib/media/resolve';
import type { EvidenceOwnerType } from '@/types/studio';

export const metadata: Metadata = { title: 'Notes — HubZero Studio' };

export default async function NoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const note = await noteRepository.findById(id);
  if (!note) {
    notFound();
  }

  const session = await auth();
  const { role, id: userId } = session!.user;
  const canEdit = canActOnEntry(note, { role, userId });

  const [
    bodyDocument,
    technologies,
    author,
    work,
    builds,
    blueprints,
    labs,
    profiles,
    team,
    { heroAsset, galleryAssets: gallery },
  ] = await Promise.all([
    documentRepository.findByOwnerAndRole('Note', id, 'body'),
    taxonomyRepository.findByKind('technology'),
    userRepository.findById(note.authorId.toString()),
    workRepository.list(),
    buildRepository.list(),
    blueprintRepository.list(),
    labRepository.list(),
    engineeringProfileRepository.list(),
    teamRepository.list(),
    resolveHeroAndGallery(note.heroImageId, note.galleryImageIds),
  ]);

  const technologyLabels = new Map(
    technologies.map((entry) => [entry._id.toString(), entry.label]),
  );
  const workLabels = new Map(
    work.map((entry) => [
      entry._id.toString(),
      { label: entry.title, referenceId: entry.referenceId },
    ]),
  );
  const buildLabels = new Map(
    builds.map((entry) => [
      entry._id.toString(),
      { label: entry.title, referenceId: entry.referenceId },
    ]),
  );
  const blueprintLabels = new Map(
    blueprints.map((entry) => [
      entry._id.toString(),
      { label: entry.name, referenceId: entry.referenceId },
    ]),
  );
  const labLabels = new Map(
    labs.map((entry) => [
      entry._id.toString(),
      { label: entry.title, referenceId: entry.referenceId },
    ]),
  );

  const teamNames = new Map(team.map((member) => [member._id.toString(), member.name]));
  const contributorLabels = new Map(
    profiles.map((entry) => [
      entry._id.toString(),
      {
        label: teamNames.get(entry.teamMemberId.toString()) ?? entry.slug,
        referenceId: entry.referenceId,
      },
    ]),
  );

  const relatedByType: Record<
    EvidenceOwnerType,
    Map<string, { label: string; referenceId: string }>
  > = {
    Work: workLabels,
    Build: buildLabels,
    Blueprint: blueprintLabels,
    Lab: labLabels,
  };

  const readingTimeMinutes = estimateReadingTimeMinutes(bodyDocument?.blocks ?? []);
  const availableTransitions = getAvailableTransitions(note.status, role, canEdit);
  const canOverride = canUnpublishOverride(note.status, role);
  const boundTransitionAction = transitionNoteStatusAction.bind(null, id);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={note.title}
        description={`${author?.name ?? 'Unknown author'} · ${new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(note.publicationDate)} · ${readingTimeMinutes} min read${note.featured ? ' · Featured' : ''}`}
        actions={
          canEdit ? (
            <ButtonLink href={`/studio/content/notes/${id}/edit`} variant="secondary">
              Edit
            </ButtonLink>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <ReferenceIdBadge referenceId={note.referenceId} />
          <span className="text-text-secondary inline-flex items-center gap-1 text-xs">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            {readingTimeMinutes} min read
          </span>
        </div>

        <StatusStepper
          status={note.status}
          availableTransitions={availableTransitions}
          canUnpublishOverride={canOverride}
          onTransition={boundTransitionAction}
        />
      </div>

      {heroAsset ? (
        <div className="border-border-default rounded-card relative aspect-[16/9] w-full overflow-hidden border">
          <Image
            src={heroAsset.url}
            alt={heroAsset.altText}
            fill
            sizes="(min-width: 1024px) 800px, 100vw"
            className="object-cover"
          />
        </div>
      ) : null}

      <section className="flex flex-col gap-2">
        <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">Summary</h2>
        <p className="text-text-secondary text-sm">{note.summary}</p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">
          Technologies
        </h2>
        {note.technologyIds.length === 0 ? (
          <p className="text-text-muted text-sm">None tagged.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {note.technologyIds.map((tagId) => (
              <Tag key={tagId.toString()}>
                {technologyLabels.get(tagId.toString()) ?? 'Unknown'}
              </Tag>
            ))}
          </div>
        )}
      </section>

      {gallery.length > 0 ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">Gallery</h2>
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}
          >
            {gallery.map((asset) => (
              <div
                key={asset._id.toString()}
                className="border-border-default rounded-card relative aspect-video overflow-hidden border"
              >
                <Image
                  src={asset.url}
                  alt={asset.altText}
                  fill
                  sizes="(min-width: 1024px) 260px, 50vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {note.relatedEntries.length > 0 || (note.contributorProfileIds?.length ?? 0) > 0 ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">Related</h2>
          <ul className="flex flex-col gap-1 text-sm">
            {note.relatedEntries.map((entry) => {
              const resolved = relatedByType[entry.ownerType]?.get(entry.ownerId.toString());
              return (
                <li
                  key={`${entry.ownerType}-${entry.ownerId.toString()}`}
                  className="text-text-secondary"
                >
                  {resolved
                    ? `${entry.ownerType}: ${resolved.label} (${resolved.referenceId})`
                    : `Unknown ${entry.ownerType}`}
                </li>
              );
            })}
            {(note.contributorProfileIds ?? []).map((profileId) => {
              const contributor = contributorLabels.get(profileId.toString());
              return (
                <li key={profileId.toString()} className="text-text-secondary">
                  {contributor
                    ? `${contributor.label} (${contributor.referenceId}) — Engineering contributor`
                    : 'Unknown Engineering Profile'}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <section className="flex flex-col gap-3">
        <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">Write-up</h2>
        {bodyDocument && bodyDocument.blocks.length > 0 ? (
          <BlockRenderer blocks={bodyDocument.blocks} technologyLabels={technologyLabels} />
        ) : (
          <EmptyState
            title="No write-up yet."
            description="The document body hasn't been written yet (PLANNING.md §25)."
            action={
              canEdit ? (
                <ButtonLink href={`/studio/content/notes/${id}/edit`} variant="secondary">
                  Add content
                </ButtonLink>
              ) : undefined
            }
          />
        )}
      </section>
    </div>
  );
}
