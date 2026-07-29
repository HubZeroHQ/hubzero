import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/studio/PageHeader';
import { CareerForm } from '@/components/studio/careers/CareerForm';
import { BlockEditor } from '@/components/documents/BlockEditor';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { ErrorState } from '@/components/ui/ErrorState';
import { auth } from '@/lib/auth';
import { canEditEntry } from '@/lib/auth/permissions';
import {
  generateCareerOverviewBlockAction,
  generateCareerOverviewDocumentAction,
  saveCareerOverviewAction,
  transformCareerOverviewBlockAction,
  transformCareerOverviewSelectionAction,
  updateCareerAction,
} from '@/lib/studio/actions/career';
import { getCareerRelationOptions, splitCareerRelatedEntries } from '@/lib/studio/career-relations';
import { careerRepository } from '@/lib/db/repositories/career';
import { documentRepository } from '@/lib/db/repositories/document';

export const metadata: Metadata = { title: 'Edit Career listing — HubZero Studio' };

export default async function EditCareerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const career = await careerRepository.findById(id);
  if (!career) {
    notFound();
  }

  const session = await auth();
  const { role, id: userId } = session!.user;
  const canEdit = canEditEntry(career, { role, userId });

  if (!canEdit) {
    return (
      <ErrorState
        title="You can't edit this entry."
        description="Only its owner, an assigned Team Member, or an Admin/Head Admin can edit a Career listing."
        action={
          <ButtonLink href={`/studio/content/careers/${id}`} variant="secondary">
            Back to entry
          </ButtonLink>
        }
      />
    );
  }

  const [overviewDocument, relationOptions] = await Promise.all([
    documentRepository.findByOwnerAndRole('Career', id, 'overview'),
    getCareerRelationOptions(),
  ]);

  const boundUpdateAction = updateCareerAction.bind(null, id);
  const boundSaveOverviewAction = saveCareerOverviewAction.bind(null, id);
  const overviewAiConfig = {
    contentTypeLabel: 'role overview',
    generateDocument: generateCareerOverviewDocumentAction.bind(null, id),
    generateBlock: generateCareerOverviewBlockAction.bind(null, id),
    transformBlock: transformCareerOverviewBlockAction.bind(null, id),
    transformSelection: transformCareerOverviewSelectionAction.bind(null, id),
  };

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        title={`Edit — ${career.title}`}
        description="Changes to metadata save immediately; workflow status is managed from the entry's detail view."
      />

      <CareerForm
        action={boundUpdateAction}
        submitLabel="Save changes"
        initialValues={{
          title: career.title,
          slug: career.slug,
          location: career.location,
          employmentType: career.employmentType,
          experienceLevel: career.experienceLevel,
          summary: career.summary,
          responsibilities: career.responsibilities,
          requirements: career.requirements,
          benefits: career.benefits,
          compensation: career.compensation,
          applicationProcess: career.applicationProcess,
          technologyIds: career.technologyIds.map((entryId) => entryId.toString()),
          hiringManagerTeamId: career.hiringManagerTeamId?.toString(),
          ...splitCareerRelatedEntries(career.relatedEntries),
        }}
        {...relationOptions}
      />

      <section className="flex flex-col gap-3">
        <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">Overview</h2>
        <BlockEditor
          initialBlocks={overviewDocument?.blocks ?? []}
          onSave={boundSaveOverviewAction}
          technologyOptions={relationOptions.technologyOptions}
          ai={overviewAiConfig}
          previewHref={`/api/preview?type=career&id=${id}`}
        />
      </section>
    </div>
  );
}
