import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/studio/PageHeader';
import { BuildForm } from '@/components/studio/builds/BuildForm';
import { DocumentRoleTabs } from '@/components/documents/DocumentRoleTabs';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { ErrorState } from '@/components/ui/ErrorState';
import { auth } from '@/lib/auth';
import { canActOnEntry } from '@/lib/auth/permissions';
import {
  generateBuildCaseStudyBlockAction,
  generateBuildCaseStudyDocumentAction,
  generateBuildTechnicalBlockAction,
  generateBuildTechnicalDocumentAction,
  saveBuildCaseStudyAction,
  saveBuildTechnicalAction,
  transformBuildCaseStudyBlockAction,
  transformBuildCaseStudySelectionAction,
  transformBuildTechnicalBlockAction,
  transformBuildTechnicalSelectionAction,
  updateBuildAction,
} from '@/lib/studio/actions/build';
import { getBuildRelationOptions } from '@/lib/studio/build-relations';
import { buildRepository } from '@/lib/db/repositories/build';
import { documentRepository } from '@/lib/db/repositories/document';
import { toMediaAssetDTO } from '@/lib/media/dto';
import { resolveHeroAndGallery } from '@/lib/media/resolve';

export const metadata: Metadata = { title: 'Edit Build — HubZero Studio' };

export default async function EditBuildPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const build = await buildRepository.findById(id);
  if (!build) {
    notFound();
  }

  const session = await auth();
  const { role, id: userId } = session!.user;
  const canEdit = canActOnEntry(build, { role, userId });

  if (!canEdit) {
    return (
      <ErrorState
        title="You can't edit this entry."
        description="Only its owner, an assigned Team Member, or an Admin/Head Admin can edit a Build."
        action={
          <ButtonLink href={`/studio/content/builds/${id}`} variant="secondary">
            Back to entry
          </ButtonLink>
        }
      />
    );
  }

  const [caseStudyDocument, technicalDocument, relationOptions, { heroAsset, galleryAssets }] =
    await Promise.all([
      documentRepository.findByOwnerAndRole('Build', id, 'caseStudy'),
      documentRepository.findByOwnerAndRole('Build', id, 'technical'),
      getBuildRelationOptions(),
      resolveHeroAndGallery(build.heroImageId, build.galleryImageIds),
    ]);
  const { technologyOptions, labOptions, workOptions, contributorOptions } = relationOptions;

  const boundUpdateAction = updateBuildAction.bind(null, id);
  const boundSaveCaseStudyAction = saveBuildCaseStudyAction.bind(null, id);
  const boundSaveTechnicalAction = saveBuildTechnicalAction.bind(null, id);
  const caseStudyAiConfig = {
    contentTypeLabel: 'case study',
    generateDocument: generateBuildCaseStudyDocumentAction.bind(null, id),
    generateBlock: generateBuildCaseStudyBlockAction.bind(null, id),
    transformBlock: transformBuildCaseStudyBlockAction.bind(null, id),
    transformSelection: transformBuildCaseStudySelectionAction.bind(null, id),
  };
  const technicalAiConfig = {
    contentTypeLabel: 'technical documentation',
    generateDocument: generateBuildTechnicalDocumentAction.bind(null, id),
    generateBlock: generateBuildTechnicalBlockAction.bind(null, id),
    transformBlock: transformBuildTechnicalBlockAction.bind(null, id),
    transformSelection: transformBuildTechnicalSelectionAction.bind(null, id),
  };

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        title={`Edit — ${build.title}`}
        description="Changes to metadata save immediately; workflow status is managed from the entry's detail view."
      />

      <BuildForm
        action={boundUpdateAction}
        submitLabel="Save changes"
        initialValues={{
          title: build.title,
          summary: build.summary,
          slug: build.slug,
          deploymentState: build.deploymentState,
          liveUrl: build.liveUrl,
          repoUrl: build.repoUrl,
          featured: build.featured,
          technologyIds: build.technologyIds.map((entryId) => entryId.toString()),
          originatingLabId: build.originatingLabId?.toString(),
          relatedWorkIds: build.relatedWorkIds.map((entryId) => entryId.toString()),
          contributors: (build.contributors ?? []).map((entryId) => entryId.toString()),
        }}
        initialHeroAsset={heroAsset ? toMediaAssetDTO(heroAsset) : undefined}
        initialGalleryAssets={galleryAssets.map(toMediaAssetDTO)}
        technologyOptions={technologyOptions}
        labOptions={labOptions}
        workOptions={workOptions}
        contributorOptions={contributorOptions}
      />

      <section className="flex flex-col gap-3">
        <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">
          Documentation
        </h2>
        <DocumentRoleTabs
          tabs={[
            {
              role: 'caseStudy',
              label: 'Case Study',
              initialBlocks: caseStudyDocument?.blocks ?? [],
              onSave: boundSaveCaseStudyAction,
              ai: caseStudyAiConfig,
            },
            {
              role: 'technical',
              label: 'Technical',
              initialBlocks: technicalDocument?.blocks ?? [],
              onSave: boundSaveTechnicalAction,
              ai: technicalAiConfig,
            },
          ]}
          technologyOptions={technologyOptions}
        />
      </section>
    </div>
  );
}
