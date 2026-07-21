import { ExternalLink, Github } from 'lucide-react';
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
import { transitionBuildStatusAction } from '@/lib/studio/actions/build';
import { canUnpublishOverride, getAvailableTransitions } from '@/lib/studio/workflow-permissions';
import { buildRepository } from '@/lib/db/repositories/build';
import { documentRepository } from '@/lib/db/repositories/document';
import { engineeringProfileRepository } from '@/lib/db/repositories/engineering-profile';
import { labRepository } from '@/lib/db/repositories/lab';
import { resolveHeroAndGallery } from '@/lib/media/resolve';
import { taxonomyRepository } from '@/lib/db/repositories/taxonomy';
import { teamRepository } from '@/lib/db/repositories/team';
import { workRepository } from '@/lib/db/repositories/work';

export const metadata: Metadata = { title: 'Builds — HubZero Studio' };

const DEPLOYMENT_STATE_LABEL = { live: 'Live', retired: 'Retired' } as const;

/** Mirrors the Lab detail page's own document-role list (`lib/studio/actions/lab.ts`). */
const LAB_DOCUMENT_SECTIONS = [
  { role: 'overview' as const, label: 'Overview' },
  { role: 'engineeringJournal' as const, label: 'Engineering Journal' },
  { role: 'findings' as const, label: 'Findings' },
  { role: 'researchNotes' as const, label: 'Research Notes' },
];

export default async function BuildDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const build = await buildRepository.findById(id);
  if (!build) {
    notFound();
  }

  const session = await auth();
  const { role, id: userId } = session!.user;
  const canEdit = canActOnEntry(build, { role, userId });

  const [
    caseStudyDocument,
    technicalDocument,
    technologies,
    labs,
    workEntries,
    profiles,
    team,
    { heroAsset, galleryAssets: gallery },
  ] = await Promise.all([
    documentRepository.findByOwnerAndRole('Build', id, 'caseStudy'),
    documentRepository.findByOwnerAndRole('Build', id, 'technical'),
    taxonomyRepository.findByKind('technology'),
    labRepository.list(),
    workRepository.list(),
    engineeringProfileRepository.list(),
    teamRepository.list(),
    resolveHeroAndGallery(build.heroImageId, build.galleryImageIds),
  ]);

  const technologyLabels = new Map(
    technologies.map((entry) => [entry._id.toString(), entry.label]),
  );
  const labLabels = new Map(
    labs.map((entry) => [
      entry._id.toString(),
      { label: entry.title, referenceId: entry.referenceId },
    ]),
  );
  const workLabels = new Map(
    workEntries.map((entry) => [
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

  const originatingLab = build.originatingLabId
    ? labLabels.get(build.originatingLabId.toString())
    : undefined;

  // The graduation mechanic (PLANNING.md §26.4, CMS_PRODUCT_DESIGN.md
  // Appendix A) never copies the originating Lab's Documents onto the Build —
  // they stay owned by the Lab and are simply queried here via
  // `originatingLabId`, so both entries' detail views render the exact same
  // historical record rather than each maintaining their own copy.
  const labDocuments = build.originatingLabId
    ? await Promise.all(
        LAB_DOCUMENT_SECTIONS.map((section) =>
          documentRepository.findByOwnerAndRole(
            'Lab',
            build.originatingLabId!.toString(),
            section.role,
          ),
        ),
      )
    : [];

  const availableTransitions = getAvailableTransitions(build.status, role, canEdit);
  const canOverride = canUnpublishOverride(build.status, role);
  const boundTransitionAction = transitionBuildStatusAction.bind(null, id);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={build.title}
        description={`${DEPLOYMENT_STATE_LABEL[build.deploymentState]}${build.featured ? ' · Featured' : ''}`}
        actions={
          canEdit ? (
            <ButtonLink href={`/studio/content/builds/${id}/edit`} variant="secondary">
              Edit
            </ButtonLink>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <ReferenceIdBadge referenceId={build.referenceId} />
          {build.liveUrl ? (
            <a
              href={build.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="text-text-secondary hover:text-text-primary duration-fast ease-standard inline-flex items-center gap-1 text-xs transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              Live deployment
            </a>
          ) : null}
          {build.repoUrl ? (
            <a
              href={build.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="text-text-secondary hover:text-text-primary duration-fast ease-standard inline-flex items-center gap-1 text-xs transition-colors"
            >
              <Github className="h-3.5 w-3.5" aria-hidden />
              Repository
            </a>
          ) : null}
        </div>

        <StatusStepper
          status={build.status}
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
        <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">
          Technologies
        </h2>
        {build.technologyIds.length === 0 ? (
          <p className="text-text-muted text-sm">None tagged.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {build.technologyIds.map((tagId) => (
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

      {originatingLab ||
      build.relatedWorkIds.length > 0 ||
      (build.contributorProfileIds?.length ?? 0) > 0 ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">Related</h2>
          <ul className="flex flex-col gap-1 text-sm">
            {originatingLab ? (
              <li className="text-text-secondary">
                Graduated from: {originatingLab.label} ({originatingLab.referenceId})
              </li>
            ) : null}
            {build.relatedWorkIds.map((workId) => {
              const work = workLabels.get(workId.toString());
              return (
                <li key={workId.toString()} className="text-text-secondary">
                  {work ? `${work.label} (${work.referenceId})` : 'Unknown Work entry'}
                </li>
              );
            })}
            {(build.contributorProfileIds ?? []).map((profileId) => {
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

      {originatingLab && labDocuments.some((document) => document && document.blocks.length > 0) ? (
        <section className="flex flex-col gap-4">
          <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">
            Lab history — {originatingLab.label} ({originatingLab.referenceId})
          </h2>
          {LAB_DOCUMENT_SECTIONS.map((section, index) => {
            const document = labDocuments[index];
            if (!document || document.blocks.length === 0) {
              return null;
            }
            return (
              <div key={section.role} className="flex flex-col gap-2">
                <h3 className="text-text-secondary text-sm font-medium">{section.label}</h3>
                <BlockRenderer blocks={document.blocks} technologyLabels={technologyLabels} />
              </div>
            );
          })}
        </section>
      ) : null}

      <section className="flex flex-col gap-3">
        <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">
          Case study
        </h2>
        {caseStudyDocument && caseStudyDocument.blocks.length > 0 ? (
          <BlockRenderer blocks={caseStudyDocument.blocks} technologyLabels={technologyLabels} />
        ) : (
          <EmptyState
            title="No case study yet."
            description="The document body hasn't been written yet (PLANNING.md §25)."
            action={
              canEdit ? (
                <ButtonLink href={`/studio/content/builds/${id}/edit`} variant="secondary">
                  Add content
                </ButtonLink>
              ) : undefined
            }
          />
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">
          Technical documentation
        </h2>
        {technicalDocument && technicalDocument.blocks.length > 0 ? (
          <BlockRenderer blocks={technicalDocument.blocks} technologyLabels={technologyLabels} />
        ) : (
          <EmptyState
            title="No technical documentation yet."
            description="Architecture, technical decisions, and challenges (PLANNING.md §10) haven't been written yet."
            action={
              canEdit ? (
                <ButtonLink href={`/studio/content/builds/${id}/edit`} variant="secondary">
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
