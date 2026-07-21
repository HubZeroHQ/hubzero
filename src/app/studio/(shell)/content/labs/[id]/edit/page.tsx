import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/studio/PageHeader';
import { LabForm } from '@/components/studio/labs/LabForm';
import { DocumentRoleTabs } from '@/components/documents/DocumentRoleTabs';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { ErrorState } from '@/components/ui/ErrorState';
import { auth } from '@/lib/auth';
import { canActOnEntry } from '@/lib/auth/permissions';
import {
  generateLabEngineeringJournalBlockAction,
  generateLabEngineeringJournalDocumentAction,
  generateLabFindingsBlockAction,
  generateLabFindingsDocumentAction,
  generateLabOverviewBlockAction,
  generateLabOverviewDocumentAction,
  generateLabResearchNotesBlockAction,
  generateLabResearchNotesDocumentAction,
  saveLabEngineeringJournalAction,
  saveLabFindingsAction,
  saveLabOverviewAction,
  saveLabResearchNotesAction,
  transformLabEngineeringJournalBlockAction,
  transformLabEngineeringJournalSelectionAction,
  transformLabFindingsBlockAction,
  transformLabFindingsSelectionAction,
  transformLabOverviewBlockAction,
  transformLabOverviewSelectionAction,
  transformLabResearchNotesBlockAction,
  transformLabResearchNotesSelectionAction,
  updateLabAction,
} from '@/lib/studio/actions/lab';
import { getLabRelationOptions } from '@/lib/studio/lab-relations';
import { labRepository } from '@/lib/db/repositories/lab';
import { documentRepository } from '@/lib/db/repositories/document';
import { toMediaAssetDTO } from '@/lib/media/dto';
import { resolveHeroAndGallery } from '@/lib/media/resolve';

export const metadata: Metadata = { title: 'Edit Lab — HubZero Studio' };

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export default async function EditLabPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lab = await labRepository.findById(id);
  if (!lab) {
    notFound();
  }

  const session = await auth();
  const { role, id: userId } = session!.user;
  const canEdit = canActOnEntry(lab, { role, userId });

  if (!canEdit) {
    return (
      <ErrorState
        title="You can't edit this entry."
        description="Only its owner, an assigned Team Member, or an Admin/Head Admin can edit a Lab."
        action={
          <ButtonLink href={`/studio/content/labs/${id}`} variant="secondary">
            Back to entry
          </ButtonLink>
        }
      />
    );
  }

  const [
    overviewDocument,
    engineeringJournalDocument,
    findingsDocument,
    researchNotesDocument,
    { technologyOptions, buildOptions, blueprintOptions, contributorOptions },
    { heroAsset, galleryAssets },
  ] = await Promise.all([
    documentRepository.findByOwnerAndRole('Lab', id, 'overview'),
    documentRepository.findByOwnerAndRole('Lab', id, 'engineeringJournal'),
    documentRepository.findByOwnerAndRole('Lab', id, 'findings'),
    documentRepository.findByOwnerAndRole('Lab', id, 'researchNotes'),
    getLabRelationOptions(),
    resolveHeroAndGallery(lab.heroImageId, lab.galleryImageIds),
  ]);

  const boundUpdateAction = updateLabAction.bind(null, id);
  const boundSaveOverviewAction = saveLabOverviewAction.bind(null, id);
  const boundSaveEngineeringJournalAction = saveLabEngineeringJournalAction.bind(null, id);
  const boundSaveFindingsAction = saveLabFindingsAction.bind(null, id);
  const boundSaveResearchNotesAction = saveLabResearchNotesAction.bind(null, id);

  const overviewAiConfig = {
    contentTypeLabel: 'Lab overview',
    generateDocument: generateLabOverviewDocumentAction.bind(null, id),
    generateBlock: generateLabOverviewBlockAction.bind(null, id),
    transformBlock: transformLabOverviewBlockAction.bind(null, id),
    transformSelection: transformLabOverviewSelectionAction.bind(null, id),
  };
  const engineeringJournalAiConfig = {
    contentTypeLabel: 'engineering journal entry',
    generateDocument: generateLabEngineeringJournalDocumentAction.bind(null, id),
    generateBlock: generateLabEngineeringJournalBlockAction.bind(null, id),
    transformBlock: transformLabEngineeringJournalBlockAction.bind(null, id),
    transformSelection: transformLabEngineeringJournalSelectionAction.bind(null, id),
  };
  const findingsAiConfig = {
    contentTypeLabel: 'findings entry',
    generateDocument: generateLabFindingsDocumentAction.bind(null, id),
    generateBlock: generateLabFindingsBlockAction.bind(null, id),
    transformBlock: transformLabFindingsBlockAction.bind(null, id),
    transformSelection: transformLabFindingsSelectionAction.bind(null, id),
  };
  const researchNotesAiConfig = {
    contentTypeLabel: 'research notes entry',
    generateDocument: generateLabResearchNotesDocumentAction.bind(null, id),
    generateBlock: generateLabResearchNotesBlockAction.bind(null, id),
    transformBlock: transformLabResearchNotesBlockAction.bind(null, id),
    transformSelection: transformLabResearchNotesSelectionAction.bind(null, id),
  };

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        title={`Edit — ${lab.title}`}
        description="Changes to metadata save immediately; workflow status is managed from the entry's detail view."
      />

      <LabForm
        action={boundUpdateAction}
        submitLabel="Save changes"
        initialValues={{
          title: lab.title,
          slug: lab.slug,
          stage: lab.stage,
          objective: lab.objective,
          researchDirection: lab.researchDirection,
          currentMilestone: lab.currentMilestone,
          graduationCriteria: lab.graduationCriteria,
          startDate: toDateInputValue(lab.startDate),
          lastMajorUpdateAt: lab.lastMajorUpdateAt
            ? toDateInputValue(lab.lastMajorUpdateAt)
            : undefined,
          internalRepoUrl: lab.internalRepoUrl,
          publicRepoUrl: lab.publicRepoUrl,
          liveDemoUrl: lab.liveDemoUrl,
          featured: lab.featured,
          technologyIds: lab.technologyIds.map((entryId) => entryId.toString()),
          relatedBuildIds: lab.relatedBuildIds.map((entryId) => entryId.toString()),
          relatedBlueprintIds: lab.relatedBlueprintIds.map((entryId) => entryId.toString()),
          galleryImageIds: lab.galleryImageIds.map((entryId) => entryId.toString()),
          milestones: lab.milestones.map((milestone) => ({
            title: milestone.title,
            date: toDateInputValue(milestone.date),
            summary: milestone.summary,
            relatedDocumentRole: milestone.relatedDocumentRole,
          })),
          contributorProfileIds: (lab.contributorProfileIds ?? []).map((entryId) =>
            entryId.toString(),
          ),
        }}
        initialHeroAsset={heroAsset ? toMediaAssetDTO(heroAsset) : undefined}
        initialGalleryAssets={galleryAssets.map(toMediaAssetDTO)}
        technologyOptions={technologyOptions}
        buildOptions={buildOptions}
        blueprintOptions={blueprintOptions}
        contributorOptions={contributorOptions}
      />

      <section className="flex flex-col gap-3">
        <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">
          Documentation
        </h2>
        <DocumentRoleTabs
          tabs={[
            {
              role: 'overview',
              label: 'Overview',
              initialBlocks: overviewDocument?.blocks ?? [],
              onSave: boundSaveOverviewAction,
              ai: overviewAiConfig,
            },
            {
              role: 'engineeringJournal',
              label: 'Engineering Journal',
              initialBlocks: engineeringJournalDocument?.blocks ?? [],
              onSave: boundSaveEngineeringJournalAction,
              ai: engineeringJournalAiConfig,
            },
            {
              role: 'findings',
              label: 'Findings',
              initialBlocks: findingsDocument?.blocks ?? [],
              onSave: boundSaveFindingsAction,
              ai: findingsAiConfig,
            },
            {
              role: 'researchNotes',
              label: 'Research Notes',
              initialBlocks: researchNotesDocument?.blocks ?? [],
              onSave: boundSaveResearchNotesAction,
              ai: researchNotesAiConfig,
            },
          ]}
          technologyOptions={technologyOptions}
        />
      </section>
    </div>
  );
}
