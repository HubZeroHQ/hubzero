import { ExternalLink, Github, Rocket } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { StatusStepper } from '@/components/studio/collection/StatusStepper';
import { ProgressTimeline } from '@/components/studio/collection/ProgressTimeline';
import { GraduateToBuildButton } from '@/components/studio/labs/GraduateToBuildButton';
import { PageHeader } from '@/components/studio/PageHeader';
import { BlockRenderer } from '@/components/documents/BlockRenderer';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { EmptyState } from '@/components/ui/EmptyState';
import { ReferenceIdBadge } from '@/components/ui/ReferenceIdBadge';
import { Tag } from '@/components/ui/Tag';
import { auth } from '@/lib/auth';
import { canActOnEntry } from '@/lib/auth/permissions';
import { graduateLabToBuildAction, transitionLabStatusAction } from '@/lib/studio/actions/lab';
import { canUnpublishOverride, getAvailableTransitions } from '@/lib/studio/workflow-permissions';
import { blueprintRepository } from '@/lib/db/repositories/blueprint';
import { buildRepository } from '@/lib/db/repositories/build';
import { documentRepository } from '@/lib/db/repositories/document';
import { labRepository } from '@/lib/db/repositories/lab';
import { resolveHeroAndGallery } from '@/lib/media/resolve';
import { taxonomyRepository } from '@/lib/db/repositories/taxonomy';
import { teamRepository } from '@/lib/db/repositories/team';
import type { DocumentRole } from '@/lib/documents/schema';
import type { LabStage } from '@/types/studio';

export const metadata: Metadata = { title: 'Labs — HubZero Studio' };

const STAGE_LABEL: Record<LabStage, string> = {
  exploring: 'Exploring',
  building: 'Building',
  testing: 'Testing',
};

const LAB_DOCUMENT_SECTIONS: Array<{ role: DocumentRole; label: string; description: string }> = [
  {
    role: 'overview',
    label: 'Overview',
    description: 'What this Lab is and why it exists.',
  },
  {
    role: 'engineeringJournal',
    label: 'Engineering Journal',
    description: 'A running log of what changed and why, as it happens.',
  },
  {
    role: 'findings',
    label: 'Findings',
    description: "What's actually been learned so far.",
  },
  {
    role: 'researchNotes',
    label: 'Research Notes',
    description: 'Background research, references, and open questions.',
  },
];

const LAB_DOCUMENT_ROLE_LABELS = Object.fromEntries(
  LAB_DOCUMENT_SECTIONS.map((section) => [section.role, section.label]),
);

export default async function LabDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lab = await labRepository.findById(id);
  if (!lab) {
    notFound();
  }

  const session = await auth();
  const { role, id: userId } = session!.user;
  const canEdit = canActOnEntry(lab, { role, userId });

  const [
    labDocuments,
    technologies,
    builds,
    blueprints,
    team,
    { heroAsset, galleryAssets: gallery },
  ] = await Promise.all([
    Promise.all(
      LAB_DOCUMENT_SECTIONS.map((section) =>
        documentRepository.findByOwnerAndRole('Lab', id, section.role),
      ),
    ),
    taxonomyRepository.findByKind('technology'),
    buildRepository.list(),
    blueprintRepository.list(),
    teamRepository.list(),
    resolveHeroAndGallery(lab.heroImageId, lab.galleryImageIds),
  ]);

  const technologyLabels = new Map(
    technologies.map((entry) => [entry._id.toString(), entry.label]),
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

  const contributorLabels = new Map(
    team.map((member) => [
      member._id.toString(),
      {
        label: member.name,
        referenceId: member.referenceId,
      },
    ]),
  );

  const graduatedToBuild = lab.graduatedToBuildId
    ? buildLabels.get(lab.graduatedToBuildId.toString())
    : undefined;

  const availableTransitions = getAvailableTransitions(lab.status, role, canEdit);
  const canOverride = canUnpublishOverride(lab.status, role);
  const boundTransitionAction = transitionLabStatusAction.bind(null, id);
  const boundGraduateAction = graduateLabToBuildAction.bind(null, id);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={lab.title}
        description={`${STAGE_LABEL[lab.stage]}${lab.featured ? ' · Featured' : ''}`}
        actions={
          canEdit ? (
            <ButtonLink href={`/studio/content/labs/${id}/edit`} variant="secondary">
              Edit
            </ButtonLink>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <ReferenceIdBadge referenceId={lab.referenceId} />
          {lab.liveDemoUrl ? (
            <a
              href={lab.liveDemoUrl}
              target="_blank"
              rel="noreferrer"
              className="text-text-secondary hover:text-text-primary duration-fast ease-standard inline-flex items-center gap-1 text-xs transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              Live demo
            </a>
          ) : null}
          <a
            href={lab.internalRepoUrl}
            target="_blank"
            rel="noreferrer"
            className="text-text-secondary hover:text-text-primary duration-fast ease-standard inline-flex items-center gap-1 text-xs transition-colors"
          >
            <Github className="h-3.5 w-3.5" aria-hidden />
            Internal repository
          </a>
          {lab.publicRepoUrl ? (
            <a
              href={lab.publicRepoUrl}
              target="_blank"
              rel="noreferrer"
              className="text-text-secondary hover:text-text-primary duration-fast ease-standard inline-flex items-center gap-1 text-xs transition-colors"
            >
              <Github className="h-3.5 w-3.5" aria-hidden />
              Public repository
            </a>
          ) : null}
        </div>

        <StatusStepper
          status={lab.status}
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
        <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">Objective</h2>
        <p className="text-text-secondary text-sm">{lab.objective}</p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">
          Research direction
        </h2>
        <p className="text-text-secondary text-sm">{lab.researchDirection}</p>
      </section>

      <div className="grid gap-6 sm:grid-cols-2">
        <section className="flex flex-col gap-2">
          <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">
            Current milestone
          </h2>
          <p className="text-text-secondary text-sm">{lab.currentMilestone}</p>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">
            Graduation criteria
          </h2>
          <p className="text-text-secondary text-sm">{lab.graduationCriteria}</p>
        </section>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <section className="flex flex-col gap-1">
          <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">Started</h2>
          <p className="text-text-secondary text-sm">
            {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(lab.startDate)}
          </p>
        </section>
        <section className="flex flex-col gap-1">
          <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">
            Last major update
          </h2>
          <p className="text-text-secondary text-sm">
            {lab.lastMajorUpdateAt
              ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(
                  lab.lastMajorUpdateAt,
                )
              : 'Not recorded yet.'}
          </p>
        </section>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">
          Technologies
        </h2>
        {lab.technologyIds.length === 0 ? (
          <p className="text-text-muted text-sm">None tagged.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {lab.technologyIds.map((tagId) => (
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

      <section className="flex flex-col gap-3">
        <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">
          Progress timeline
        </h2>
        <ProgressTimeline
          milestones={lab.milestones}
          documentRoleLabels={LAB_DOCUMENT_ROLE_LABELS}
        />
      </section>

      {lab.relatedBuildIds.length > 0 ||
      lab.relatedBlueprintIds.length > 0 ||
      (lab.contributors?.length ?? 0) > 0 ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">Related</h2>
          <ul className="flex flex-col gap-1 text-sm">
            {lab.relatedBuildIds.map((buildId) => {
              const build = buildLabels.get(buildId.toString());
              return (
                <li key={buildId.toString()} className="text-text-secondary">
                  {build ? `${build.label} (${build.referenceId})` : 'Unknown Build'}
                </li>
              );
            })}
            {lab.relatedBlueprintIds.map((blueprintId) => {
              const blueprint = blueprintLabels.get(blueprintId.toString());
              return (
                <li key={blueprintId.toString()} className="text-text-secondary">
                  {blueprint
                    ? `${blueprint.label} (${blueprint.referenceId})`
                    : 'Unknown Blueprint'}
                </li>
              );
            })}
            {(lab.contributors ?? []).map((teamId) => {
              const contributor = contributorLabels.get(teamId.toString());
              return (
                <li key={teamId.toString()} className="text-text-secondary">
                  {contributor
                    ? `${contributor.label} (${contributor.referenceId}) — Contributor`
                    : 'Unknown Team member'}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <section className="flex flex-col gap-3">
        <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">
          Graduation
        </h2>
        {graduatedToBuild ? (
          <p className="text-text-secondary inline-flex items-center gap-2 text-sm">
            <Rocket className="h-3.5 w-3.5" aria-hidden />
            Graduated to: {graduatedToBuild.label} ({graduatedToBuild.referenceId})
          </p>
        ) : canEdit ? (
          <GraduateToBuildButton onGraduate={boundGraduateAction} />
        ) : (
          <p className="text-text-muted text-sm">Not graduated yet.</p>
        )}
      </section>

      {LAB_DOCUMENT_SECTIONS.map((section, index) => {
        const document = labDocuments[index];
        return (
          <section key={section.role} className="flex flex-col gap-3">
            <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">
              {section.label}
            </h2>
            {document && document.blocks.length > 0 ? (
              <BlockRenderer blocks={document.blocks} technologyLabels={technologyLabels} />
            ) : (
              <EmptyState
                title={`No ${section.label.toLowerCase()} yet.`}
                description={section.description}
                action={
                  canEdit ? (
                    <ButtonLink href={`/studio/content/labs/${id}/edit`} variant="secondary">
                      Add content
                    </ButtonLink>
                  ) : undefined
                }
              />
            )}
          </section>
        );
      })}
    </div>
  );
}
