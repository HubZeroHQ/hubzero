import { ExternalLink } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { StatusStepper } from '@/components/studio/collection/StatusStepper';
import { PageHeader } from '@/components/studio/PageHeader';
import { BlockRenderer } from '@/components/documents/BlockRenderer';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { EmptyState } from '@/components/ui/EmptyState';
import { ReferenceIdBadge } from '@/components/ui/ReferenceIdBadge';
import { Tag } from '@/components/ui/Tag';
import { auth } from '@/lib/auth';
import { transitionWorkStatusAction } from '@/lib/studio/actions/work';
import { canUnpublishOverride, getAvailableTransitions } from '@/lib/studio/workflow-permissions';
import { roleHasCapability } from '@/config/permissions';
import { blueprintRepository } from '@/lib/db/repositories/blueprint';
import { buildRepository } from '@/lib/db/repositories/build';
import { documentRepository } from '@/lib/db/repositories/document';
import { taxonomyRepository } from '@/lib/db/repositories/taxonomy';
import { workRepository } from '@/lib/db/repositories/work';

export const metadata: Metadata = { title: 'Work — HubZero Studio' };

export default async function WorkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const work = await workRepository.findById(id);
  if (!work) {
    notFound();
  }

  const session = await auth();
  const { role, id: userId } = session!.user;

  const [document, technologies, categories, builds, blueprints] = await Promise.all([
    documentRepository.findByOwnerAndRole('Work', id, 'caseStudy'),
    taxonomyRepository.findByKind('technology'),
    taxonomyRepository.findByKind('category'),
    buildRepository.list(),
    blueprintRepository.list(),
  ]);

  const technologyLabels = new Map(
    technologies.map((entry) => [entry._id.toString(), entry.label]),
  );
  const categoryLabels = new Map(categories.map((entry) => [entry._id.toString(), entry.label]));
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

  const isAnyEntryEditor = roleHasCapability(role, 'editAnyEntry');
  const isOwner =
    roleHasCapability(role, 'editOwnEntry') && work.createdByUserId.toString() === userId;
  const canEdit = isAnyEntryEditor || isOwner;

  const availableTransitions = getAvailableTransitions(work.status, role, canEdit);
  const canOverride = canUnpublishOverride(work.status, role);
  const boundTransitionAction = transitionWorkStatusAction.bind(null, id);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={work.title}
        description={`${work.clientType} · ${work.timeline} · ${work.role}`}
        actions={
          canEdit ? (
            <ButtonLink href={`/studio/content/work/${id}/edit`} variant="secondary">
              Edit
            </ButtonLink>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <ReferenceIdBadge referenceId={work.referenceId} />
          {work.repoUrl ? (
            <a
              href={work.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="text-text-secondary hover:text-text-primary duration-fast ease-standard inline-flex items-center gap-1 text-xs transition-colors"
            >
              <ExternalLink size={12} aria-hidden />
              Repository
            </a>
          ) : null}
        </div>

        <StatusStepper
          status={work.status}
          availableTransitions={availableTransitions}
          canUnpublishOverride={canOverride}
          onTransition={boundTransitionAction}
        />
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">
          Technologies
        </h2>
        {work.technologyIds.length === 0 ? (
          <p className="text-text-muted text-sm">None tagged.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {work.technologyIds.map((tagId) => (
              <Tag key={tagId.toString()}>
                {technologyLabels.get(tagId.toString()) ?? 'Unknown'}
              </Tag>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">
          Category tags
        </h2>
        {work.categoryTagIds.length === 0 ? (
          <p className="text-text-muted text-sm">None tagged.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {work.categoryTagIds.map((tagId) => (
              <Tag key={tagId.toString()}>{categoryLabels.get(tagId.toString()) ?? 'Unknown'}</Tag>
            ))}
          </div>
        )}
      </section>

      {work.relatedBuildIds.length > 0 || work.relatedBlueprintIds.length > 0 ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">Related</h2>
          <ul className="flex flex-col gap-1 text-sm">
            {work.relatedBuildIds.map((buildId) => {
              const build = buildLabels.get(buildId.toString());
              return (
                <li key={buildId.toString()} className="text-text-secondary">
                  {build ? `${build.label} (${build.referenceId})` : 'Unknown Build'}
                </li>
              );
            })}
            {work.relatedBlueprintIds.map((blueprintId) => {
              const blueprint = blueprintLabels.get(blueprintId.toString());
              return (
                <li key={blueprintId.toString()} className="text-text-secondary">
                  {blueprint
                    ? `${blueprint.label} (${blueprint.referenceId})`
                    : 'Unknown Blueprint'}
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
        {document && document.blocks.length > 0 ? (
          <BlockRenderer blocks={document.blocks} />
        ) : (
          <EmptyState
            title="No case study yet."
            description="The document body hasn't been written yet (PLANNING.md §25)."
            action={
              canEdit ? (
                <ButtonLink href={`/studio/content/work/${id}/edit`} variant="secondary">
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
