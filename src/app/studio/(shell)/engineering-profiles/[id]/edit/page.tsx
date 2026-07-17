import { notFound } from 'next/navigation';
import { EngineeringProfileForm } from '@/components/studio/engineering-profiles/EngineeringProfileForm';
import { ENGINEERING_PROFILE_DOCUMENT_ROLES } from '@/config/engineering-profiles';
import { BlockEditor } from '@/components/documents/BlockEditor';
import { PageHeader } from '@/components/studio/PageHeader';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { ErrorState } from '@/components/ui/ErrorState';
import { auth } from '@/lib/auth';
import { canActOnEntry } from '@/lib/auth/permissions';
import { engineeringProfileRepository } from '@/lib/db/repositories/engineering-profile';
import { documentRepository } from '@/lib/db/repositories/document';
import { resolveMediaAssets } from '@/lib/media/resolve';
import { toMediaAssetDTO } from '@/lib/media/dto';
import {
  saveEngineeringProfileDocumentAction,
  updateEngineeringProfileAction,
} from '@/lib/studio/actions/engineering-profile';
import { getEngineeringProfileRelationOptions } from '@/lib/studio/engineering-profile-relations';
export default async function EditEngineeringProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await engineeringProfileRepository.findById(id);
  if (!profile) notFound();
  const session = await auth();
  if (!canActOnEntry(profile, { role: session!.user.role, userId: session!.user.id })) {
    return (
      <ErrorState
        title="You can't edit this profile."
        description="Only its owner, an assigned Team Member, or an Admin/Head Admin can edit an Engineering Profile."
        action={
          <ButtonLink href={`/studio/engineering-profiles/${id}`} variant="secondary">
            Back to profile
          </ButtonLink>
        }
      />
    );
  }
  const [options, documents, media] = await Promise.all([
    getEngineeringProfileRelationOptions(profile.teamMemberId.toString()),
    Promise.all(
      ENGINEERING_PROFILE_DOCUMENT_ROLES.map((role) =>
        documentRepository.findByOwnerAndRole('EngineeringProfile', id, role),
      ),
    ),
    resolveMediaAssets(
      [profile.portraitId, profile.heroMediaId, ...profile.galleryImageIds].filter(
        Boolean,
      ) as import('mongodb').ObjectId[],
    ),
  ]);
  const byId = new Map(media.map((m) => [m._id.toString(), toMediaAssetDTO(m)]));
  const values = {
    teamMemberId: profile.teamMemberId.toString(),
    slug: profile.slug,
    overview: profile.overview,
    engineeringPhilosophy: profile.engineeringPhilosophy,
    currentExploration: profile.currentExploration,
    areasOfExpertise: profile.areasOfExpertise,
    currentInterests: profile.currentInterests,
    engineeringIdentity: profile.engineeringIdentity,
    technologyIds: profile.technologyIds.map(String),
    featuredWorkIds: profile.featuredWorkIds.map(String),
    featuredBuildIds: profile.featuredBuildIds.map(String),
    featuredBlueprintIds: profile.featuredBlueprintIds.map(String),
    featuredLabIds: profile.featuredLabIds.map(String),
    featuredNoteIds: profile.featuredNoteIds.map(String),
    galleryImageIds: profile.galleryImageIds.map(String),
  };
  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        title="Edit Engineering Profile"
        description="Structured evidence first; long-form thinking stays in the shared Document Engine."
      />
      <EngineeringProfileForm
        action={updateEngineeringProfileAction.bind(null, id)}
        submitLabel="Save changes"
        initialValues={values}
        initialPortrait={profile.portraitId ? byId.get(profile.portraitId.toString()) : undefined}
        initialHero={profile.heroMediaId ? byId.get(profile.heroMediaId.toString()) : undefined}
        initialGalleryAssets={
          profile.galleryImageIds
            .map((x) => byId.get(x.toString()))
            .filter(Boolean) as import('@/lib/media/dto').MediaAssetDTO[]
        }
        {...options}
      />
      {ENGINEERING_PROFILE_DOCUMENT_ROLES.map((role, index) => (
        <section key={role} className="flex flex-col gap-3">
          <h2 className="text-text-muted font-mono text-xs tracking-[.05em] uppercase">{role}</h2>
          <BlockEditor
            initialBlocks={documents[index]?.blocks ?? []}
            onSave={saveEngineeringProfileDocumentAction.bind(null, role, id)}
            technologyOptions={options.technologyOptions}
          />
        </section>
      ))}
    </div>
  );
}
