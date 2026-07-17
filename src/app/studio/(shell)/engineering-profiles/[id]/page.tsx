import { notFound } from 'next/navigation';
import Image from 'next/image';
import { BlockRenderer } from '@/components/documents/BlockRenderer';
import { PageHeader } from '@/components/studio/PageHeader';
import { ENGINEERING_PROFILE_DOCUMENT_ROLES } from '@/config/engineering-profiles';
import { StatusStepper } from '@/components/studio/collection/StatusStepper';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { ReferenceIdBadge } from '@/components/ui/ReferenceIdBadge';
import { Tag } from '@/components/ui/Tag';
import { auth } from '@/lib/auth';
import { canActOnEntry } from '@/lib/auth/permissions';
import { engineeringProfileRepository } from '@/lib/db/repositories/engineering-profile';
import { documentRepository } from '@/lib/db/repositories/document';
import { teamRepository } from '@/lib/db/repositories/team';
import { resolveMediaAssets } from '@/lib/media/resolve';
import { getEngineeringProfileRelationOptions } from '@/lib/studio/engineering-profile-relations';
import { transitionEngineeringProfileStatusAction } from '@/lib/studio/actions/engineering-profile';
import { canUnpublishOverride, getAvailableTransitions } from '@/lib/studio/workflow-permissions';
export default async function EngineeringProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await engineeringProfileRepository.findById(id);
  if (!profile) notFound();
  const [team, documents, session, relationOptions, media] = await Promise.all([
    teamRepository.findById(profile.teamMemberId.toString()),
    Promise.all(
      ENGINEERING_PROFILE_DOCUMENT_ROLES.map((r) =>
        documentRepository.findByOwnerAndRole('EngineeringProfile', id, r),
      ),
    ),
    auth(),
    getEngineeringProfileRelationOptions(profile.teamMemberId.toString()),
    resolveMediaAssets(
      [profile.portraitId, profile.heroMediaId, ...profile.galleryImageIds].filter(
        Boolean,
      ) as import('mongodb').ObjectId[],
    ),
  ]);
  const role = session!.user.role;
  const canEdit = canActOnEntry(profile, { role, userId: session!.user.id });
  const mediaById = new Map(media.map((asset) => [asset._id.toString(), asset]));
  const labels = (
    options: Array<{ id: string; label: string; referenceId?: string }>,
    ids: import('mongodb').ObjectId[],
  ) => {
    const byId = new Map(options.map((option) => [option.id, option]));
    return ids
      .map((entryId) => byId.get(entryId.toString()))
      .filter((entry): entry is { id: string; label: string; referenceId?: string } =>
        Boolean(entry),
      );
  };
  const portrait = profile.portraitId ? mediaById.get(profile.portraitId.toString()) : undefined;
  const hero = profile.heroMediaId ? mediaById.get(profile.heroMediaId.toString()) : undefined;
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={team?.name ?? 'Engineering Profile'}
        description={profile.overview}
        actions={
          canEdit ? (
            <ButtonLink href={`/studio/engineering-profiles/${id}/edit`} variant="secondary">
              Edit
            </ButtonLink>
          ) : undefined
        }
      />
      <div className="flex flex-wrap items-center gap-4">
        <ReferenceIdBadge referenceId={profile.referenceId} />
        <StatusStepper
          status={profile.status}
          availableTransitions={getAvailableTransitions(profile.status, role, canEdit)}
          canUnpublishOverride={canUnpublishOverride(profile.status, role)}
          onTransition={transitionEngineeringProfileStatusAction.bind(null, id)}
        />
      </div>
      {portrait || hero ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[portrait, hero].filter(Boolean).map((asset) => (
            <div
              key={asset!._id.toString()}
              className="border-border-default rounded-card relative aspect-video overflow-hidden border"
            >
              <Image
                src={asset!.url}
                alt={asset!.altText}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      ) : null}
      <section>
        <h2 className="text-text-muted mb-2 font-mono text-xs uppercase">Engineering philosophy</h2>
        <p className="text-text-secondary">{profile.engineeringPhilosophy}</p>
      </section>
      <section>
        <h2 className="text-text-muted mb-2 font-mono text-xs uppercase">Current exploration</h2>
        <p className="text-text-secondary">{profile.currentExploration}</p>
      </section>
      <section>
        <h2 className="text-text-muted mb-2 font-mono text-xs uppercase">Areas of expertise</h2>
        <div className="flex flex-wrap gap-2">
          {profile.areasOfExpertise.map((x) => (
            <Tag key={x}>{x}</Tag>
          ))}
        </div>
      </section>
      <TagSection title="Current interests" items={profile.currentInterests} />
      <TagSection title="Engineering identity" items={profile.engineeringIdentity} />
      <TagSection
        title="Technologies"
        items={labels(relationOptions.technologyOptions, profile.technologyIds).map(
          (entry) => entry.label,
        )}
      />
      <RelationSection
        title="Featured Work"
        entries={labels(relationOptions.workOptions, profile.featuredWorkIds)}
      />
      <RelationSection
        title="Featured Builds"
        entries={labels(relationOptions.buildOptions, profile.featuredBuildIds)}
      />
      <RelationSection
        title="Featured Blueprints"
        entries={labels(relationOptions.blueprintOptions, profile.featuredBlueprintIds)}
      />
      <RelationSection
        title="Featured Labs"
        entries={labels(relationOptions.labOptions, profile.featuredLabIds)}
      />
      <RelationSection
        title="Featured Notes"
        entries={labels(relationOptions.noteOptions, profile.featuredNoteIds)}
      />
      {profile.galleryImageIds.length ? (
        <section>
          <h2 className="text-text-muted mb-3 font-mono text-xs uppercase">Gallery</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {profile.galleryImageIds
              .map((imageId) => mediaById.get(imageId.toString()))
              .filter(Boolean)
              .map((asset) => (
                <div
                  key={asset!._id.toString()}
                  className="border-border-default rounded-card relative aspect-video overflow-hidden border"
                >
                  <Image
                    src={asset!.url}
                    alt={asset!.altText}
                    fill
                    sizes="(min-width: 1024px) 33vw, 50vw"
                    className="object-cover"
                  />
                </div>
              ))}
          </div>
        </section>
      ) : null}
      {documents.map((doc, i) =>
        doc?.blocks.length ? (
          <section key={ENGINEERING_PROFILE_DOCUMENT_ROLES[i]}>
            <h2 className="text-text-muted mb-3 font-mono text-xs uppercase">
              {ENGINEERING_PROFILE_DOCUMENT_ROLES[i]}
            </h2>
            <BlockRenderer blocks={doc.blocks} />
          </section>
        ) : null,
      )}
    </div>
  );
}

function TagSection({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <section>
      <h2 className="text-text-muted mb-2 font-mono text-xs uppercase">{title}</h2>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Tag key={item}>{item}</Tag>
        ))}
      </div>
    </section>
  );
}
function RelationSection({
  title,
  entries,
}: {
  title: string;
  entries: Array<{ id: string; label: string; referenceId?: string }>;
}) {
  if (!entries.length) return null;
  return (
    <section>
      <h2 className="text-text-muted mb-2 font-mono text-xs uppercase">{title}</h2>
      <ul className="border-border-default divide-border-muted rounded-card divide-y border">
        {entries.map((entry) => (
          <li key={entry.id} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
            <span>{entry.label}</span>
            {entry.referenceId ? (
              <span className="text-text-muted font-mono text-[11px] tracking-[0.05em] uppercase">
                {entry.referenceId}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
