import { ObjectId } from 'mongodb';
import { describe, expect, it } from 'vitest';
import type {
  Blueprint,
  EngineeringProfile,
  MediaAsset,
  Note,
  Team,
  User,
  Work,
} from '@/types/studio';
import type { DocumentRecord } from '@/lib/documents/schema';
import { createPublicRepository } from './repository';
import type { PublicDataSource, StudioPublicEntity } from './source';

const creator = new ObjectId();
const now = new Date('2026-07-18T00:00:00.000Z');

function entity(
  type: StudioPublicEntity['type'],
  record: StudioPublicEntity['record'],
): StudioPublicEntity {
  return { type, id: record._id.toString(), record };
}

function fakeSource(input: {
  entities: StudioPublicEntity[];
  users?: User[];
  teamsByUser?: Team[];
  profile?: EngineeringProfile | null;
  media?: MediaAsset[];
  documents?: DocumentRecord[];
}): PublicDataSource {
  return {
    findEntityBySlug: async (type, slug) =>
      input.entities.find(
        (item) => item.type === type && 'slug' in item.record && item.record.slug === slug,
      ) ?? null,
    findEntityById: async (type, id) =>
      input.entities.find((item) => item.type === type && item.id === id) ?? null,
    listEntities: async (type) => input.entities.filter((item) => item.type === type),
    findInverseEntities: async () => [],
    findDocuments: async (ownerType, ownerId) =>
      input.documents?.filter(
        (document) => document.ownerType === ownerType && document.ownerId.toString() === ownerId,
      ) ?? [],
    findMedia: async (ids) =>
      input.media?.filter((asset) => ids.includes(asset._id.toString())) ?? [],
    findTaxonomy: async () => [],
    findUser: async (id) => input.users?.find((user) => user._id.toString() === id) ?? null,
    findTeamsByUserId: async () => input.teamsByUser ?? [],
    findProfileByTeamId: async () => input.profile ?? null,
  };
}

describe('public repository boundary', () => {
  it('returns allow-listed public objects without Studio identifiers or workflow metadata', async () => {
    const previewAsset: MediaAsset = {
      _id: new ObjectId(),
      createdAt: now,
      updatedAt: now,
      cloudinaryPublicId: 'blueprints/saas-editorial-preview',
      url: 'https://res.cloudinary.com/hubzero/image/upload/blueprints/saas-editorial-preview.png',
      altText: 'SaaS editorial Blueprint preview',
      width: 1600,
      height: 1000,
      folder: 'blueprints',
      reuseTags: [],
    };
    const blueprint: Blueprint = {
      _id: new ObjectId(),
      createdAt: now,
      updatedAt: now,
      createdByUserId: creator,
      status: 'published',
      slug: 'blueprint-saas-editorial',
      referenceId: 'HZ-BP-001',
      name: 'Blueprint-SaaS-Editorial',
      architecture: 'SaaS',
      designLanguage: 'Editorial',
      shortDescription: 'A foundation for product-led software documentation.',
      features: ['Documentation'],
      technologyIds: [],
      liveDeploymentUrl: 'https://example.com/preview',
      previewAssetIds: [previewAsset._id],
      featured: false,
      version: '1.0.0',
      contributorProfileIds: [],
    };
    const repository = createPublicRepository(
      fakeSource({ entities: [entity('blueprint', blueprint)], media: [previewAsset] }),
    );
    const result = await repository.findSummary('blueprint', blueprint.slug);
    const serialized = JSON.stringify(result);
    expect(result?.type).toBe('blueprint');
    expect(serialized).not.toContain('_id');
    expect(serialized).not.toContain('createdByUserId');
    expect(serialized).not.toContain('published');
    expect(serialized).not.toContain(creator.toString());
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result?.technologies)).toBe(true);
    expect(Object.isFrozen(blueprint)).toBe(false);
  });

  it('does not invent missing required summaries', async () => {
    const work = {
      _id: new ObjectId(),
      createdAt: now,
      updatedAt: now,
      createdByUserId: creator,
      status: 'published',
      slug: 'work',
      referenceId: 'HZ-WK-001',
      title: 'Work',
      clientType: 'Private',
      categoryTagIds: [],
      timeline: '2026',
      role: 'Engineering',
      technologyIds: [],
      relatedBuildIds: [],
      relatedBlueprintIds: [],
    } as unknown as Work;
    const repository = createPublicRepository(fakeSource({ entities: [entity('work', work)] }));
    expect(await repository.findSummary('work', 'work')).toBeNull();
  });

  it('keeps published Blueprints without inspectable preview evidence out of public DTOs', async () => {
    const blueprint: Blueprint = {
      _id: new ObjectId(),
      createdAt: now,
      updatedAt: now,
      createdByUserId: creator,
      status: 'published',
      slug: 'blueprint-saas-editorial',
      referenceId: 'HZ-BP-002',
      name: 'Blueprint-SaaS-Editorial',
      architecture: 'SaaS',
      designLanguage: 'Editorial',
      shortDescription: 'A reusable product documentation foundation.',
      features: ['Documentation'],
      technologyIds: [],
      liveDeploymentUrl: 'https://example.com/preview',
      previewAssetIds: [],
      featured: false,
      version: '1.0.0',
      contributorProfileIds: [],
    };
    const repository = createPublicRepository(
      fakeSource({ entities: [entity('blueprint', blueprint)] }),
    );

    expect(await repository.findSummary('blueprint', blueprint.slug)).toBeNull();
    expect(await repository.findDetail('blueprint', blueprint.slug)).toBeNull();
    expect(await repository.listSummaries('blueprint')).toEqual([]);
  });

  it('does not resolve Documents for a non-visible owner', async () => {
    const work = {
      _id: new ObjectId(),
      createdAt: now,
      updatedAt: now,
      createdByUserId: creator,
      status: 'archived',
      slug: 'archived-work',
      referenceId: 'HZ-WK-002',
      title: 'Archived work',
      summary: 'This must remain unavailable.',
      clientType: 'Private',
      categoryTagIds: [],
      timeline: '2026',
      role: 'Engineering',
      technologyIds: [],
      relatedBuildIds: [],
      relatedBlueprintIds: [],
      relatedLabIds: [],
      contributorProfileIds: [],
    } as Work;
    let documentReads = 0;
    const source = fakeSource({ entities: [entity('work', work)] });
    source.findDocuments = async () => {
      documentReads += 1;
      return [];
    };
    const repository = createPublicRepository(source);
    expect(await repository.findDetail('work', work.slug)).toBeNull();
    expect(documentReads).toBe(0);
  });

  it('links a published Profile with a public Team as a Note author destination, even with zero evidence', async () => {
    const user: User = {
      _id: new ObjectId(),
      name: 'Internal account',
      email: 'private@example.com',
      role: 'admin',
      disabled: false,
      mustChangePassword: false,
      createdAt: now,
      updatedAt: now,
    };
    const team: Team = {
      _id: new ObjectId(),
      referenceId: 'HZ-TM-001',
      name: 'Public Engineer',
      role: 'Engineer',
      bio: 'Builds durable systems.',
      group: 'Engineering',
      publicProfile: true,
      userId: user._id,
      founder: false,
      order: 0,
      socialLinks: [],
      archived: false,
      createdAt: now,
      updatedAt: now,
    };
    const profile: EngineeringProfile = {
      _id: new ObjectId(),
      createdAt: now,
      updatedAt: now,
      createdByUserId: creator,
      status: 'published',
      slug: 'public-engineer',
      referenceId: 'EP-001',
      teamMemberId: team._id,
      overview: 'Builds durable systems.',
      engineeringPhilosophy: 'Evidence first.',
      currentExploration: 'Public read models',
      areasOfExpertise: [],
      currentInterests: [],
      engineeringIdentity: ['Systems'],
      technologyIds: [],
      featuredWorkIds: [],
      featuredBuildIds: [],
      featuredBlueprintIds: [],
      featuredLabIds: [],
      featuredNoteIds: [],
      galleryImageIds: [],
    };
    const note: Note = {
      _id: new ObjectId(),
      createdAt: now,
      updatedAt: now,
      createdByUserId: creator,
      status: 'published',
      slug: 'read-models',
      referenceId: 'HZ-NT-001',
      title: 'Read models',
      authorId: user._id,
      summary: 'Why public contracts should differ from editing records.',
      technologyIds: [],
      relatedEntries: [],
      publicationDate: now,
      featured: false,
      galleryImageIds: [],
      contributorProfileIds: [],
    };
    const entities = [
      entity('note', note),
      entity('teamMember', team),
      entity('engineeringProfile', profile),
    ];
    const repository = createPublicRepository(
      fakeSource({ entities, users: [user], teamsByUser: [team], profile }),
    );
    const result = await repository.findSummary('note', note.slug);
    expect(result?.type).toBe('note');
    if (result?.type !== 'note') throw new Error('Expected note summary');
    expect(result.author).toMatchObject({
      kind: 'person',
      name: 'Public Engineer',
      url: '/engineering/public-engineer',
      profileAvailable: true,
    });
    expect(JSON.stringify(result)).not.toContain(user.email);
    expect(JSON.stringify(result)).not.toContain('Internal account');
    expect(JSON.stringify(result)).not.toContain(user._id.toString());
  });

  it('uses the organization fallback for duplicate Team matches', async () => {
    const user: User = {
      _id: new ObjectId(),
      name: 'Internal',
      email: 'private@example.com',
      role: 'admin',
      disabled: false,
      mustChangePassword: false,
      createdAt: now,
      updatedAt: now,
    };
    const team = (name: string): Team => ({
      _id: new ObjectId(),
      referenceId: 'HZ-TM-001',
      name,
      role: 'Engineer',
      bio: 'Bio',
      group: 'Engineering',
      publicProfile: true,
      userId: user._id,
      founder: false,
      order: 0,
      socialLinks: [],
      archived: false,
      createdAt: now,
      updatedAt: now,
    });
    const note: Note = {
      _id: new ObjectId(),
      createdAt: now,
      updatedAt: now,
      createdByUserId: creator,
      status: 'published',
      slug: 'note',
      referenceId: 'HZ-NT-001',
      title: 'Note',
      authorId: user._id,
      summary: 'A substantive public summary.',
      technologyIds: [],
      relatedEntries: [],
      publicationDate: now,
      featured: false,
      galleryImageIds: [],
      contributorProfileIds: [],
    };
    const repository = createPublicRepository(
      fakeSource({
        entities: [entity('note', note)],
        users: [user],
        teamsByUser: [team('One'), team('Two')],
      }),
    );
    const result = await repository.findSummary('note', 'note');
    expect(result?.type === 'note' ? result.author : null).toEqual({
      kind: 'organization',
      name: 'HubZero',
      url: '/about',
    });
  });

  it('orders Note index entries by publication date and derives detail reading time', async () => {
    const note = (title: string, slug: string, publicationDate: Date): Note => ({
      _id: new ObjectId(),
      createdAt: now,
      updatedAt: now,
      createdByUserId: creator,
      status: 'published',
      slug,
      referenceId: `HZ-NT-${slug === 'newer' ? '002' : '001'}`,
      title,
      authorId: new ObjectId(),
      summary: `${title} contains a substantive public summary.`,
      technologyIds: [],
      relatedEntries: [],
      publicationDate,
      featured: false,
      galleryImageIds: [],
      contributorProfileIds: [],
    });
    const older = note('Older note', 'older', new Date('2026-06-01T00:00:00.000Z'));
    const newer = note('Newer note', 'newer', new Date('2026-07-01T00:00:00.000Z'));
    const document: DocumentRecord = {
      _id: new ObjectId(),
      ownerType: 'Note',
      ownerId: newer._id,
      role: 'body',
      blocks: [
        {
          id: 'body',
          type: 'paragraph',
          data: { text: Array.from({ length: 210 }, () => 'evidence').join(' ') },
        },
      ],
      createdAt: now,
      updatedAt: now,
    };
    const repository = createPublicRepository(
      fakeSource({
        entities: [entity('note', older), entity('note', newer)],
        documents: [document],
      }),
    );

    const entries = await repository.listNoteIndexEntries();
    expect(entries.map((entry) => entry.note.slug)).toEqual(['newer', 'older']);
    expect(Object.isFrozen(entries)).toBe(true);
    const detail = await repository.findDetail('note', 'newer');
    expect(detail?.type === 'note' ? detail.readingTimeMinutes : null).toBe(1);
  });

  it('resolves Team-only authors and fails closed for hidden Team or missing User links', async () => {
    const user: User = {
      _id: new ObjectId(),
      name: 'Internal',
      email: 'private@example.com',
      role: 'admin',
      disabled: false,
      mustChangePassword: false,
      createdAt: now,
      updatedAt: now,
    };
    const team: Team = {
      _id: new ObjectId(),
      referenceId: 'HZ-TM-001',
      name: 'Public Engineer',
      role: 'Engineer',
      bio: 'Builds durable systems.',
      group: 'Engineering',
      publicProfile: true,
      userId: user._id,
      founder: false,
      order: 0,
      socialLinks: [],
      archived: false,
      createdAt: now,
      updatedAt: now,
    };
    const note: Note = {
      _id: new ObjectId(),
      createdAt: now,
      updatedAt: now,
      createdByUserId: creator,
      status: 'published',
      slug: 'team-only-author',
      referenceId: 'HZ-NT-002',
      title: 'Team-only author',
      authorId: user._id,
      summary: 'A note with an About-linked public author.',
      technologyIds: [],
      relatedEntries: [],
      publicationDate: now,
      featured: false,
      galleryImageIds: [],
      contributorProfileIds: [],
    };
    const noteEntity = entity('note', note);

    const teamOnly = await createPublicRepository(
      fakeSource({ entities: [noteEntity], users: [user], teamsByUser: [team] }),
    ).findSummary('note', note.slug);
    expect(teamOnly?.type === 'note' ? teamOnly.author : null).toMatchObject({
      kind: 'person',
      name: 'Public Engineer',
      url: '/about',
      profileAvailable: false,
    });

    const hiddenTeam = await createPublicRepository(
      fakeSource({
        entities: [noteEntity],
        users: [user],
        teamsByUser: [{ ...team, publicProfile: false }],
      }),
    ).findSummary('note', note.slug);
    expect(hiddenTeam?.type === 'note' ? hiddenTeam.author.kind : null).toBe('organization');

    const missingUser = await createPublicRepository(
      fakeSource({ entities: [noteEntity], teamsByUser: [team] }),
    ).findSummary('note', note.slug);
    expect(missingUser?.type === 'note' ? missingUser.author.kind : null).toBe('organization');
  });

  it('publishes every Engineering Profile whose status and linked Team are public, regardless of contribution count', async () => {
    const team = (name: string, publicProfile: boolean): Team => ({
      _id: new ObjectId(),
      referenceId: 'HZ-TM-101',
      name,
      role: 'Systems engineer',
      bio: 'Builds explicit public systems.',
      group: 'Engineering',
      publicProfile,
      founder: false,
      order: 0,
      socialLinks: [],
      archived: false,
      createdAt: now,
      updatedAt: now,
    });
    const visibleTeam = team('New engineer', true);
    const hiddenTeam = team('Not yet public engineer', false);
    const profile = (
      teamMemberId: ObjectId,
      slug: string,
      status: EngineeringProfile['status'],
    ): EngineeringProfile => ({
      _id: new ObjectId(),
      createdAt: now,
      updatedAt: now,
      createdByUserId: creator,
      status,
      slug,
      referenceId:
        slug === 'new-engineer' ? 'EP-101' : slug === 'draft-engineer' ? 'EP-102' : 'EP-103',
      teamMemberId,
      overview: 'Builds public systems around explicit ownership and observable state.',
      engineeringPhilosophy: 'Make the evidence boundary explicit before implementation.',
      currentExploration: 'Deterministic public read models',
      areasOfExpertise: ['Public data architecture'],
      currentInterests: ['Dependency graphs'],
      // No evidence at all: no featured work, no document, no external contribution.
      engineeringIdentity: [],
      technologyIds: [],
      featuredWorkIds: [],
      featuredBuildIds: [],
      featuredBlueprintIds: [],
      featuredLabIds: [],
      featuredNoteIds: [],
      galleryImageIds: [],
    });
    // Published, public Team, zero evidence — must still be publicly visible.
    const withoutEvidence = profile(visibleTeam._id, 'new-engineer', 'published');
    // Published, but the linked Team is not (yet) public — must stay hidden.
    const draftEngineer = profile(hiddenTeam._id, 'draft-engineer', 'published');
    // Still in draft — must stay hidden regardless of Team visibility.
    const unpublished = profile(visibleTeam._id, 'unpublished-engineer', 'draft');
    const repository = createPublicRepository(
      fakeSource({
        entities: [
          entity('teamMember', visibleTeam),
          entity('teamMember', hiddenTeam),
          entity('engineeringProfile', withoutEvidence),
          entity('engineeringProfile', draftEngineer),
          entity('engineeringProfile', unpublished),
        ],
      }),
    );

    const entries = await repository.listEngineeringProfileIndexEntries();
    expect(entries).toHaveLength(1);
    expect(entries[0]?.profile.title).toBe('New engineer');
    expect(await repository.findDetail('engineeringProfile', withoutEvidence.slug)).not.toBeNull();
    expect(await repository.findSummary('engineeringProfile', withoutEvidence.slug)).not.toBeNull();
    expect(await repository.findDetail('engineeringProfile', draftEngineer.slug)).toBeNull();
    expect(await repository.findDetail('engineeringProfile', unpublished.slug)).toBeNull();
  });

  it('credits a contributor with a single public credit, and their own profile page resolves too', async () => {
    const contributorTeam: Team = {
      _id: new ObjectId(),
      referenceId: 'HZ-TM-201',
      name: 'Single-credit engineer',
      role: 'Engineer',
      bio: 'Builds explicit public systems.',
      group: 'Engineering',
      publicProfile: true,
      founder: false,
      order: 0,
      socialLinks: [],
      archived: false,
      createdAt: now,
      updatedAt: now,
    };
    const contributor: EngineeringProfile = {
      _id: new ObjectId(),
      createdAt: now,
      updatedAt: now,
      createdByUserId: creator,
      status: 'published',
      slug: 'single-credit-engineer',
      referenceId: 'EP-201',
      teamMemberId: contributorTeam._id,
      overview: 'Builds public systems around explicit ownership and observable state.',
      engineeringPhilosophy: 'Make the evidence boundary explicit before implementation.',
      currentExploration: 'Deterministic public read models',
      areasOfExpertise: ['Public data architecture'],
      currentInterests: ['Dependency graphs'],
      engineeringIdentity: ['State and ownership should remain legible.'],
      technologyIds: [],
      featuredWorkIds: [],
      featuredBuildIds: [],
      featuredBlueprintIds: [],
      featuredLabIds: [],
      featuredNoteIds: [],
      galleryImageIds: [],
    };
    const substantialText = Array.from({ length: 48 }, (_, index) => `evidence-${index}`).join(' ');
    const profileDocument: DocumentRecord = {
      _id: new ObjectId(),
      ownerType: 'EngineeringProfile',
      ownerId: contributor._id,
      role: 'introduction',
      blocks: [
        { id: 'one', type: 'paragraph', data: { text: substantialText } },
        { id: 'two', type: 'paragraph', data: { text: substantialText } },
      ],
      createdAt: now,
      updatedAt: now,
    };
    const work: Work = {
      _id: new ObjectId(),
      createdAt: now,
      updatedAt: now,
      createdByUserId: creator,
      status: 'published',
      slug: 'only-public-credit',
      referenceId: 'HZ-WK-201',
      title: 'Only public credit',
      summary: 'A published case study with one credited contributor.',
      clientType: 'Product team',
      categoryTagIds: [],
      timeline: '12 weeks',
      role: 'Product engineering',
      technologyIds: [],
      relatedBuildIds: [],
      relatedBlueprintIds: [],
      relatedLabIds: [],
      contributorProfileIds: [contributor._id],
    };
    const caseStudyDocument: DocumentRecord = {
      _id: new ObjectId(),
      ownerType: 'Work',
      ownerId: work._id,
      role: 'caseStudy',
      blocks: [{ id: 'one', type: 'paragraph', data: { text: substantialText } }],
      createdAt: now,
      updatedAt: now,
    };
    const repository = createPublicRepository(
      fakeSource({
        entities: [
          entity('teamMember', contributorTeam),
          entity('work', work),
          entity('engineeringProfile', contributor),
        ],
        documents: [profileDocument, caseStudyDocument],
      }),
    );

    // The contributor's own profile page resolves — publication no longer
    // depends on how many other things they've contributed to.
    expect(await repository.findDetail('engineeringProfile', contributor.slug)).not.toBeNull();

    // The Work page they're credited on shows them as a contributor too.
    const workDetail = await repository.findDetail('work', work.slug);
    const contributorRelationships = workDetail?.relationships.filter(
      (relationship) => relationship.target.type === 'engineeringProfile',
    );
    expect(contributorRelationships).toHaveLength(1);
    expect(contributorRelationships?.[0]?.target.title).toBe('Single-credit engineer');
  });
});
