import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/studio/PageHeader';
import { BlueprintForm } from '@/components/studio/blueprints/BlueprintForm';
import { BlockEditor } from '@/components/documents/BlockEditor';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { ErrorState } from '@/components/ui/ErrorState';
import { auth } from '@/lib/auth';
import { canActOnEntry } from '@/lib/auth/permissions';
import {
  generateBlueprintCaseStudyBlockAction,
  generateBlueprintCaseStudyDocumentAction,
  saveBlueprintCaseStudyAction,
  transformBlueprintCaseStudyBlockAction,
  transformBlueprintCaseStudySelectionAction,
  updateBlueprintAction,
} from '@/lib/studio/actions/blueprint';
import { getBlueprintRelationOptions } from '@/lib/studio/blueprint-relations';
import { blueprintRepository } from '@/lib/db/repositories/blueprint';
import { documentRepository } from '@/lib/db/repositories/document';
import { toMediaAssetDTO } from '@/lib/media/dto';
import { resolveHeroAndGallery } from '@/lib/media/resolve';

export const metadata: Metadata = { title: 'Edit Blueprint — HubZero Studio' };

export default async function EditBlueprintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const blueprint = await blueprintRepository.findById(id);
  if (!blueprint) {
    notFound();
  }

  const session = await auth();
  const { role, id: userId } = session!.user;
  const canEdit = canActOnEntry(blueprint, { role, userId });

  if (!canEdit) {
    return (
      <ErrorState
        title="You can't edit this entry."
        description="Only its owner, an assigned Team Member, or an Admin/Head Admin can edit a Blueprint."
        action={
          <ButtonLink href={`/studio/content/blueprints/${id}`} variant="secondary">
            Back to entry
          </ButtonLink>
        }
      />
    );
  }

  const [
    caseStudyDocument,
    { technologyOptions, contributorOptions },
    { heroAsset, galleryAssets },
  ] = await Promise.all([
    documentRepository.findByOwnerAndRole('Blueprint', id, 'caseStudy'),
    getBlueprintRelationOptions(),
    resolveHeroAndGallery(blueprint.heroImageId, blueprint.previewAssetIds),
  ]);

  const boundUpdateAction = updateBlueprintAction.bind(null, id);
  const boundSaveCaseStudyAction = saveBlueprintCaseStudyAction.bind(null, id);
  const caseStudyAiConfig = {
    contentTypeLabel: 'case study',
    generateDocument: generateBlueprintCaseStudyDocumentAction.bind(null, id),
    generateBlock: generateBlueprintCaseStudyBlockAction.bind(null, id),
    transformBlock: transformBlueprintCaseStudyBlockAction.bind(null, id),
    transformSelection: transformBlueprintCaseStudySelectionAction.bind(null, id),
  };

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        title={`Edit — ${blueprint.name}`}
        description="Changes to metadata save immediately; workflow status is managed from the entry's detail view."
      />

      <BlueprintForm
        action={boundUpdateAction}
        submitLabel="Save changes"
        initialValues={{
          name: blueprint.name,
          slug: blueprint.slug,
          architecture: blueprint.architecture,
          designLanguage: blueprint.designLanguage,
          shortDescription: blueprint.shortDescription,
          liveDeploymentUrl: blueprint.liveDeploymentUrl,
          repoUrl: blueprint.repoUrl,
          docsUrl: blueprint.docsUrl,
          version: blueprint.version,
          featured: blueprint.featured,
          features: blueprint.features,
          technologyIds: blueprint.technologyIds.map((entryId) => entryId.toString()),
          previewAssetIds: blueprint.previewAssetIds.map((entryId) => entryId.toString()),
          contributors: (blueprint.contributors ?? []).map((entryId) => entryId.toString()),
        }}
        initialHeroAsset={heroAsset ? toMediaAssetDTO(heroAsset) : undefined}
        initialGalleryAssets={galleryAssets.map(toMediaAssetDTO)}
        technologyOptions={technologyOptions}
        contributorOptions={contributorOptions}
      />

      <section className="flex flex-col gap-3">
        <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">
          Case study
        </h2>
        <BlockEditor
          initialBlocks={caseStudyDocument?.blocks ?? []}
          onSave={boundSaveCaseStudyAction}
          technologyOptions={technologyOptions}
          ai={caseStudyAiConfig}
        />
      </section>
    </div>
  );
}
