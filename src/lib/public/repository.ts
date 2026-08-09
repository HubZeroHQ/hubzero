import type { OwnerType } from '@/lib/documents/schema';
import { orderEditorially, selectFeatured } from '@/lib/studio/featured-order';
import type {
  Blueprint,
  Build,
  Career,
  CareerEntryReference,
  EngineeringProfile,
  EntryReference,
  ServiceEvidenceReference,
  Lab,
  Note,
  Service,
  Team,
  Work,
} from '@/types/studio';
import { toPublicDocuments } from './documents';
import type {
  OrganizationAuthor,
  ImmutablePublic,
  PublicAuthor,
  PublicBlueprintSummary,
  PublicBuildSummary,
  PublicCareerSummary,
  PublicDetailEntityType,
  PublicDiscoveryEntry,
  PublicEngineeringProfileSummary,
  PublicEngineeringProfileIndexEntry,
  PublicEntityDetail,
  PublicEntityLink,
  PublicEntitySummary,
  PublicEntityType,
  PublicExternalLink,
  PublicHomepageFeature,
  PublicHomepageProjection,
  PublicLabSummary,
  PublicNoteSummary,
  PublicNoteIndexEntry,
  PublicRelationship,
  PublicServiceSummary,
  PublicTaxonomyKind,
  PublicTaxonomyTerm,
  PublicTeamMemberSummary,
  PublicWorkSummary,
} from './domain';
import { estimateReadingTimeMinutes } from '@/lib/documents/reading-time';
import {
  createGraphQuery,
  type GraphQuery,
  type HubZeroRelationshipKind,
} from '@/lib/entity-graph';
import { projectEvidence, refKey, type PublicEvidenceNode } from './evidence-projection';
import { projectTrace } from './trace-projection';
import {
  hasRoles,
  hasSubstantiveDocument,
  isBuildDetailEligible,
  isBuildHomepageEligible,
  isEngineeringProfileHomepageEligible,
} from './eligibility';
import { isSafePublicUrl, toPublicMedia } from './media';
import {
  normalizePublicEntityGraph,
  type PublicRelationshipData,
  type RelationshipAssertion,
} from './relationships';
import { publicRoute } from './routes';
import { projectSearchEntry } from './search-projection';
import type { PublicDataSource, StudioPublicEntity } from './source';
import { isPubliclyVisible } from './visibility';

const ORGANIZATION_AUTHOR: OrganizationAuthor = {
  kind: 'organization',
  name: 'HubZero',
  url: publicRoute.about(),
};

const TYPE_TO_OWNER: Record<PublicDetailEntityType, OwnerType> = {
  work: 'Work',
  build: 'Build',
  blueprint: 'Blueprint',
  lab: 'Lab',
  note: 'Note',
  engineeringProfile: 'EngineeringProfile',
  career: 'Career',
};

/**
 * The inverse of `TYPE_TO_OWNER`, derived rather than hand-duplicated so the
 * two directions can't drift apart. Exported for `document-actions.ts`,
 * which needs the same OwnerType→PublicEntityType fact to invalidate the
 * right public cache entry after a Document save.
 */
export const OWNER_TO_PUBLIC_TYPE: Partial<Record<OwnerType, PublicEntityType>> = {
  ...Object.fromEntries(
    Object.entries(TYPE_TO_OWNER).map(([publicType, owner]) => [owner, publicType]),
  ),
  // Team has a public collection projection but no standalone detail route,
  // so it is intentionally absent from TYPE_TO_OWNER and added only here.
  Team: 'teamMember',
};

export interface PublicRepository {
  findSummary(
    type: PublicEntityType,
    slug: string,
  ): Promise<ImmutablePublic<PublicEntitySummary> | null>;
  findDetail(
    type: PublicDetailEntityType,
    slug: string,
    options?: { preview?: boolean },
  ): Promise<ImmutablePublic<PublicEntityDetail> | null>;
  listSummaries(type: PublicEntityType): Promise<ImmutablePublic<PublicEntitySummary[]>>;
  listNoteIndexEntries(): Promise<ImmutablePublic<PublicNoteIndexEntry[]>>;
  listEngineeringProfileIndexEntries(): Promise<
    ImmutablePublic<PublicEngineeringProfileIndexEntry[]>
  >;
  listDiscoveryEntries(
    types?: readonly PublicEntityType[],
  ): Promise<ImmutablePublic<PublicDiscoveryEntry[]>>;
  getHomepage(now: Date): Promise<ImmutablePublic<PublicHomepageProjection>>;
  /**
   * Homepage eligibility per publicly-visible entry of `type`, keyed by slug.
   * `reason === null` means it would appear if featured. Entries missing from
   * the result are not publicly visible at all.
   */
  listHomepageEligibility(
    type: PublicDetailEntityType,
    now?: Date,
  ): Promise<Array<{ slug: string; reason: string | null }>>;
  /**
   * The multi-collection form used by Studio health. All requested types share
   * one evidence graph and one batched media/taxonomy resolution pass.
   */
  listHomepageEligibilityForTypes(
    types: readonly PublicDetailEntityType[],
    now?: Date,
  ): Promise<
    Partial<Record<PublicDetailEntityType, Array<{ slug: string; reason: string | null }>>>
  >;
}

export function createPublicRepository(source: PublicDataSource): PublicRepository {
  type EvidenceQuery = GraphQuery<
    PublicEvidenceNode,
    HubZeroRelationshipKind,
    PublicRelationshipData
  >;
  type EvidenceContext = {
    query: EvidenceQuery;
    destinations: ReadonlyMap<string, PublicEntityLink>;
    entities: readonly StudioPublicEntity[];
    entitiesByRef: ReadonlyMap<string, StudioPublicEntity>;
    entitiesBySlug: ReadonlyMap<string, StudioPublicEntity>;
    summariesByRef: ReadonlyMap<string, PublicEntitySummary>;
    mediaById: ReadonlyMap<string, Parameters<typeof toPublicMedia>[0]>;
    taxonomyById: ReadonlyMap<
      string,
      Awaited<ReturnType<PublicDataSource['findTaxonomy']>>[number]
    >;
    profilesByTeamId: ReadonlyMap<string, EngineeringProfile>;
  };

  type ResolutionContext = Pick<
    EvidenceContext,
    'entitiesByRef' | 'mediaById' | 'taxonomyById' | 'profilesByTeamId'
  >;

  /**
   * `bypassStatus` exists for exactly one caller: `findDetail`'s Draft Mode
   * preview path (Experience v3 Preview Integrity milestone). It holds every
   * other visibility rule constant — an Engineering Profile whose Team
   * member isn't `publicProfile` still fails, since that's a genuinely
   * different, independent switch — and only answers "if *this* entity's own
   * publish status were `published` right now, would it be visible." It must
   * never be threaded into `resolveRelations`/`resolveTrace`'s lookups of
   * *other* entities — a still-draft related entry stays invisible in a
   * preview exactly as it would once the subject actually publishes.
   */
  async function visible(
    entity: StudioPublicEntity,
    bypassStatus = false,
    context?: ResolutionContext,
  ): Promise<boolean> {
    if (entity.type === 'teamMember') {
      return isPubliclyVisible({
        type: 'teamMember',
        publicProfile: (entity.record as Team).publicProfile,
        archived: (entity.record as Team).archived,
      });
    }
    if (entity.type === 'engineeringProfile') {
      const profile = entity.record as EngineeringProfile;
      const team = context
        ? context.entitiesByRef.get(
            refKey({ type: 'teamMember', id: profile.teamMemberId.toString() }),
          )
        : await source.findEntityById('teamMember', profile.teamMemberId.toString());
      const teamRecord = team?.record as Team | undefined;
      return isPubliclyVisible({
        type: 'engineeringProfile',
        status: bypassStatus ? 'published' : profile.status,
        teamPublic: teamRecord
          ? isPubliclyVisible({
              type: 'teamMember',
              publicProfile: teamRecord.publicProfile,
              archived: teamRecord.archived,
            })
          : false,
      });
    }
    if (bypassStatus) return true;
    return isPubliclyVisible({
      type: entity.type,
      status: (entity.record as { status?: unknown }).status,
    });
  }

  async function terms(
    ids: readonly { toString(): string }[],
    kind: PublicTaxonomyKind,
    context?: ResolutionContext,
  ): Promise<PublicTaxonomyTerm[]> {
    const byId =
      context?.taxonomyById ??
      new Map(
        (await source.findTaxonomy(ids.map((id) => id.toString()))).map((term) => [
          term._id.toString(),
          term,
        ]),
      );
    return ids.flatMap((id) => {
      const term = byId.get(id.toString());
      return term?.kind === kind ? [{ kind, label: term.label, slug: term.slug }] : [];
    });
  }

  async function media(
    id: { toString(): string } | undefined,
    role: Parameters<typeof toPublicMedia>[1],
    context?: ResolutionContext,
  ) {
    if (!id) return undefined;
    const record = context
      ? context.mediaById.get(id.toString())
      : (await source.findMedia([id.toString()]))[0];
    return toPublicMedia(record, role);
  }

  async function gallery(ids: readonly { toString(): string }[], context?: ResolutionContext) {
    const byId =
      context?.mediaById ??
      new Map(
        (await source.findMedia(ids.map((id) => id.toString()))).map((item) => [
          item._id.toString(),
          item,
        ]),
      );
    return ids.flatMap((id) => {
      const resolved = toPublicMedia(byId.get(id.toString()), 'gallery');
      return resolved ? [resolved] : [];
    });
  }

  async function resolveAuthor(userId: string, context?: ResolutionContext): Promise<PublicAuthor> {
    const user = await source.findUser(userId);
    if (!user) return ORGANIZATION_AUTHOR;
    // The uniqueness check intentionally includes hidden and archived Team
    // records. The graph's Team population is visibility-filtered, so using it
    // here could turn a duplicate linkage into a public person attribution.
    const matches = await source.findTeamsByUserId(userId);
    if (matches.length !== 1 || !matches[0]) return ORGANIZATION_AUTHOR;
    const team = matches[0];
    if (
      !isPubliclyVisible({
        type: 'teamMember',
        publicProfile: team.publicProfile,
        archived: team.archived,
      })
    ) {
      return ORGANIZATION_AUTHOR;
    }
    const profile = context
      ? context.profilesByTeamId.get(team._id.toString())
      : await source.findProfileByTeamId(team._id.toString());
    const profileEntity = profile
      ? context
        ? context.entitiesByRef.get(
            refKey({ type: 'engineeringProfile', id: profile._id.toString() }),
          )
        : await source.findEntityById('engineeringProfile', profile._id.toString())
      : null;
    const profileAvailable = Boolean(
      profileEntity && (await visible(profileEntity, false, context)),
    );
    const portrait = await media(team.portraitId, 'portrait', context);
    const technologies =
      profileAvailable && profile ? await terms(profile.technologyIds, 'technology', context) : [];
    return {
      kind: 'person',
      name: team.name,
      ...(team.role ? { role: team.role } : {}),
      ...(portrait ? { portrait } : {}),
      url:
        profileAvailable && profile
          ? publicRoute.entity({ type: 'engineeringProfile', slug: profile.slug })
          : publicRoute.about(),
      profileAvailable,
      ...(technologies.length ? { technologies } : {}),
    };
  }

  /**
   * A Career listing's `hiringManagerTeamId` resolved to a real credit — the
   * same "absent, not fabricated" discipline as `resolveAuthor`. Absent both
   * when no hiring manager is assigned yet, and when the assigned Team
   * member isn't (or isn't yet) publicly visible — exposing an internal-only
   * person on a public page would violate their own visibility switch, not
   * just the Career listing's.
   */
  async function resolveHiringManager(
    teamId?: string,
    context?: ResolutionContext,
  ): Promise<PublicEntityLink | undefined> {
    if (!teamId) return undefined;
    const entity = context
      ? context.entitiesByRef.get(refKey({ type: 'teamMember', id: teamId }))
      : await source.findEntityById('teamMember', teamId);
    if (!entity) return undefined;
    const record = entity.record as Team;
    const teamPublic = isPubliclyVisible({
      type: 'teamMember',
      publicProfile: record.publicProfile,
      archived: record.archived,
    });
    if (!teamPublic) return undefined;
    const profile = context
      ? context.profilesByTeamId.get(teamId)
      : await source.findProfileByTeamId(teamId);
    const profileVisible = Boolean(
      profile &&
      isPubliclyVisible({
        type: 'engineeringProfile',
        status: profile.status,
        teamPublic,
      }),
    );
    return {
      type: 'teamMember',
      title: record.name,
      url: publicRoute.collection('teamMember'),
      referenceId: record.referenceId,
      ...(record.role ? { role: record.role } : {}),
      ...(profileVisible && profile
        ? { profileUrl: publicRoute.entity({ type: 'engineeringProfile', slug: profile.slug }) }
        : {}),
    };
  }

  async function mapSummary(
    entity: StudioPublicEntity,
    includeRelationships = true,
    evidence?: EvidenceContext,
    bypassStatus = false,
    context?: ResolutionContext,
  ): Promise<PublicEntitySummary | null> {
    if (!(await visible(entity, bypassStatus, context))) return null;

    switch (entity.type) {
      case 'work': {
        const record = entity.record as Work;
        if (typeof record.summary !== 'string' || !record.summary.trim()) return null;
        const [technologies, categories, hero] = await Promise.all([
          terms(record.technologyIds, 'technology', context),
          terms(record.categoryTagIds, 'category', context),
          media(record.heroImageId, 'hero', context),
        ]);
        const summary: PublicWorkSummary = {
          type: 'work',
          title: record.title,
          slug: record.slug,
          url: publicRoute.entity({ type: 'work', slug: record.slug }),
          referenceId: record.referenceId,
          summary: record.summary,
          clientType: record.clientType,
          timeline: record.timeline,
          hubZeroRole: record.role,
          technologies,
          categories,
          ...(hero ? { hero } : {}),
        };
        return summary;
      }
      case 'build': {
        const record = entity.record as Build;
        if (typeof record.summary !== 'string' || !record.summary.trim()) return null;
        const [technologies, hero] = await Promise.all([
          terms(record.technologyIds, 'technology', context),
          media(record.heroImageId, 'hero', context),
        ]);
        const links = [
          externalLink('live', 'Open product', record.liveUrl, record.deploymentState),
          externalLink('repository', 'View repository', record.repoUrl),
        ].filter((link): link is PublicExternalLink => Boolean(link));
        const summary: PublicBuildSummary = {
          type: 'build',
          title: record.title,
          slug: record.slug,
          url: publicRoute.entity({ type: 'build', slug: record.slug }),
          referenceId: record.referenceId,
          summary: record.summary,
          deploymentState: record.deploymentState,
          state: record.deploymentState,
          technologies,
          links,
          ...(hero ? { hero } : {}),
        };
        return summary;
      }
      case 'blueprint': {
        const record = entity.record as Blueprint;
        if (!record.shortDescription?.trim() || !record.liveDeploymentUrl) return null;
        const [technologies, hero, previewMedia] = await Promise.all([
          terms(record.technologyIds, 'technology', context),
          media(record.heroImageId, 'hero', context),
          gallery(record.previewAssetIds, context),
        ]);
        // Blueprint publication has a stronger editorial gate than workflow visibility:
        // another team must be able to inspect a real implementation before the record is
        // presented as reusable. This keeps fixture-only records out of routes, discovery,
        // relationships, and collection counts through the shared DTO boundary.
        if (!record.features.length || !previewMedia.length) return null;
        const links = [
          externalLink('live', 'Open live preview', record.liveDeploymentUrl, 'live'),
          externalLink('repository', 'View repository', record.repoUrl),
          externalLink('documentation', 'Read documentation', record.docsUrl),
        ].filter((link): link is PublicExternalLink => Boolean(link));
        if (!links.some((link) => link.kind === 'live')) return null;
        const summary: PublicBlueprintSummary = {
          type: 'blueprint',
          title: record.name,
          slug: record.slug,
          url: publicRoute.entity({ type: 'blueprint', slug: record.slug }),
          referenceId: record.referenceId,
          summary: record.shortDescription,
          architecture: record.architecture,
          designLanguage: record.designLanguage,
          version: record.version,
          state: record.version,
          technologies,
          links,
          previewMedia,
          ...(hero ? { hero } : {}),
        };
        return summary;
      }
      case 'lab': {
        const record = entity.record as Lab;
        if (
          !record.objective?.trim() ||
          !record.researchDirection?.trim() ||
          !record.currentMilestone?.trim() ||
          !(record.startDate instanceof Date)
        ) {
          return null;
        }
        const [technologies, hero] = await Promise.all([
          terms(record.technologyIds, 'technology', context),
          media(record.heroImageId, 'hero', context),
        ]);
        const links = [
          externalLink('repository', 'View repository', record.publicRepoUrl),
          externalLink('demo', 'Open demo', record.liveDemoUrl),
        ].filter((link): link is PublicExternalLink => Boolean(link));
        const summary: PublicLabSummary = {
          type: 'lab',
          title: record.title,
          slug: record.slug,
          url: publicRoute.entity({ type: 'lab', slug: record.slug }),
          referenceId: record.referenceId,
          summary: record.objective,
          stage: record.stage,
          state: record.stage,
          researchDirection: record.researchDirection,
          currentMilestone: record.currentMilestone,
          startDate: record.startDate.toISOString(),
          ...(record.lastMajorUpdateAt instanceof Date
            ? { lastMajorUpdate: record.lastMajorUpdateAt.toISOString() }
            : {}),
          technologies,
          links,
          ...(hero ? { hero } : {}),
        };
        return summary;
      }
      case 'note': {
        const record = entity.record as Note;
        if (!record.summary?.trim() || !(record.publicationDate instanceof Date)) return null;
        const [technologies, hero, author] = await Promise.all([
          terms(record.technologyIds, 'technology', context),
          media(record.heroImageId, 'hero', context),
          resolveAuthor(record.authorId.toString(), context),
        ]);
        const summary: PublicNoteSummary = {
          type: 'note',
          title: record.title,
          slug: record.slug,
          url: publicRoute.entity({ type: 'note', slug: record.slug }),
          referenceId: record.referenceId,
          summary: record.summary,
          publicationDate: record.publicationDate.toISOString(),
          state: record.publicationDate.toISOString(),
          author,
          technologies,
          ...(hero ? { hero } : {}),
        };
        return summary;
      }
      case 'engineeringProfile': {
        const record = entity.record as EngineeringProfile;
        const teamEntity = context
          ? context.entitiesByRef.get(
              refKey({ type: 'teamMember', id: record.teamMemberId.toString() }),
            )
          : await source.findEntityById('teamMember', record.teamMemberId.toString());
        if (!teamEntity || !(await visible(teamEntity, false, context))) return null;
        const team = teamEntity.record as Team;
        const [technologies, portrait, hero] = await Promise.all([
          terms(record.technologyIds, 'technology', context),
          media(record.portraitId ?? team.portraitId, 'portrait', context),
          media(record.heroMediaId, 'hero', context),
        ]);
        const summary: PublicEngineeringProfileSummary = {
          type: 'engineeringProfile',
          title: team.name,
          slug: record.slug,
          url: publicRoute.entity({ type: 'engineeringProfile', slug: record.slug }),
          referenceId: record.referenceId,
          summary: record.overview,
          role: team.role,
          engineeringIdentity: [...record.engineeringIdentity],
          currentExploration: record.currentExploration,
          state: record.currentExploration,
          technologies,
          ...(portrait ? { portrait } : {}),
          ...(hero ? { hero } : {}),
        };
        return summary;
      }
      case 'teamMember': {
        const record = entity.record as Team;
        const teamPublic = isPubliclyVisible({
          type: 'teamMember',
          publicProfile: record.publicProfile,
          archived: record.archived,
        });
        const profile = context
          ? context.profilesByTeamId.get(entity.id)
          : await source.findProfileByTeamId(entity.id);
        const profileVisible = Boolean(
          profile &&
          isPubliclyVisible({
            type: 'engineeringProfile',
            status: profile.status,
            teamPublic,
          }),
        );
        const portrait = await media(record.portraitId, 'portrait', context);
        const profileTechnologies =
          profileVisible && profile
            ? await terms(profile.technologyIds, 'technology', context)
            : [];
        const summary: PublicTeamMemberSummary = {
          type: 'teamMember',
          title: record.name,
          url: publicRoute.collection('teamMember'),
          referenceId: record.referenceId,
          summary: record.bio,
          role: record.role,
          group: record.group,
          publicCategory: record.publicCategory,
          founder: record.founder,
          technologies: [],
          ...(record.joinedAt ? { joinedAt: record.joinedAt.toISOString() } : {}),
          ...(portrait ? { portrait, hero: portrait } : {}),
          ...(profileVisible && profile
            ? {
                profile: {
                  type: 'engineeringProfile',
                  title: record.name,
                  url: publicRoute.entity({ type: 'engineeringProfile', slug: profile.slug }),
                  referenceId: profile.referenceId,
                  summary: profile.overview,
                  state: profile.currentExploration,
                  ...(profileTechnologies.length ? { technologies: profileTechnologies } : {}),
                },
              }
            : {}),
        };
        return summary;
      }
      case 'service': {
        const record = entity.record as Service;
        const relationships = includeRelationships ? await resolveRelations(entity, evidence) : [];
        const summary: PublicServiceSummary = {
          type: 'service',
          title: record.title,
          url: publicRoute.collection('service'),
          summary: record.description,
          technologies: [],
          evidence: relationships,
        };
        return summary;
      }
      case 'career': {
        const record = entity.record as Career;
        if (!record.summary?.trim()) return null;
        const technologies = await terms(record.technologyIds, 'technology', context);
        const summary: PublicCareerSummary = {
          type: 'career',
          title: record.title,
          slug: record.slug,
          url: publicRoute.entity({ type: 'career', slug: record.slug }),
          referenceId: record.referenceId,
          summary: record.summary,
          location: record.location,
          employmentType: record.employmentType,
          experienceLevel: record.experienceLevel,
          technologies,
          ...(record.compensation ? { compensation: record.compensation } : {}),
        };
        return summary;
      }
    }
  }

  /**
   * The one place a public evidence/discovery graph gets built: list every
   * entity of the given types, keep only what's publicly visible, then
   * assemble the node/destination/assertion inputs `createGraphQuery` needs.
   * `buildEvidenceQuery` and `listDiscoveryEntries` used to each duplicate
   * this sequence independently; both now call this with their own `types`.
   */
  async function buildResolutionContext(
    entities: readonly StudioPublicEntity[],
  ): Promise<ResolutionContext & { entitiesBySlug: ReadonlyMap<string, StudioPublicEntity> }> {
    const entitiesByRef = new Map(
      entities.map((entity) => [refKey({ type: entity.type, id: entity.id }), entity]),
    );
    const entitiesBySlug = new Map<string, StudioPublicEntity>();
    const profilesByTeamId = new Map<string, EngineeringProfile>();
    const mediaIds = new Set<string>();
    const taxonomyIds = new Set<string>();

    const addIds = (target: Set<string>, ids: readonly { toString(): string }[] | undefined) => {
      for (const id of ids ?? []) target.add(id.toString());
    };
    const addId = (target: Set<string>, id: { toString(): string } | undefined) => {
      if (id) target.add(id.toString());
    };

    for (const entity of entities) {
      if ('slug' in entity.record && typeof entity.record.slug === 'string') {
        entitiesBySlug.set(`${entity.type}:${entity.record.slug}`, entity);
      }

      switch (entity.type) {
        case 'work': {
          const record = entity.record as Work;
          addIds(taxonomyIds, record.technologyIds);
          addIds(taxonomyIds, record.categoryTagIds);
          addId(mediaIds, record.heroImageId);
          break;
        }
        case 'build': {
          const record = entity.record as Build;
          addIds(taxonomyIds, record.technologyIds);
          addId(mediaIds, record.heroImageId);
          addIds(mediaIds, record.galleryImageIds);
          break;
        }
        case 'blueprint': {
          const record = entity.record as Blueprint;
          addIds(taxonomyIds, record.technologyIds);
          addId(mediaIds, record.heroImageId);
          addIds(mediaIds, record.previewAssetIds);
          break;
        }
        case 'lab': {
          const record = entity.record as Lab;
          addIds(taxonomyIds, record.technologyIds);
          addId(mediaIds, record.heroImageId);
          addIds(mediaIds, record.galleryImageIds);
          break;
        }
        case 'note': {
          const record = entity.record as Note;
          addIds(taxonomyIds, record.technologyIds);
          addId(mediaIds, record.heroImageId);
          addIds(mediaIds, record.galleryImageIds);
          break;
        }
        case 'engineeringProfile': {
          const record = entity.record as EngineeringProfile;
          profilesByTeamId.set(record.teamMemberId.toString(), record);
          addIds(taxonomyIds, record.technologyIds);
          addId(mediaIds, record.portraitId);
          addId(mediaIds, record.heroMediaId);
          addIds(mediaIds, record.galleryImageIds);
          break;
        }
        case 'teamMember': {
          const record = entity.record as Team;
          addId(mediaIds, record.portraitId);
          break;
        }
        case 'career':
          addIds(taxonomyIds, (entity.record as Career).technologyIds);
          break;
        case 'service':
          break;
      }
    }

    const [mediaRecords, taxonomyRecords] = await Promise.all([
      source.findMedia([...mediaIds]),
      source.findTaxonomy([...taxonomyIds]),
    ]);

    return {
      entitiesByRef,
      entitiesBySlug,
      profilesByTeamId,
      mediaById: new Map(mediaRecords.map((record) => [record._id.toString(), record])),
      taxonomyById: new Map(taxonomyRecords.map((record) => [record._id.toString(), record])),
    };
  }

  async function buildGraph(
    types: readonly PublicEntityType[],
  ): Promise<
    EvidenceContext & { visible: { entity: StudioPublicEntity; summary: PublicEntitySummary }[] }
  > {
    const entities = (await Promise.all(types.map((type) => source.listEntities(type)))).flat();
    const resolution = await buildResolutionContext(entities);
    const projected = await Promise.all(
      entities.map(async (entity) => {
        const summary = await mapSummary(entity, false, undefined, false, resolution);
        return summary ? { entity, summary } : null;
      }),
    );
    const visible = compact(projected);
    const destinations = new Map(
      visible.map(({ entity, summary }) => [
        refKey({ type: entity.type, id: entity.id }),
        toEntityLink(summary),
      ]),
    );
    const nodes: PublicEvidenceNode[] = visible.map(({ entity, summary }) => ({
      ref: { type: entity.type, id: entity.id },
      label: summary.title,
      data: undefined,
    }));
    return {
      query: createGraphQuery(
        normalizePublicEntityGraph(
          nodes,
          visible.flatMap(({ entity }) => assertionsFrom(entity)),
        ),
      ),
      destinations,
      entities,
      ...resolution,
      summariesByRef: new Map(
        visible.map(({ entity, summary }) => [
          refKey({ type: entity.type, id: entity.id }),
          summary,
        ]),
      ),
      visible,
    };
  }

  async function buildEvidenceQuery(): Promise<EvidenceContext> {
    return buildGraph(ALL_PUBLIC_TYPES);
  }

  async function resolveRelations(
    entity: StudioPublicEntity,
    context?: EvidenceContext,
  ): Promise<PublicRelationship[]> {
    const { query, destinations } = context ?? (await buildEvidenceQuery());
    // An Engineering Profile and its underlying Team member are the same
    // public identity for contributor credit — those edges are always
    // asserted against Team (`teamContributedToEntry`, never a profile id
    // directly), so a profile's own page needs its `teamMemberId` as an
    // alias to still surface "Contributed to" edges asserted against it.
    const aliasSource =
      entity.type === 'engineeringProfile'
        ? {
            type: 'teamMember' as const,
            id: String((entity.record as EngineeringProfile).teamMemberId),
          }
        : undefined;
    const projection = projectEvidence(
      query,
      destinations,
      { type: entity.type, id: entity.id },
      aliasSource ? [aliasSource] : [],
    );
    return projection ? [...projection.relationships] : [];
  }

  /**
   * Trace: the same `EvidenceContext` `resolveRelations` uses, walked
   * multi-hop instead of one-hop. `direction` defaults to `'inbound'`
   * (Phase 6's original, unchanged behavior) — backward, reading naturally
   * from a Work item: what Build informed it, what Lab that Build
   * originated from. Passing `'outbound'` (Phase 8, for Lab) walks the
   * same edges forward instead: what this Lab graduated into, where that
   * Build was applied.
   */
  async function resolveTrace(
    entity: StudioPublicEntity,
    context?: EvidenceContext,
    direction: 'inbound' | 'outbound' = 'inbound',
  ): Promise<PublicRelationship[]> {
    const { query, destinations } = context ?? (await buildEvidenceQuery());
    const projection = projectTrace(
      query,
      destinations,
      { type: entity.type, id: entity.id },
      { direction },
    );
    return projection ? [...projection.steps] : [];
  }

  async function findSummary(type: PublicEntityType, slug: string) {
    const entity = await source.findEntityBySlug(type, slug);
    if (!entity) return null;
    const evidence = type === 'service' ? await buildEvidenceQuery() : undefined;
    return mapSummary(entity, true, evidence);
  }

  async function listSummaries(type: PublicEntityType): Promise<PublicEntitySummary[]> {
    const entities = await source.listEntities(type);
    const evidence = type === 'service' ? await buildEvidenceQuery() : undefined;
    // Ordered before mapping, so every public collection page renders the same
    // editorial ranking the homepage takes its featured entries from. Types
    // with no `featuredOrder` are unaffected: none of them is featured, so the
    // ordering is the identity.
    const summaries = await Promise.all(
      editoriallyOrdered(entities).map((entity) => mapSummary(entity, true, evidence)),
    );
    return summaries.filter((summary): summary is PublicEntitySummary => summary !== null);
  }

  async function listNoteIndexEntries(): Promise<PublicNoteIndexEntry[]> {
    const entities = await source.listEntities('note');
    const evidence = await buildEvidenceQuery();
    const entries = await Promise.all(
      entities.map(async (entity) => {
        const note = await mapSummary(entity);
        if (!note || note.type !== 'note') return null;
        return {
          id: entity.id,
          featuredOrder:
            'featuredOrder' in entity.record ? (entity.record.featuredOrder ?? null) : null,
          entry: { note, relationships: await resolveRelations(entity, evidence) },
        };
      }),
    );

    // Notes keep publication date as their default order, and editorial intent
    // is layered on top of it — the same two steps every collection takes. The
    // summary carries no `featuredOrder`, so it is held alongside from the
    // entity rather than re-read from the database.
    const byDate = compact(entries).sort(
      (left, right) =>
        new Date(right.entry.note.publicationDate).getTime() -
        new Date(left.entry.note.publicationDate).getTime(),
    );

    return orderEditorially(byDate).map((row): PublicNoteIndexEntry => row.entry);
  }

  async function listEngineeringProfileIndexEntries(): Promise<
    PublicEngineeringProfileIndexEntry[]
  > {
    const entities = await source.listEntities('engineeringProfile');
    const evidence = await buildEvidenceQuery();
    const entries = await Promise.all(
      sortEntities(entities).map(
        async (entity): Promise<PublicEngineeringProfileIndexEntry | null> => {
          if (!('slug' in entity.record)) return null;
          const detail = await findDetail('engineeringProfile', entity.record.slug, evidence);
          if (!detail || detail.type !== 'engineeringProfile') return null;
          return {
            profile: detail,
            areasOfExpertise: [...detail.areasOfExpertise],
            relationships: [...detail.relationships],
          };
        },
      ),
    );
    return compact(entries);
  }

  async function findDetail(
    type: PublicDetailEntityType,
    slug: string,
    evidence?: EvidenceContext,
    options?: { preview?: boolean },
  ): Promise<PublicEntityDetail | null> {
    // A detail can ask for both one-hop relationships and a multi-hop Trace.
    // Without carrying one context through both, each resolver independently
    // rebuilt the complete public graph. Build it once at the boundary and
    // reuse it for the subject summary, relationships, and trace.
    if (!evidence) {
      return findDetail(type, slug, await buildEvidenceQuery(), options);
    }

    const evidenceEntity = evidence?.entitiesBySlug.get(`${type}:${slug}`);
    const entity = evidenceEntity ?? (await source.findEntityBySlug(type, slug));
    if (!entity) return null;
    // Only the subject's own status gate bypasses — everything downstream
    // (relationships, trace) still resolves other entities' real visibility.
    const summary = options?.preview
      ? await mapSummary(entity, true, undefined, true)
      : evidenceEntity
        ? (evidence?.summariesByRef.get(refKey({ type: entity.type, id: entity.id })) ?? null)
        : await mapSummary(entity, true);
    if (!summary || summary.type !== type) return null;
    const documents = await publicDocuments(type, entity.id);
    const relationships = await resolveRelations(entity, evidence);

    switch (type) {
      case 'work': {
        if (summary.type !== 'work' || !hasRoles(documents, ['caseStudy'])) return null;
        return {
          ...summary,
          documents,
          relationships,
          // Work repositories require a future explicit public-intent field. A populated
          // Studio URL alone is not sufficient evidence that a client repository is public.
          links: [],
          trace: await resolveTrace(entity, evidence),
        };
      }
      case 'build': {
        if (summary.type !== 'build' || !isBuildDetailEligible(documents)) return null;
        return {
          ...summary,
          documents,
          relationships,
          gallery: await gallery((entity.record as Build).galleryImageIds, evidence),
        };
      }
      case 'blueprint': {
        if (summary.type !== 'blueprint' || !hasRoles(documents, ['caseStudy'])) return null;
        return {
          ...summary,
          documents,
          relationships,
          features: [...(entity.record as Blueprint).features],
        };
      }
      case 'lab': {
        if (summary.type !== 'lab' || !documents.length) return null;
        const record = entity.record as Lab;
        return {
          ...summary,
          documents,
          relationships,
          graduationCriteria: record.graduationCriteria,
          gallery: await gallery(record.galleryImageIds, evidence),
          milestones: record.milestones.map((milestone) => ({
            title: milestone.title,
            date: milestone.date.toISOString(),
            summary: milestone.summary,
          })),
          trace: await resolveTrace(entity, evidence, 'outbound'),
        };
      }
      case 'note': {
        if (summary.type !== 'note' || !hasRoles(documents, ['body'])) return null;
        const body = documents.find((document) => document.role === 'body');
        if (!body) return null;
        return {
          ...summary,
          documents,
          relationships,
          gallery: await gallery((entity.record as Note).galleryImageIds, evidence),
          readingTimeMinutes: estimateReadingTimeMinutes(body.blocks),
        };
      }
      case 'engineeringProfile': {
        if (summary.type !== 'engineeringProfile') return null;
        const record = entity.record as EngineeringProfile;
        return {
          ...summary,
          documents,
          relationships: deduplicateProfileEvidence(relationships),
          engineeringPhilosophy: record.engineeringPhilosophy,
          currentInterests: [...record.currentInterests],
          areasOfExpertise: [...record.areasOfExpertise],
          gallery: await gallery(record.galleryImageIds, evidence),
        };
      }
      case 'career': {
        if (summary.type !== 'career') return null;
        const record = entity.record as Career;
        const hiringManager = await resolveHiringManager(
          record.hiringManagerTeamId?.toString(),
          evidence,
        );
        return {
          ...summary,
          documents,
          relationships,
          responsibilities: [...record.responsibilities],
          requirements: [...record.requirements],
          benefits: [...record.benefits],
          applicationProcess: record.applicationProcess,
          ...(hiringManager ? { hiringManager } : {}),
        };
      }
    }
  }

  async function publicDocuments(type: PublicDetailEntityType, id: string) {
    const documents = await source.findDocuments(TYPE_TO_OWNER[type], id);
    return toPublicDocuments(source, documents);
  }

  async function homepageFeature<T extends PublicEntitySummary>(
    entity: StudioPublicEntity,
    expectedType: T['type'],
    now: Date,
    evidence: EvidenceContext,
  ): Promise<PublicHomepageFeature<T> | null> {
    if (!('slug' in entity.record)) return null;
    const detail = await findDetail(
      expectedType as PublicDetailEntityType,
      entity.record.slug,
      evidence,
    );
    if (!detail || detail.type !== expectedType || !isHomepageEligible(detail, now)) return null;
    return {
      entity: detail as unknown as T,
      // Keep the canonical relationship graph intact. Presentation surfaces may
      // classify and bound relationships after this repository boundary.
      relationships: [...detail.relationships],
    };
  }

  /**
   * `publishedRecordCount` is the sum of `listEntities(type).length` for
   * every type this function already fetches below — `status: 'published'`
   * is applied at the query level (see `mongodb-source.ts`), so this is a
   * true published-record count, not the length of the featured/capped
   * arrays this function also returns for homepage display. No additional
   * query: the six arrays summed here are already fetched for every other
   * field on this projection. It intentionally does not depend on
   * `PUBLIC_ENTITY_ROUTES` (a presentation-layer feature flag) — a record's
   * published state is a data-layer fact independent of whether its
   * section happens to be toggled on for navigation right now.
   */
  async function getHomepage(now: Date): Promise<PublicHomepageProjection> {
    const evidence = await buildEvidenceQuery();
    const byType = (type: PublicEntityType) =>
      evidence.entities.filter((entity) => entity.type === type);
    const workEntities = byType('work');
    const buildEntities = byType('build');
    const blueprintEntities = byType('blueprint');
    const labEntities = byType('lab');
    const noteEntities = byType('note');
    const profiles = byType('engineeringProfile');

    const work = compact(
      await Promise.all(
        featuredEntities(workEntities).map((entity) =>
          homepageFeature<PublicWorkSummary>(entity, 'work', now, evidence),
        ),
      ),
    ).slice(0, 1);
    const builds = compact(
      await Promise.all(
        featuredEntities(buildEntities).map((entity) =>
          homepageFeature<PublicBuildSummary>(entity, 'build', now, evidence),
        ),
      ),
    ).slice(0, 2);
    const blueprints = compact(
      await Promise.all(
        featuredEntities(blueprintEntities).map((entity) =>
          homepageFeature<PublicBlueprintSummary>(entity, 'blueprint', now, evidence),
        ),
      ),
    );
    const labs = compact(
      await Promise.all(
        featuredEntities(labEntities).map((entity) =>
          homepageFeature<PublicLabSummary>(entity, 'lab', now, evidence),
        ),
      ),
    ).slice(0, 2);
    // Previously gated behind "only surface Notes once at least five
    // substantive ones exist" — a hardcoded editorial judgement the editor
    // could neither see nor override. Featuring a Note is now that judgement,
    // made explicitly (v3.1 Milestone 2).
    const notes = compact(
      await Promise.all(
        featuredEntities(noteEntities).map((entity) =>
          homepageFeature<PublicNoteSummary>(entity, 'note', now, evidence),
        ),
      ),
    ).slice(0, 3);
    const engineeringProfiles = compact(
      await Promise.all(
        profiles.map((entity) =>
          homepageFeature<PublicEngineeringProfileSummary>(
            entity,
            'engineeringProfile',
            now,
            evidence,
          ),
        ),
      ),
    )
      .filter((feature) =>
        feature.relationships.some(
          (relationship) => relationship.kind === 'teamContributedToEntry',
        ),
      )
      .sort(compareHomepageEngineeringProfiles)
      .slice(0, 4);

    return {
      work,
      builds,
      labs,
      notes,
      ...(blueprints[0] ? { blueprint: blueprints[0] } : {}),
      profiles: engineeringProfiles,
      publishedRecordCount:
        workEntities.length +
        buildEntities.length +
        blueprintEntities.length +
        labEntities.length +
        noteEntities.length +
        profiles.length,
    };
  }

  async function listHomepageEligibilityForTypes(
    types: readonly PublicDetailEntityType[],
    now: Date,
  ): Promise<
    Partial<Record<PublicDetailEntityType, Array<{ slug: string; reason: string | null }>>>
  > {
    const uniqueTypes = [...new Set(types)];
    if (uniqueTypes.length === 0) return {};

    // Relationship eligibility must see every public type, but that graph is
    // built once for the whole health snapshot rather than once per collection.
    const evidence = await buildEvidenceQuery();
    const result: Partial<
      Record<PublicDetailEntityType, Array<{ slug: string; reason: string | null }>>
    > = {};

    await Promise.all(
      uniqueTypes.map(async (type) => {
        const entities = evidence.entities.filter((entity) => entity.type === type);
        const rows = await Promise.all(
          entities.map(async (entity) => {
            if (!('slug' in entity.record)) return null;
            const slug = entity.record.slug;
            const detail = await findDetail(type, slug, evidence);
            if (!detail) return null;
            return { slug, reason: homepageIneligibilityReason(detail, now) };
          }),
        );
        result[type] = rows.filter(
          (row): row is { slug: string; reason: string | null } => row !== null,
        );
      }),
    );

    return result;
  }

  return {
    async findSummary(type, slug) {
      return freezePublicDto(await findSummary(type, slug));
    },
    async findDetail(type, slug, options) {
      return freezePublicDto(await findDetail(type, slug, undefined, options));
    },
    async listSummaries(type) {
      return freezePublicDto(await listSummaries(type));
    },
    async listNoteIndexEntries() {
      return freezePublicDto(await listNoteIndexEntries());
    },
    async listEngineeringProfileIndexEntries() {
      return freezePublicDto(await listEngineeringProfileIndexEntries());
    },
    async listDiscoveryEntries(types = ALL_PUBLIC_TYPES) {
      const { query, destinations, visible } = await buildGraph(types);
      const entries = await Promise.all(
        visible.map(async ({ entity, summary }) =>
          projectSearchEntry(query, destinations, { type: entity.type, id: entity.id }, summary),
        ),
      );
      return freezePublicDto(entries);
    },
    async getHomepage(now) {
      return freezePublicDto(await getHomepage(now));
    },
    /**
     * Per-entry homepage eligibility for a collection, keyed by slug.
     *
     * Exists so the Studio can explain, before an editor commits to featuring
     * something, why it would or would not actually appear — using the same
     * predicate the homepage itself applies rather than a Studio-side
     * re-description of it that could drift.
     *
     * Entries absent from the returned map are not publicly visible at all
     * (unpublished, or otherwise failing the visibility gate), which is a
     * different and more basic reason than failing an editorial quality check.
     */
    async listHomepageEligibility(type, now = new Date()) {
      const result = await listHomepageEligibilityForTypes([type], now);
      return result[type] ?? [];
    },
    async listHomepageEligibilityForTypes(types, now = new Date()) {
      return listHomepageEligibilityForTypes(types, now);
    },
  };
}

function freezePublicDto<T>(value: T): ImmutablePublic<T> {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) freezePublicDto(child);
    Object.freeze(value);
  }
  return value as ImmutablePublic<T>;
}

const ALL_PUBLIC_TYPES: readonly PublicEntityType[] = [
  'work',
  'build',
  'blueprint',
  'lab',
  'note',
  'engineeringProfile',
  'teamMember',
  'service',
  'career',
];

function externalLink(
  kind: PublicExternalLink['kind'],
  label: string,
  url?: string,
  availability?: PublicExternalLink['availability'],
): PublicExternalLink | null {
  return url && isSafePublicUrl(url)
    ? { kind, label, url, ...(availability ? { availability } : {}) }
    : null;
}

function toEntityLink(summary: PublicEntitySummary): PublicEntityLink {
  return {
    type: summary.type,
    title: summary.title,
    url: summary.url,
    ...(summary.referenceId ? { referenceId: summary.referenceId } : {}),
    ...(summary.summary ? { summary: summary.summary } : {}),
    ...(summary.state ? { state: summary.state } : {}),
    ...(summary.type === 'engineeringProfile' && summary.role ? { role: summary.role } : {}),
    ...(summary.type === 'teamMember' && summary.role ? { role: summary.role } : {}),
    ...(summary.type === 'teamMember' && summary.profile
      ? { profileUrl: summary.profile.url }
      : {}),
  };
}

function compact<T>(values: readonly (T | null)[]): T[] {
  return values.filter((value): value is T => value !== null);
}

function deduplicateProfileEvidence(
  relationships: readonly PublicRelationship[],
): PublicRelationship[] {
  const byTarget = new Map<string, PublicRelationship>();
  for (const relationship of relationships) {
    const current = byTarget.get(relationship.target.url);
    if (
      !current ||
      (current.kind === 'profileFeaturesEvidence' && relationship.kind === 'teamContributedToEntry')
    ) {
      byTarget.set(relationship.target.url, relationship);
    }
  }
  return [...byTarget.values()];
}

/**
 * The featured entries of a collection, in the order an editor chose
 * (v3.1 Milestone 2).
 *
 * This replaced two separate mechanisms: a boolean `featured` flag that said
 * *whether* something was featured but never in what order, and a
 * `referenceId`-descending sort that silently decided the order for the
 * editor. Reference-ID order is a fact about when a record was created, not a
 * statement about what deserves the lead slot — using it as an editorial
 * ranking was the hardcoded selection this milestone exists to remove.
 *
 * Ordering itself is delegated to `selectFeatured` so the public site and the
 * Studio's own reorder screen cannot disagree about what "first" means.
 */
function featuredEntities(entities: readonly StudioPublicEntity[]): StudioPublicEntity[] {
  return selectFeatured(orderable(entities)).map((row) => row.entity);
}

/**
 * The same collection in canonical editorial order: featured first, then
 * everything else in the order it arrived (v3.1 Milestone 12).
 *
 * This and `featuredEntities` read the *same* `featuredOrder` through the
 * *same* extraction, and the homepage's list is literally the featured prefix
 * of this one. That is what makes "there is only one editorial order" a
 * structural fact rather than a convention two call sites have to honour.
 */
function editoriallyOrdered(entities: readonly StudioPublicEntity[]): StudioPublicEntity[] {
  return orderEditorially(orderable(entities)).map((row) => row.entity);
}

/** The one place a public entity's stored `featuredOrder` is read. */
function orderable(entities: readonly StudioPublicEntity[]) {
  return entities.map((entity) => ({
    id: entity.id,
    featuredOrder: 'featuredOrder' in entity.record ? (entity.record.featuredOrder ?? null) : null,
    entity,
  }));
}

function sortEntities(entities: readonly StudioPublicEntity[]): StudioPublicEntity[] {
  return [...entities].sort((left, right) => {
    const leftReference = 'referenceId' in left.record ? left.record.referenceId : left.id;
    const rightReference = 'referenceId' in right.record ? right.record.referenceId : right.id;
    return rightReference.localeCompare(leftReference);
  });
}

function isRecent(date: string | undefined, now: Date, maxAgeDays = 180): boolean {
  if (!date) return false;
  const value = new Date(date);
  if (Number.isNaN(value.getTime()) || value > now) return false;
  return now.getTime() - value.getTime() <= maxAgeDays * 24 * 60 * 60 * 1000;
}

/**
 * Why an entry cannot appear on the homepage, or `null` if it can.
 *
 * Same conditions as before, restated so they can be *shown* rather than only
 * applied (v3.1 Milestone 2 finalization). No rule changed here: an editor who
 * features something that never appears was previously given no explanation,
 * and reading the reason out of the same switch that enforces it is what keeps
 * the Studio's explanation and the public site's behaviour from drifting.
 */
function homepageIneligibilityReason(detail: PublicEntityDetail, now: Date): string | null {
  switch (detail.type) {
    case 'work':
      return hasSubstantiveDocument(detail.documents) ? null : 'Needs a substantive case study.';
    case 'build':
      return isBuildHomepageEligible({
        hasHero: Boolean(detail.hero),
        documents: detail.documents,
      })
        ? null
        : 'Needs a hero image and a substantive document.';
    case 'blueprint':
      if (detail.previewMedia.length === 0) return 'Needs at least one preview image.';
      if (detail.features.length === 0) return 'Needs at least one listed feature.';
      return hasSubstantiveDocument(detail.documents) ? null : 'Needs a substantive case study.';
    case 'lab':
      if (!isRecent(detail.lastMajorUpdate, now)) return 'Needs a recent major update.';
      if (detail.milestones.length === 0) return 'Needs at least one progress milestone.';
      if (detail.technologies.length === 0) return 'Needs at least one technology tagged.';
      return hasSubstantiveDocument(detail.documents) ? null : 'Needs a substantive document.';
    case 'note':
      if (!isRecent(detail.publicationDate, now)) return 'Publication date is not recent.';
      return hasSubstantiveDocument(detail.documents) ? null : 'Needs a substantive write-up.';
    case 'engineeringProfile':
      return isEngineeringProfileHomepageEligible({
        hasPortrait: Boolean(detail.portrait),
        contributionCount: detail.relationships.filter(
          (relationship) => relationship.kind === 'teamContributedToEntry',
        ).length,
        documents: detail.documents,
      })
        ? null
        : 'Needs a portrait, contributions, and a substantive document.';
    case 'career':
      // Careers is not one of the Homepage's four pillars — `getHomepage()`
      // never fetches it, so this branch exists only to keep this switch
      // exhaustive over `PublicEntityDetail`.
      return 'Careers never appear on the homepage.';
  }
}

function isHomepageEligible(detail: PublicEntityDetail, now: Date): boolean {
  return homepageIneligibilityReason(detail, now) === null;
}

export function compareHomepageEngineeringProfiles(
  left: PublicHomepageFeature<PublicEngineeringProfileSummary>,
  right: PublicHomepageFeature<PublicEngineeringProfileSummary>,
): number {
  const leftContributions = left.relationships.filter(
    (relationship) => relationship.kind === 'teamContributedToEntry',
  ).length;
  const rightContributions = right.relationships.filter(
    (relationship) => relationship.kind === 'teamContributedToEntry',
  ).length;
  return (
    rightContributions - leftContributions || left.entity.title.localeCompare(right.entity.title)
  );
}

function evidenceType(
  reference: EntryReference | ServiceEvidenceReference | CareerEntryReference,
): PublicEntityType {
  return OWNER_TO_PUBLIC_TYPE[reference.ownerType] as PublicEntityType;
}

/**
 * Every relationship a record asserts, derived from its own stored fields.
 *
 * Exported (v3.1 Milestone 4) so Studio-side integrity checking reads the same
 * derivation the public site does, rather than a second description of which
 * fields are relationships. It is deliberately status-blind — it reports what a
 * record *claims*, not what is publicly visible — which is exactly what an
 * integrity checker needs: a reference to an archived entry is still a
 * reference, and only a checker that can see it can report it.
 */
export function assertionsFrom(entity: StudioPublicEntity): RelationshipAssertion[] {
  const { type, id } = entity;
  if (type === 'work') {
    const record = entity.record as Work;
    return [
      ...(record.relatedBuildIds ?? []).map((buildId) => ({
        kind: 'buildAppliedInWork' as const,
        fromType: 'build' as const,
        fromId: buildId.toString(),
        toType: 'work' as const,
        toId: id,
      })),
      ...(record.relatedBlueprintIds ?? []).map((blueprintId) => ({
        kind: 'artifactUsesBlueprint' as const,
        fromType: 'work' as const,
        fromId: id,
        toType: 'blueprint' as const,
        toId: blueprintId.toString(),
      })),
      ...(record.relatedLabIds ?? []).map((labId) => ({
        kind: 'workRelatedLab' as const,
        fromType: 'work' as const,
        fromId: id,
        toType: 'lab' as const,
        toId: labId.toString(),
      })),
      ...(record.contributors ?? []).map((teamId) => ({
        kind: 'teamContributedToEntry' as const,
        fromType: 'work' as const,
        fromId: id,
        toType: 'teamMember' as const,
        toId: teamId.toString(),
      })),
    ];
  }
  if (type === 'build') {
    const record = entity.record as Build;
    return [
      ...(record.relatedWorkIds ?? []).map((workId) => ({
        kind: 'buildAppliedInWork' as const,
        fromType: 'build' as const,
        fromId: id,
        toType: 'work' as const,
        toId: workId.toString(),
      })),
      ...(record.originatingLabId
        ? [
            {
              kind: 'labGraduatedToBuild' as const,
              fromType: 'lab' as const,
              fromId: record.originatingLabId.toString(),
              toType: 'build' as const,
              toId: id,
            },
          ]
        : []),
      ...(record.contributors ?? []).map((teamId) => ({
        kind: 'teamContributedToEntry' as const,
        fromType: 'build' as const,
        fromId: id,
        toType: 'teamMember' as const,
        toId: teamId.toString(),
      })),
    ];
  }
  if (type === 'blueprint') {
    const record = entity.record as Blueprint;
    return [
      ...(record.contributors ?? []).map((teamId) => ({
        kind: 'teamContributedToEntry' as const,
        fromType: 'blueprint' as const,
        fromId: id,
        toType: 'teamMember' as const,
        toId: teamId.toString(),
      })),
    ];
  }
  if (type === 'lab') {
    const record = entity.record as Lab;
    return [
      ...(record.graduatedToBuildId
        ? [
            {
              kind: 'labGraduatedToBuild' as const,
              fromType: 'lab' as const,
              fromId: id,
              toType: 'build' as const,
              toId: record.graduatedToBuildId.toString(),
            },
          ]
        : []),
      ...(record.relatedBuildIds ?? []).map((buildId) => ({
        kind: 'labRelatedBuild' as const,
        fromType: 'lab' as const,
        fromId: id,
        toType: 'build' as const,
        toId: buildId.toString(),
      })),
      ...(record.relatedBlueprintIds ?? []).map((blueprintId) => ({
        kind: 'labRelatedBlueprint' as const,
        fromType: 'lab' as const,
        fromId: id,
        toType: 'blueprint' as const,
        toId: blueprintId.toString(),
      })),
      ...(record.contributors ?? []).map((teamId) => ({
        kind: 'teamContributedToEntry' as const,
        fromType: 'lab' as const,
        fromId: id,
        toType: 'teamMember' as const,
        toId: teamId.toString(),
      })),
    ];
  }
  if (type === 'note') {
    const record = entity.record as Note;
    return [
      ...(record.relatedEntries ?? []).map((reference) => ({
        kind: 'noteDiscussesArtifact' as const,
        fromType: 'note' as const,
        fromId: id,
        toType: evidenceType(reference),
        toId: reference.ownerId.toString(),
      })),
      ...(record.contributors ?? []).map((teamId) => ({
        kind: 'teamContributedToEntry' as const,
        fromType: 'note' as const,
        fromId: id,
        toType: 'teamMember' as const,
        toId: teamId.toString(),
      })),
    ];
  }
  if (type === 'service') {
    return ((entity.record as Service).evidenceLinks ?? []).map((reference) => ({
      kind: 'serviceProvenBy' as const,
      fromType: 'service' as const,
      fromId: id,
      toType: evidenceType(reference),
      toId: reference.ownerId.toString(),
    }));
  }
  if (type === 'engineeringProfile') {
    const record = entity.record as EngineeringProfile;
    const entries = [
      ...(record.featuredWorkIds ?? []).map((target) => ['work', target] as const),
      ...(record.featuredBuildIds ?? []).map((target) => ['build', target] as const),
      ...(record.featuredBlueprintIds ?? []).map((target) => ['blueprint', target] as const),
      ...(record.featuredLabIds ?? []).map((target) => ['lab', target] as const),
      ...(record.featuredNoteIds ?? []).map((target) => ['note', target] as const),
    ];
    return entries.map(([toType, target]) => ({
      kind: 'profileFeaturesEvidence' as const,
      fromType: 'engineeringProfile' as const,
      fromId: id,
      toType,
      toId: target.toString(),
    }));
  }
  if (type === 'career') {
    const record = entity.record as Career;
    return [
      ...(record.relatedEntries ?? []).map((reference) => ({
        kind: 'careerRelatesArtifact' as const,
        fromType: 'career' as const,
        fromId: id,
        toType: evidenceType(reference),
        toId: reference.ownerId.toString(),
      })),
      ...(record.hiringManagerTeamId
        ? [
            {
              kind: 'careerHiringManager' as const,
              fromType: 'career' as const,
              fromId: id,
              toType: 'teamMember' as const,
              toId: record.hiringManagerTeamId.toString(),
            },
          ]
        : []),
    ];
  }
  return [];
}
