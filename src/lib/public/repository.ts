import type { OwnerType } from '@/lib/documents/schema';
import type {
  Blueprint,
  Build,
  EngineeringProfile,
  EntryReference,
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
  PublicDetailEntityType,
  PublicDiscoveryEntry,
  PublicEngineeringProfileSummary,
  PublicEntityDetail,
  PublicEntityLink,
  PublicEntitySummary,
  PublicEntityType,
  PublicExternalLink,
  PublicHomepageFeature,
  PublicHomepageProjection,
  PublicLabSummary,
  PublicNoteSummary,
  PublicRelationship,
  PublicServiceSummary,
  PublicTaxonomyKind,
  PublicTaxonomyTerm,
  PublicTeamMemberSummary,
  PublicWorkSummary,
} from './domain';
import { isSafePublicUrl, toPublicMedia } from './media';
import { type RelationshipAssertion, resolvePublicRelationships } from './relationships';
import type { PublicDataSource, StudioPublicEntity } from './source';
import { isPubliclyVisible } from './visibility';

const ORGANIZATION_AUTHOR: OrganizationAuthor = {
  kind: 'organization',
  name: 'HubZero',
  url: '/about',
};

const TYPE_TO_OWNER: Record<PublicDetailEntityType, OwnerType> = {
  work: 'Work',
  build: 'Build',
  blueprint: 'Blueprint',
  lab: 'Lab',
  note: 'Note',
  engineeringProfile: 'EngineeringProfile',
};

export interface PublicRepository {
  findSummary(
    type: PublicEntityType,
    slug: string,
  ): Promise<ImmutablePublic<PublicEntitySummary> | null>;
  findDetail(
    type: PublicDetailEntityType,
    slug: string,
  ): Promise<ImmutablePublic<PublicEntityDetail> | null>;
  listSummaries(type: PublicEntityType): Promise<ImmutablePublic<PublicEntitySummary[]>>;
  listDiscoveryEntries(
    types?: readonly PublicEntityType[],
  ): Promise<ImmutablePublic<PublicDiscoveryEntry[]>>;
  getHomepage(now: Date): Promise<ImmutablePublic<PublicHomepageProjection>>;
}

export function createPublicRepository(source: PublicDataSource): PublicRepository {
  async function visible(entity: StudioPublicEntity): Promise<boolean> {
    if (entity.type === 'teamMember') {
      return isPubliclyVisible({
        type: 'teamMember',
        publicProfile: (entity.record as Team).publicProfile,
      });
    }
    if (entity.type === 'engineeringProfile') {
      const profile = entity.record as EngineeringProfile;
      const team = await source.findEntityById('teamMember', profile.teamMemberId.toString());
      return isPubliclyVisible({
        type: 'engineeringProfile',
        status: profile.status,
        teamPublic: team ? (team.record as Team).publicProfile : false,
      });
    }
    return isPubliclyVisible({
      type: entity.type,
      status: (entity.record as { status?: unknown }).status,
    });
  }

  async function terms(
    ids: readonly { toString(): string }[],
    kind: PublicTaxonomyKind,
  ): Promise<PublicTaxonomyTerm[]> {
    const records = await source.findTaxonomy(ids.map((id) => id.toString()));
    const byId = new Map(records.map((term) => [term._id.toString(), term]));
    return ids.flatMap((id) => {
      const term = byId.get(id.toString());
      return term?.kind === kind ? [{ kind, label: term.label, slug: term.slug }] : [];
    });
  }

  async function media(
    id: { toString(): string } | undefined,
    role: Parameters<typeof toPublicMedia>[1],
  ) {
    if (!id) return undefined;
    const [record] = await source.findMedia([id.toString()]);
    return toPublicMedia(record, role);
  }

  async function gallery(ids: readonly { toString(): string }[]) {
    const records = await source.findMedia(ids.map((id) => id.toString()));
    const byId = new Map(records.map((item) => [item._id.toString(), item]));
    return ids.flatMap((id) => {
      const resolved = toPublicMedia(byId.get(id.toString()), 'gallery');
      return resolved ? [resolved] : [];
    });
  }

  async function resolveAuthor(userId: string): Promise<PublicAuthor> {
    const user = await source.findUser(userId);
    if (!user) return ORGANIZATION_AUTHOR;
    const matches = await source.findTeamsByUserId(userId);
    if (matches.length !== 1 || !matches[0]?.publicProfile) return ORGANIZATION_AUTHOR;
    const team = matches[0];
    const profile = await source.findProfileByTeamId(team._id.toString());
    const profileAvailable = Boolean(
      profile &&
      isPubliclyVisible({
        type: 'engineeringProfile',
        status: profile.status,
        teamPublic: team.publicProfile,
      }),
    );
    const portrait = await media(team.portraitId, 'portrait');
    return {
      kind: 'person',
      name: team.name,
      ...(team.role ? { role: team.role } : {}),
      ...(portrait ? { portrait } : {}),
      url: profileAvailable && profile ? `/engineering/${profile.slug}` : '/about',
      profileAvailable,
    };
  }

  async function mapSummary(entity: StudioPublicEntity): Promise<PublicEntitySummary | null> {
    if (!(await visible(entity))) return null;

    switch (entity.type) {
      case 'work': {
        const record = entity.record as Work;
        if (typeof record.summary !== 'string' || !record.summary.trim()) return null;
        const [technologies, categories, hero] = await Promise.all([
          terms(record.technologyIds, 'technology'),
          terms(record.categoryTagIds, 'category'),
          media(record.heroImageId, 'hero'),
        ]);
        const summary: PublicWorkSummary = {
          type: 'work',
          title: record.title,
          slug: record.slug,
          url: `/work/${record.slug}`,
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
        const record = entity.record as Build & { summary?: unknown; productSummary?: unknown };
        const summarySource =
          typeof record.productSummary === 'string'
            ? record.productSummary
            : typeof record.summary === 'string'
              ? record.summary
              : '';
        if (!summarySource.trim()) return null;
        const [technologies, hero] = await Promise.all([
          terms(record.technologyIds, 'technology'),
          media(record.heroImageId, 'hero'),
        ]);
        const links = [
          externalLink('live', 'Open product', record.liveUrl, record.deploymentState),
          externalLink('repository', 'View repository', record.repoUrl),
        ].filter((link): link is PublicExternalLink => Boolean(link));
        const summary: PublicBuildSummary = {
          type: 'build',
          title: record.title,
          slug: record.slug,
          url: `/builds/${record.slug}`,
          referenceId: record.referenceId,
          summary: summarySource,
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
          terms(record.technologyIds, 'technology'),
          media(record.heroImageId, 'hero'),
          gallery(record.previewAssetIds),
        ]);
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
          url: `/blueprints/${record.slug}`,
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
          terms(record.technologyIds, 'technology'),
          media(record.heroImageId, 'hero'),
        ]);
        const links = [
          externalLink('repository', 'View repository', record.publicRepoUrl),
          externalLink('demo', 'Open demo', record.liveDemoUrl),
        ].filter((link): link is PublicExternalLink => Boolean(link));
        const summary: PublicLabSummary = {
          type: 'lab',
          title: record.title,
          slug: record.slug,
          url: `/labs/${record.slug}`,
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
          terms(record.technologyIds, 'technology'),
          media(record.heroImageId, 'hero'),
          resolveAuthor(record.authorId.toString()),
        ]);
        const summary: PublicNoteSummary = {
          type: 'note',
          title: record.title,
          slug: record.slug,
          url: `/notes/${record.slug}`,
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
        const teamEntity = await source.findEntityById(
          'teamMember',
          record.teamMemberId.toString(),
        );
        if (!teamEntity || !(await visible(teamEntity))) return null;
        const team = teamEntity.record as Team;
        const [technologies, portrait, hero] = await Promise.all([
          terms(record.technologyIds, 'technology'),
          media(record.portraitId ?? team.portraitId, 'portrait'),
          media(record.heroMediaId, 'hero'),
        ]);
        const summary: PublicEngineeringProfileSummary = {
          type: 'engineeringProfile',
          title: team.name,
          slug: record.slug,
          url: `/engineering/${record.slug}`,
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
        const profile = await source.findProfileByTeamId(entity.id);
        const profileVisible = Boolean(
          profile &&
          isPubliclyVisible({
            type: 'engineeringProfile',
            status: profile.status,
            teamPublic: record.publicProfile,
          }),
        );
        const portrait = await media(record.portraitId, 'portrait');
        const summary: PublicTeamMemberSummary = {
          type: 'teamMember',
          title: record.name,
          url: '/about',
          summary: record.bio,
          role: record.role,
          group: record.group,
          technologies: [],
          ...(portrait ? { portrait, hero: portrait } : {}),
          ...(profileVisible && profile
            ? {
                profile: {
                  type: 'engineeringProfile',
                  title: record.name,
                  url: `/engineering/${profile.slug}`,
                  referenceId: profile.referenceId,
                  summary: profile.overview,
                  state: profile.currentExploration,
                },
              }
            : {}),
        };
        return summary;
      }
      case 'service': {
        const record = entity.record as Service;
        const evidence = await resolveRelations(entity);
        const summary: PublicServiceSummary = {
          type: 'service',
          title: record.title,
          url: '/services',
          summary: record.description,
          technologies: [],
          evidence,
        };
        return summary;
      }
    }
  }

  async function resolveRelations(entity: StudioPublicEntity): Promise<PublicRelationship[]> {
    const inverses = await source.findInverseEntities(entity.type, entity.id);
    const lineagePeers =
      entity.type === 'build' && (entity.record as Build).originatingLabId
        ? await source.findInverseEntities(
            'lab',
            (entity.record as Build).originatingLabId!.toString(),
          )
        : [];
    const assertions = [
      ...assertionsFrom(entity),
      ...inverses.flatMap(assertionsFrom),
      ...lineagePeers.flatMap(assertionsFrom),
    ];
    return resolvePublicRelationships(
      { type: entity.type, id: entity.id },
      assertions,
      async (type, id): Promise<PublicEntityLink | null> => {
        const target = await source.findEntityById(type, id);
        if (!target) return null;
        const summary = await mapSummary(target);
        return summary ? toEntityLink(summary) : null;
      },
    );
  }

  async function findSummary(type: PublicEntityType, slug: string) {
    const entity = await source.findEntityBySlug(type, slug);
    return entity ? mapSummary(entity) : null;
  }

  async function listSummaries(type: PublicEntityType): Promise<PublicEntitySummary[]> {
    const entities = await source.listEntities(type);
    const summaries = await Promise.all(entities.map(mapSummary));
    return summaries.filter((summary): summary is PublicEntitySummary => summary !== null);
  }

  async function findDetail(
    type: PublicDetailEntityType,
    slug: string,
  ): Promise<PublicEntityDetail | null> {
    const entity = await source.findEntityBySlug(type, slug);
    if (!entity) return null;
    const summary = await mapSummary(entity);
    if (!summary || summary.type !== type) return null;
    const documents = await publicDocuments(type, entity.id);
    const relationships = await resolveRelations(entity);

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
        };
      }
      case 'build': {
        if (summary.type !== 'build' || !hasRoles(documents, ['caseStudy', 'technical']))
          return null;
        return {
          ...summary,
          documents,
          relationships,
          gallery: await gallery((entity.record as Build).galleryImageIds),
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
          gallery: await gallery(record.galleryImageIds),
          milestones: record.milestones.map((milestone) => ({
            title: milestone.title,
            date: milestone.date.toISOString(),
            summary: milestone.summary,
          })),
        };
      }
      case 'note': {
        if (summary.type !== 'note' || !hasRoles(documents, ['body'])) return null;
        return {
          ...summary,
          documents,
          relationships,
          gallery: await gallery((entity.record as Note).galleryImageIds),
        };
      }
      case 'engineeringProfile': {
        if (summary.type !== 'engineeringProfile' || !documents.length) return null;
        const record = entity.record as EngineeringProfile;
        return {
          ...summary,
          documents,
          relationships,
          engineeringPhilosophy: record.engineeringPhilosophy,
          currentInterests: [...record.currentInterests],
          areasOfExpertise: [...record.areasOfExpertise],
          gallery: await gallery(record.galleryImageIds),
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
  ): Promise<PublicHomepageFeature<T> | null> {
    if (!('slug' in entity.record)) return null;
    const detail = await findDetail(expectedType as PublicDetailEntityType, entity.record.slug);
    if (!detail || detail.type !== expectedType || !isHomepageEligible(detail, now)) return null;
    return {
      entity: detail as unknown as T,
      relationships: detail.relationships.slice(0, 2),
    };
  }

  async function getHomepage(now: Date): Promise<PublicHomepageProjection> {
    const [workEntities, buildEntities, blueprintEntities, labEntities, noteEntities, profiles] =
      await Promise.all([
        source.listEntities('work'),
        source.listEntities('build'),
        source.listEntities('blueprint'),
        source.listEntities('lab'),
        source.listEntities('note'),
        source.listEntities('engineeringProfile'),
      ]);

    const work = compact(
      await Promise.all(
        sortEntities(workEntities).map((entity) =>
          homepageFeature<PublicWorkSummary>(entity, 'work', now),
        ),
      ),
    ).slice(0, 1);
    const builds = compact(
      await Promise.all(
        sortEntities(buildEntities.filter(hasFeaturedFlag)).map((entity) =>
          homepageFeature<PublicBuildSummary>(entity, 'build', now),
        ),
      ),
    ).slice(0, 2);
    const blueprints = compact(
      await Promise.all(
        sortEntities(blueprintEntities.filter(hasFeaturedFlag)).map((entity) =>
          homepageFeature<PublicBlueprintSummary>(entity, 'blueprint', now),
        ),
      ),
    );
    const labs = compact(
      await Promise.all(
        sortEntities(labEntities.filter(hasFeaturedFlag)).map((entity) =>
          homepageFeature<PublicLabSummary>(entity, 'lab', now),
        ),
      ),
    ).slice(0, 2);
    const allSubstantiveNotes = compact(
      await Promise.all(
        sortEntities(noteEntities).map((entity) =>
          homepageFeature<PublicNoteSummary>(entity, 'note', now),
        ),
      ),
    );
    const featuredNoteIds = new Set(
      noteEntities.filter(hasFeaturedFlag).map((entity) => entity.id),
    );
    const notes =
      allSubstantiveNotes.length >= 5
        ? allSubstantiveNotes
            .filter((feature) => {
              const sourceEntity = noteEntities.find(
                (entity) => 'slug' in entity.record && entity.record.slug === feature.entity.slug,
              );
              return sourceEntity ? featuredNoteIds.has(sourceEntity.id) : false;
            })
            .slice(0, 3)
        : [];
    const engineeringProfiles = compact(
      await Promise.all(
        sortEntities(profiles).map((entity) =>
          homepageFeature<PublicEngineeringProfileSummary>(entity, 'engineeringProfile', now),
        ),
      ),
    ).slice(0, 2);

    return {
      work,
      builds,
      labs,
      notes,
      ...(blueprints[0] ? { blueprint: blueprints[0] } : {}),
      profiles: engineeringProfiles,
    };
  }

  return {
    async findSummary(type, slug) {
      return freezePublicDto(await findSummary(type, slug));
    },
    async findDetail(type, slug) {
      return freezePublicDto(await findDetail(type, slug));
    },
    async listSummaries(type) {
      return freezePublicDto(await listSummaries(type));
    },
    async listDiscoveryEntries(types = ALL_PUBLIC_TYPES) {
      const summaries = (await Promise.all(types.map(listSummaries))).flat();
      return freezePublicDto(summaries.map(toDiscoveryEntry));
    },
    async getHomepage(now) {
      return freezePublicDto(await getHomepage(now));
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
  };
}

function toDiscoveryEntry(summary: PublicEntitySummary): PublicDiscoveryEntry {
  return {
    type: summary.type,
    title: summary.title,
    url: summary.url,
    summary: summary.summary,
    ...(summary.referenceId ? { referenceId: summary.referenceId } : {}),
    taxonomy: summary.technologies.map((term) => term.label),
    ...(summary.state ? { state: summary.state } : {}),
    ...(summary.type === 'note' ? { author: summary.author } : {}),
    ...(summary.hero ? { media: summary.hero } : {}),
  };
}

function hasRoles(documents: readonly { role: string }[], roles: readonly string[]): boolean {
  return roles.every((role) => documents.some((document) => document.role === role));
}

function compact<T>(values: readonly (T | null)[]): T[] {
  return values.filter((value): value is T => value !== null);
}

function hasFeaturedFlag(entity: StudioPublicEntity): boolean {
  return 'featured' in entity.record && entity.record.featured === true;
}

function sortEntities(entities: readonly StudioPublicEntity[]): StudioPublicEntity[] {
  return [...entities].sort((left, right) => {
    const leftReference = 'referenceId' in left.record ? left.record.referenceId : left.id;
    const rightReference = 'referenceId' in right.record ? right.record.referenceId : right.id;
    return rightReference.localeCompare(leftReference);
  });
}

function hasSubstantiveDocument(
  documents: readonly { blocks: readonly { type: string; data: unknown }[] }[],
): boolean {
  return documents.some((document) => {
    const textBlocks = document.blocks.filter(
      (block) =>
        !['heading', 'divider', 'image', 'imageGallery', 'technologyStack'].includes(block.type),
    );
    const words = textBlocks
      .map((block) => JSON.stringify(block.data).replace(/<[^>]*>/g, ' '))
      .join(' ')
      .match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu);
    return textBlocks.length >= 2 && (words?.length ?? 0) >= 80;
  });
}

function isRecent(date: string | undefined, now: Date, maxAgeDays = 180): boolean {
  if (!date) return false;
  const value = new Date(date);
  if (Number.isNaN(value.getTime()) || value > now) return false;
  return now.getTime() - value.getTime() <= maxAgeDays * 24 * 60 * 60 * 1000;
}

function isHomepageEligible(detail: PublicEntityDetail, now: Date): boolean {
  switch (detail.type) {
    case 'work':
      return hasSubstantiveDocument(detail.documents);
    case 'build':
      return (
        Boolean(detail.hero) &&
        detail.links.some((link) => link.kind === 'live') &&
        detail.documents.filter((document) => ['caseStudy', 'technical'].includes(document.role))
          .length >= 2 &&
        detail.documents
          .filter((document) => ['caseStudy', 'technical'].includes(document.role))
          .every((document) => hasSubstantiveDocument([document]))
      );
    case 'blueprint':
      return (
        detail.previewMedia.length > 0 &&
        detail.features.length > 0 &&
        hasSubstantiveDocument(detail.documents)
      );
    case 'lab':
      return (
        isRecent(detail.lastMajorUpdate, now) &&
        detail.milestones.length > 0 &&
        detail.technologies.length > 0 &&
        hasSubstantiveDocument(detail.documents)
      );
    case 'note':
      return isRecent(detail.publicationDate, now) && hasSubstantiveDocument(detail.documents);
    case 'engineeringProfile':
      return (
        Boolean(detail.portrait) &&
        detail.relationships.length >= 2 &&
        hasSubstantiveDocument(detail.documents)
      );
  }
}

function evidenceType(reference: EntryReference): PublicEntityType {
  return {
    Work: 'work',
    Build: 'build',
    Blueprint: 'blueprint',
    Lab: 'lab',
  }[reference.ownerType] as PublicEntityType;
}

function assertionsFrom(entity: StudioPublicEntity): RelationshipAssertion[] {
  const { type, id } = entity;
  if (type === 'work') {
    const record = entity.record as Work;
    return [
      ...record.relatedBuildIds.map((buildId) => ({
        kind: 'buildAppliedInWork' as const,
        fromType: 'build' as const,
        fromId: buildId.toString(),
        toType: 'work' as const,
        toId: id,
      })),
      ...record.relatedBlueprintIds.map((blueprintId) => ({
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
      ...(record.contributorProfileIds ?? []).map((profileId) => ({
        kind: 'profileContributedToWork' as const,
        fromType: 'work' as const,
        fromId: id,
        toType: 'engineeringProfile' as const,
        toId: profileId.toString(),
      })),
    ];
  }
  if (type === 'build') {
    const record = entity.record as Build;
    return [
      ...record.relatedWorkIds.map((workId) => ({
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
      ...record.relatedBuildIds.map((buildId) => ({
        kind: 'labRelatedBuild' as const,
        fromType: 'lab' as const,
        fromId: id,
        toType: 'build' as const,
        toId: buildId.toString(),
      })),
      ...record.relatedBlueprintIds.map((blueprintId) => ({
        kind: 'labRelatedBlueprint' as const,
        fromType: 'lab' as const,
        fromId: id,
        toType: 'blueprint' as const,
        toId: blueprintId.toString(),
      })),
    ];
  }
  if (type === 'note') {
    return (entity.record as Note).relatedEntries.map((reference) => ({
      kind: 'noteDiscussesArtifact' as const,
      fromType: 'note' as const,
      fromId: id,
      toType: evidenceType(reference),
      toId: reference.ownerId.toString(),
    }));
  }
  if (type === 'service') {
    return (entity.record as Service).evidenceLinks.map((reference) => ({
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
      ...record.featuredWorkIds.map((target) => ['work', target] as const),
      ...record.featuredBuildIds.map((target) => ['build', target] as const),
      ...record.featuredBlueprintIds.map((target) => ['blueprint', target] as const),
      ...record.featuredLabIds.map((target) => ['lab', target] as const),
      ...record.featuredNoteIds.map((target) => ['note', target] as const),
    ];
    return entries.map(([toType, target]) => ({
      kind: 'profileFeaturesEvidence' as const,
      fromType: 'engineeringProfile' as const,
      fromId: id,
      toType,
      toId: target.toString(),
    }));
  }
  return [];
}
