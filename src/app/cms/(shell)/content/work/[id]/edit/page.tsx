import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/cms/PageHeader';
import { WorkForm } from '@/components/cms/work/WorkForm';
import { BlockEditor } from '@/components/documents/BlockEditor';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { ErrorState } from '@/components/ui/ErrorState';
import { roleHasCapability } from '@/config/permissions';
import { auth } from '@/lib/auth';
import { saveWorkCaseStudyAction, updateWorkAction } from '@/lib/cms/actions/work';
import { getWorkRelationOptions } from '@/lib/cms/work-relations';
import { documentRepository } from '@/lib/db/repositories/document';
import { workRepository } from '@/lib/db/repositories/work';

export const metadata: Metadata = { title: 'Edit Work entry — HubZero CMS' };

export default async function EditWorkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const work = await workRepository.findById(id);
  if (!work) {
    notFound();
  }

  const session = await auth();
  const { role, id: userId } = session!.user;
  const isAnyEntryEditor = roleHasCapability(role, 'editAnyEntry');
  const isOwner =
    roleHasCapability(role, 'editOwnEntry') && work.createdByUserId.toString() === userId;
  const canEdit = isAnyEntryEditor || isOwner;

  if (!canEdit) {
    return (
      <ErrorState
        title="You can't edit this entry."
        description="Only its owner, an assigned Team Member, or an Admin/Head Admin can edit a Work entry."
        action={
          <ButtonLink href={`/cms/content/work/${id}`} variant="secondary">
            Back to entry
          </ButtonLink>
        }
      />
    );
  }

  const [document, { categoryOptions, technologyOptions, buildOptions, blueprintOptions }] =
    await Promise.all([
      documentRepository.findByOwnerAndRole('Work', id, 'caseStudy'),
      getWorkRelationOptions(),
    ]);

  const boundUpdateAction = updateWorkAction.bind(null, id);
  const boundSaveDocumentAction = saveWorkCaseStudyAction.bind(null, id);

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
          slug: work.slug,
          clientType: work.clientType,
          timeline: work.timeline,
          role: work.role,
          repoUrl: work.repoUrl,
          categoryTagIds: work.categoryTagIds.map((id) => id.toString()),
          technologyIds: work.technologyIds.map((id) => id.toString()),
          relatedBuildIds: work.relatedBuildIds.map((id) => id.toString()),
          relatedBlueprintIds: work.relatedBlueprintIds.map((id) => id.toString()),
        }}
        categoryOptions={categoryOptions}
        technologyOptions={technologyOptions}
        buildOptions={buildOptions}
        blueprintOptions={blueprintOptions}
      />

      <section className="flex flex-col gap-3">
        <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">
          Case study
        </h2>
        <BlockEditor initialBlocks={document?.blocks ?? []} onSave={boundSaveDocumentAction} />
      </section>
    </div>
  );
}
