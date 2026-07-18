import { ObjectId } from 'mongodb';
import { describe, expect, it } from 'vitest';
import type { EngineeringProfile, Note, Team, User, Work, Blueprint } from '@/types/studio';
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
    findDocuments: async () => [],
    findMedia: async () => [],
    findTaxonomy: async () => [],
    findUser: async (id) => input.users?.find((user) => user._id.toString() === id) ?? null,
    findTeamsByUserId: async () => input.teamsByUser ?? [],
    findProfileByTeamId: async () => input.profile ?? null,
  };
}

describe('public repository boundary', () => {
  it('returns allow-listed public objects without Studio identifiers or workflow metadata', async () => {
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
      previewAssetIds: [],
      featured: false,
      version: '1.0.0',
    };
    const repository = createPublicRepository(
      fakeSource({ entities: [entity('blueprint', blueprint)] }),
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

  it('resolves User to Team to visible Profile without exposing the User', async () => {
    const user: User = {
      _id: new ObjectId(),
      name: 'Internal account',
      email: 'private@example.com',
      role: 'admin',
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

  it('resolves Team-only authors and fails closed for hidden Team or missing User links', async () => {
    const user: User = {
      _id: new ObjectId(),
      name: 'Internal',
      email: 'private@example.com',
      role: 'admin',
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
});
