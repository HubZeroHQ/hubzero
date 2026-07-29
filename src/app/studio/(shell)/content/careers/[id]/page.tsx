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
import { canEditEntry } from '@/lib/auth/permissions';
import { transitionCareerStatusAction } from '@/lib/studio/actions/career';
import {
  canReject,
  canUnpublishOverride,
  getAvailableTransitions,
} from '@/lib/studio/workflow-permissions';
import { buildRepository } from '@/lib/db/repositories/build';
import { careerRepository } from '@/lib/db/repositories/career';
import { documentRepository } from '@/lib/db/repositories/document';
import { labRepository } from '@/lib/db/repositories/lab';
import { noteRepository } from '@/lib/db/repositories/note';
import { taxonomyRepository } from '@/lib/db/repositories/taxonomy';
import { teamRepository } from '@/lib/db/repositories/team';
import { workRepository } from '@/lib/db/repositories/work';
import type { CareerEvidenceOwnerType } from '@/types/studio';

export const metadata: Metadata = { title: 'Careers — HubZero Studio' };

const EMPLOYMENT_TYPE_LABEL: Record<string, string> = {
  fullTime: 'Full-time',
  partTime: 'Part-time',
  contract: 'Contract',
  internship: 'Internship',
};

const EXPERIENCE_LEVEL_LABEL: Record<string, string> = {
  entry: 'Entry',
  mid: 'Mid',
  senior: 'Senior',
  lead: 'Lead',
};

export default async function CareerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const career = await careerRepository.findById(id);
  if (!career) {
    notFound();
  }

  const session = await auth();
  const { role, id: userId } = session!.user;
  const canEdit = canEditEntry(career, { role, userId });

  const [overviewDocument, technologies, work, builds, labs, notes, team] = await Promise.all([
    documentRepository.findByOwnerAndRole('Career', id, 'overview'),
    taxonomyRepository.findByKind('technology'),
    workRepository.list(),
    buildRepository.list(),
    labRepository.list(),
    noteRepository.list(),
    teamRepository.list(),
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
  const labLabels = new Map(
    labs.map((entry) => [
      entry._id.toString(),
      { label: entry.title, referenceId: entry.referenceId },
    ]),
  );
  const noteLabels = new Map(
    notes.map((entry) => [
      entry._id.toString(),
      { label: entry.title, referenceId: entry.referenceId },
    ]),
  );
  const teamLabels = new Map(
    team.map((member) => [
      member._id.toString(),
      { label: member.name, referenceId: member.referenceId },
    ]),
  );

  const relatedByType: Record<
    CareerEvidenceOwnerType,
    Map<string, { label: string; referenceId: string }>
  > = {
    Work: workLabels,
    Build: buildLabels,
    Lab: labLabels,
    Note: noteLabels,
  };

  const availableTransitions = getAvailableTransitions(career.status, role, canEdit);
  const canOverride = canUnpublishOverride(career.status, role);
  const boundTransitionAction = transitionCareerStatusAction.bind(null, id);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={career.title}
        description={`${career.location} · ${EMPLOYMENT_TYPE_LABEL[career.employmentType]} · ${EXPERIENCE_LEVEL_LABEL[career.experienceLevel]}`}
        actions={
          canEdit ? (
            <>
              <ButtonLink
                href={`/api/preview?type=career&id=${id}`}
                target="_blank"
                rel="noreferrer"
                variant="ghost"
              >
                Preview
              </ButtonLink>
              <ButtonLink href={`/studio/content/careers/${id}/edit`} variant="secondary">
                Edit
              </ButtonLink>
            </>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-3">
        <ReferenceIdBadge referenceId={career.referenceId} />
        <StatusStepper
          status={career.status}
          availableTransitions={availableTransitions}
          canUnpublishOverride={canOverride}
          canReject={canReject(career.status, role)}
          reviewNote={career.reviewNote}
          onTransition={boundTransitionAction}
        />
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">Summary</h2>
        <p className="text-text-secondary text-sm">{career.summary}</p>
      </section>

      {career.compensation ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">
            Compensation
          </h2>
          <p className="text-text-secondary text-sm">{career.compensation}</p>
        </section>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-3">
        <ListSection title="Responsibilities" items={career.responsibilities} />
        <ListSection title="Requirements" items={career.requirements} />
        <ListSection title="Benefits" items={career.benefits} />
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">
          Application process
        </h2>
        <p className="text-text-secondary text-sm">{career.applicationProcess}</p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">
          Technologies
        </h2>
        {career.technologyIds.length === 0 ? (
          <p className="text-text-muted text-sm">None tagged.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {career.technologyIds.map((tagId) => (
              <Tag key={tagId.toString()}>
                {technologyLabels.get(tagId.toString()) ?? 'Unknown'}
              </Tag>
            ))}
          </div>
        )}
      </section>

      {career.hiringManagerTeamId || career.relatedEntries.length > 0 ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">Related</h2>
          <ul className="flex flex-col gap-1 text-sm">
            {career.hiringManagerTeamId ? (
              <li className="text-text-secondary">
                {(() => {
                  const manager = teamLabels.get(career.hiringManagerTeamId.toString());
                  return manager
                    ? `${manager.label} (${manager.referenceId}) — Hiring manager`
                    : 'Unknown Team member — Hiring manager';
                })()}
              </li>
            ) : null}
            {career.relatedEntries.map((entry) => {
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
          </ul>
        </section>
      ) : null}

      <section className="flex flex-col gap-3">
        <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">Overview</h2>
        {overviewDocument && overviewDocument.blocks.length > 0 ? (
          <BlockRenderer blocks={overviewDocument.blocks} technologyLabels={technologyLabels} />
        ) : (
          <EmptyState
            title="No overview yet."
            description="The document body hasn't been written yet."
            action={
              canEdit ? (
                <ButtonLink href={`/studio/content/careers/${id}/edit`} variant="secondary">
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

function ListSection({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">{title}</h2>
      {items.length === 0 ? (
        <p className="text-text-muted text-sm">None listed.</p>
      ) : (
        <ul className="text-text-secondary list-disc pl-5 text-sm">
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
