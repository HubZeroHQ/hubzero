import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/studio/PageHeader';
import { WorkForm } from '@/components/studio/work/WorkForm';
import { BlockEditor } from '@/components/documents/BlockEditor';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { ErrorState } from '@/components/ui/ErrorState';
import { auth } from '@/lib/auth';
import { canActOnEntry } from '@/lib/auth/permissions';
import {
  generateWorkCaseStudyBlockAction,
  generateWorkCaseStudyDocumentAction,
  saveWorkCaseStudyAction,
  transformWorkCaseStudyBlockAction,
  transformWorkCaseStudySelectionAction,
  updateWorkAction,
} from '@/lib/studio/actions/work';
import { getWorkRelationOptions } from '@/lib/studio/work-relations';
import { documentRepository } from '@/lib/db/repositories/document';
import { workRepository } from '@/lib/db/repositories/work';

export const metadata: Metadata = { title: 'Edit Work entry — HubZero Studio' };

export default async function EditWorkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const work = await workRepository.findById(id);
  if (!work) {
    notFound();
  }

  const session = await auth();
  const { role, id: userId } = session!.user;
  const canEdit = canActOnEntry(work, { role, userId });

  if (!canEdit) {
    return (
      <ErrorState
        title="You can't edit this entry."
        description="Only its owner, an assigned Team Member, or an Admin/Head Admin can edit a Work entry."
        action={
          <ButtonLink href={`/studio/content/work/${id}`} variant="secondary">
            Back to entry
          </ButtonLink>
        }
      />
    );
  }

  const [
    document,
    {
      categoryOptions,
      technologyOptions,
      buildOptions,
      blueprintOptions,
      labOptions,
      contributorOptions,
    },
  ] = await Promise.all([
    documentRepository.findByOwnerAndRole('Work', id, 'caseStudy'),
    getWorkRelationOptions(),
  ]);

  const boundUpdateAction = updateWorkAction.bind(null, id);
  const boundSaveDocumentAction = saveWorkCaseStudyAction.bind(null, id);
  const caseStudyAiConfig = {
    contentTypeLabel: 'case study',
    generateDocument: generateWorkCaseStudyDocumentAction.bind(null, id),
    generateBlock: generateWorkCaseStudyBlockAction.bind(null, id),
    transformBlock: transformWorkCaseStudyBlockAction.bind(null, id),
    transformSelection: transformWorkCaseStudySelectionAction.bind(null, id),
  };

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        title={`Edit — ${work.title}`}
        description="Changes to metadata save immediately; workflow status is managed from the entry's detail view."
      />

      <WorkForm
        action={boundUpdateAction}
        submitLabel="Save changes"
        initialValues={{
          title: work.title,
          summary: work.summary,
          slug: work.slug,
          clientType: work.clientType,
          timeline: work.timeline,
          role: work.role,
          repoUrl: work.repoUrl,
          categoryTagIds: work.categoryTagIds.map((id) => id.toString()),
          technologyIds: work.technologyIds.map((id) => id.toString()),
          relatedBuildIds: work.relatedBuildIds.map((id) => id.toString()),
          relatedBlueprintIds: work.relatedBlueprintIds.map((id) => id.toString()),
          relatedLabIds: (work.relatedLabIds ?? []).map((id) => id.toString()),
          contributorProfileIds: (work.contributorProfileIds ?? []).map((id) => id.toString()),
        }}
        categoryOptions={categoryOptions}
        technologyOptions={technologyOptions}
        buildOptions={buildOptions}
        blueprintOptions={blueprintOptions}
        labOptions={labOptions}
        contributorOptions={contributorOptions}
      />

      <section className="flex flex-col gap-3">
        <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">
          Case study
        </h2>
        <BlockEditor
          initialBlocks={document?.blocks ?? []}
          onSave={boundSaveDocumentAction}
          technologyOptions={technologyOptions}
          ai={caseStudyAiConfig}
        />
      </section>
    </div>
  );
}
