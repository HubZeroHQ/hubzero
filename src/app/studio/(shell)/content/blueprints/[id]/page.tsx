import { BookOpen, ExternalLink, Github } from 'lucide-react';
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
import { transitionBlueprintStatusAction } from '@/lib/studio/actions/blueprint';
import { getBlueprintReferencingWork } from '@/lib/studio/blueprint-relations';
import { canUnpublishOverride, getAvailableTransitions } from '@/lib/studio/workflow-permissions';
import { blueprintRepository } from '@/lib/db/repositories/blueprint';
import { documentRepository } from '@/lib/db/repositories/document';
import { resolveHeroAndGallery } from '@/lib/media/resolve';
import { taxonomyRepository } from '@/lib/db/repositories/taxonomy';
import { teamRepository } from '@/lib/db/repositories/team';

export const metadata: Metadata = { title: 'Blueprints — HubZero Studio' };

export default async function BlueprintDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const blueprint = await blueprintRepository.findById(id);
  if (!blueprint) {
    notFound();
  }

  const session = await auth();
  const { role, id: userId } = session!.user;
  const canEdit = canActOnEntry(blueprint, { role, userId });

  const [
    caseStudyDocument,
    technologies,
    { heroAsset, galleryAssets: gallery },
    referencingWork,
    team,
  ] = await Promise.all([
    documentRepository.findByOwnerAndRole('Blueprint', id, 'caseStudy'),
    taxonomyRepository.findByKind('technology'),
    resolveHeroAndGallery(blueprint.heroImageId, blueprint.previewAssetIds),
    getBlueprintReferencingWork(id),
    teamRepository.list(),
  ]);

  const technologyLabels = new Map(
    technologies.map((entry) => [entry._id.toString(), entry.label]),
  );
  const contributorLabels = new Map(
    team.map((member) => [
      member._id.toString(),
      { label: member.name, referenceId: member.referenceId },
    ]),
  );
  const availableTransitions = getAvailableTransitions(blueprint.status, role, canEdit);
  const canOverride = canUnpublishOverride(blueprint.status, role);
  const boundTransitionAction = transitionBlueprintStatusAction.bind(null, id);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={blueprint.name}
        description={`${blueprint.architecture} · ${blueprint.designLanguage} · v${blueprint.version}${blueprint.featured ? ' · Featured' : ''}`}
        actions={
          canEdit ? (
            <ButtonLink href={`/studio/content/blueprints/${id}/edit`} variant="secondary">
              Edit
            </ButtonLink>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <ReferenceIdBadge referenceId={blueprint.referenceId} />
          <a
            href={blueprint.liveDeploymentUrl}
            target="_blank"
            rel="noreferrer"
            className="text-text-secondary hover:text-text-primary duration-fast ease-standard inline-flex items-center gap-1 text-xs transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            Live preview
          </a>
          {blueprint.docsUrl ? (
            <a
              href={blueprint.docsUrl}
              target="_blank"
              rel="noreferrer"
              className="text-text-secondary hover:text-text-primary duration-fast ease-standard inline-flex items-center gap-1 text-xs transition-colors"
            >
              <BookOpen className="h-3.5 w-3.5" aria-hidden />
              Documentation
            </a>
          ) : null}
          {blueprint.repoUrl ? (
            <a
              href={blueprint.repoUrl}
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
          status={blueprint.status}
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
          Short description
        </h2>
        <p className="text-text-secondary text-sm">{blueprint.shortDescription}</p>
      </section>

      {blueprint.features.length > 0 ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">
            Features
          </h2>
          <ul className="text-text-secondary list-disc pl-5 text-sm">
            {blueprint.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="flex flex-col gap-2">
        <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">
          Technologies
        </h2>
        {blueprint.technologyIds.length === 0 ? (
          <p className="text-text-muted text-sm">None tagged.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {blueprint.technologyIds.map((tagId) => (
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

      {referencingWork.length > 0 ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">
            Generalized into
          </h2>
          <ul className="flex flex-col gap-1 text-sm">
            {referencingWork.map((work) => (
              <li key={work._id.toString()} className="text-text-secondary">
                {work.title} ({work.referenceId})
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {(blueprint.contributors?.length ?? 0) > 0 ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">Related</h2>
          <ul className="flex flex-col gap-1 text-sm">
            {(blueprint.contributors ?? []).map((teamId) => {
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
                <ButtonLink href={`/studio/content/blueprints/${id}/edit`} variant="secondary">
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
