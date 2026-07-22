import { ObjectId } from 'mongodb';
import { describe, expect, it } from 'vitest';
import type { DocumentRecord } from '@/lib/documents/schema';
import type { Build, MediaAsset, Team } from '@/types/studio';
import { createPublicRepository } from './repository';
import type { PublicDataSource, StudioPublicEntity } from './source';

const now = new Date('2026-07-18T00:00:00.000Z');
const creator = new ObjectId();

function paragraph(id: string, prefix: string) {
  return {
    id,
    type: 'paragraph' as const,
    data: {
      text: `${prefix} ${Array.from({ length: 46 }, (_, index) => `evidence-${index}`).join(' ')}`,
    },
  };
}

function document(ownerId: ObjectId, role: 'caseStudy' | 'technical'): DocumentRecord {
  return {
    _id: new ObjectId(),
    ownerType: 'Build',
    ownerId,
    role,
    blocks: [paragraph(`${role}-one`, role), paragraph(`${role}-two`, role)],
    createdAt: now,
    updatedAt: now,
  };
}

function build(featured = true): Build {
  return {
    _id: new ObjectId(),
    createdAt: now,
    updatedAt: now,
    createdByUserId: creator,
    status: 'published',
    slug: 'public-build',
    referenceId: 'HZ-BL-101',
    title: 'Public build',
    summary: 'A product with a complete, evidence-backed public record.',
    deploymentState: 'live',
    liveUrl: 'https://example.com/product',
    technologyIds: [],
    relatedWorkIds: [],
    heroImageId: new ObjectId(),
    galleryImageIds: [],
    featured,
    contributors: [],
  };
}

function source(
  record: ReturnType<typeof build>,
  thin = false,
  contributors: Team[] = [],
): PublicDataSource {
  const wrapped: StudioPublicEntity = {
    type: 'build',
    id: record._id.toString(),
    record,
  };
  const media: MediaAsset = {
    _id: record.heroImageId!,
    createdAt: now,
    updatedAt: now,
    cloudinaryPublicId: 'build/hero',
    url: 'https://res.cloudinary.com/demo/image/upload/build-hero.png',
    altText: 'The product interface showing its primary workflow.',
    width: 1600,
    height: 1000,
    folder: 'builds',
    reuseTags: [],
  };
  return {
    findEntityBySlug: async (type, slug) =>
      type === 'build' && slug === record.slug ? wrapped : null,
    findEntityById: async (type, id) => {
      if (type === 'build' && id === wrapped.id) return wrapped;
      const contributor = contributors.find(
        (entry) => type === 'teamMember' && entry._id.toString() === id,
      );
      return contributor ? { type: 'teamMember', id, record: contributor } : null;
    },
    listEntities: async (type) => {
      if (type === 'build') return [wrapped];
      if (type === 'teamMember') {
        return contributors.map((record) => ({
          type: 'teamMember' as const,
          id: record._id.toString(),
          record,
        }));
      }
      return [];
    },
    findDocuments: async () =>
      thin
        ? [{ ...document(record._id, 'caseStudy'), blocks: [paragraph('only', 'short')] }]
        : [document(record._id, 'caseStudy'), document(record._id, 'technical')],
    findMedia: async (ids) => (ids.includes(media._id.toString()) ? [media] : []),
    findTaxonomy: async () => [],
    findUser: async () => null,
    findTeamsByUserId: async () => [],
    findProfileByTeamId: async () => null,
  };
}

function contributor(name: string, referenceId: `HZ-TM-${string}`): Team {
  return {
    _id: new ObjectId(),
    createdAt: now,
    updatedAt: now,
    referenceId,
    name,
    role: 'Engineer',
    bio: `${name} contributes to the product record.`,
    group: 'Engineering Team',
    publicProfile: true,
    founder: false,
    publicCategory: 'team',
    engineeringProfileEligible: true,
    order: 0,
    socialLinks: [],
    archived: false,
  };
}

describe('homepage public projection', () => {
  it('returns a bounded, frozen feature without exposing Studio curation state', async () => {
    const record = build();
    const projection = await createPublicRepository(source(record)).getHomepage(now);

    expect(projection.builds).toHaveLength(1);
    expect(projection.builds[0]?.entity.title).toBe('Public build');
    expect(JSON.stringify(projection)).not.toContain('featured');
    expect(JSON.stringify(projection)).not.toContain(creator.toString());
    expect(Object.isFrozen(projection)).toBe(true);
  });

  it('omits featured records whose public evidence is incomplete', async () => {
    const projection = await createPublicRepository(source(build(), true)).getHomepage(now);
    expect(projection.builds).toEqual([]);
  });

  it('does not treat publication alone as homepage curation', async () => {
    const projection = await createPublicRepository(source(build(false))).getHomepage(now);
    expect(projection.builds).toEqual([]);
  });

  it('keeps a featured retired Build eligible without a live deployment URL', async () => {
    const retiredBuild = {
      ...build(),
      deploymentState: 'retired' as const,
      liveUrl: undefined,
    };
    const projection = await createPublicRepository(source(retiredBuild)).getHomepage(now);

    expect(projection.builds).toHaveLength(1);
    expect(projection.builds[0]?.entity.deploymentState).toBe('retired');
    expect(projection.builds[0]?.entity.links.some((link) => link.kind === 'live')).toBe(false);
  });

  it('preserves the complete contributor relationship graph across homepage and detail projections', async () => {
    const contributors = [
      contributor('Rifaque Ahmed', 'HZ-TM-001'),
      contributor('Raif Karani', 'HZ-TM-002'),
      contributor('Sultan', 'HZ-TM-003'),
    ];
    const record = { ...build(), contributors: contributors.map((entry) => entry._id) };
    const repository = createPublicRepository(source(record, false, contributors));

    const [homepage, detail] = await Promise.all([
      repository.getHomepage(now),
      repository.findDetail('build', record.slug),
    ]);
    const homepageRelationships = homepage.builds[0]?.relationships ?? [];
    const detailRelationships = detail?.type === 'build' ? detail.relationships : [];

    expect(homepageRelationships).toEqual(detailRelationships);
    expect(
      homepageRelationships
        .filter((relationship) => relationship.kind === 'teamContributedToEntry')
        .map((relationship) => relationship.target.title),
    ).toEqual(['Rifaque Ahmed', 'Raif Karani', 'Sultan']);
  });
});
