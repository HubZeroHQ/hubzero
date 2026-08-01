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

function build(featuredOrder: number | null = 1): Build {
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
    featuredOrder,
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
    const projection = await createPublicRepository(source(build(null))).getHomepage(now);
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

/**
 * A multi-record source, so ordering can be asserted rather than inferred from
 * a single-item list.
 */
function multiSource(records: Build[]): PublicDataSource {
  const wrapped: StudioPublicEntity[] = records.map((record) => ({
    type: 'build',
    id: record._id.toString(),
    record,
  }));
  const mediaFor = (record: Build): MediaAsset => ({
    _id: record.heroImageId!,
    createdAt: now,
    updatedAt: now,
    cloudinaryPublicId: `build/hero-${record.slug}`,
    url: `https://res.cloudinary.com/demo/image/upload/${record.slug}.png`,
    altText: 'The product interface showing its primary workflow.',
    width: 1600,
    height: 1000,
    folder: 'builds',
    reuseTags: [],
  });
  const allMedia = records.map(mediaFor);

  return {
    findEntityBySlug: async (type, slug) =>
      (type === 'build' && wrapped.find((entry) => (entry.record as Build).slug === slug)) || null,
    findEntityById: async (type, id) =>
      (type === 'build' && wrapped.find((entry) => entry.id === id)) || null,
    listEntities: async (type) => (type === 'build' ? wrapped : []),
    findDocuments: async (_ownerType, ownerId) => {
      const record = records.find((entry) => entry._id.toString() === ownerId);
      return record ? [document(record._id, 'caseStudy'), document(record._id, 'technical')] : [];
    },
    findMedia: async (ids) => allMedia.filter((asset) => ids.includes(asset._id.toString())),
    findTaxonomy: async () => [],
    findUser: async () => null,
    findTeamsByUserId: async () => [],
    findProfileByTeamId: async () => null,
  };
}

describe('homepage editorial ordering', () => {
  it('surfaces featured entries in the editorial order, not reference-ID order', async () => {
    // Reference IDs deliberately run opposite to the editorial order: the
    // previous implementation sorted by `referenceId` descending, so if that
    // were still in play the assertion below would come back reversed.
    const first: Build = {
      ...build(2),
      _id: new ObjectId(),
      slug: 'second-choice',
      referenceId: 'HZ-BL-999',
      title: 'Second choice',
      heroImageId: new ObjectId(),
    };
    const second: Build = {
      ...build(1),
      _id: new ObjectId(),
      slug: 'first-choice',
      referenceId: 'HZ-BL-001',
      title: 'First choice',
      heroImageId: new ObjectId(),
    };

    const projection = await createPublicRepository(multiSource([first, second])).getHomepage(now);

    expect(projection.builds.map((feature) => feature.entity.title)).toEqual([
      'First choice',
      'Second choice',
    ]);
  });

  it('omits entries the editor has not featured', async () => {
    const featured: Build = {
      ...build(1),
      _id: new ObjectId(),
      slug: 'chosen',
      referenceId: 'HZ-BL-010',
      title: 'Chosen',
      heroImageId: new ObjectId(),
    };
    const unfeatured: Build = {
      ...build(null),
      _id: new ObjectId(),
      slug: 'not-chosen',
      referenceId: 'HZ-BL-011',
      title: 'Not chosen',
      heroImageId: new ObjectId(),
    };

    const projection = await createPublicRepository(
      multiSource([featured, unfeatured]),
    ).getHomepage(now);

    expect(projection.builds.map((feature) => feature.entity.title)).toEqual(['Chosen']);
  });

  it('reads a non-canonical stored order without reordering it wrongly', async () => {
    const a: Build = {
      ...build(9),
      _id: new ObjectId(),
      slug: 'a',
      referenceId: 'HZ-BL-021',
      title: 'Nine',
      heroImageId: new ObjectId(),
    };
    const b: Build = {
      ...build(3),
      _id: new ObjectId(),
      slug: 'b',
      referenceId: 'HZ-BL-022',
      title: 'Three',
      heroImageId: new ObjectId(),
    };

    const projection = await createPublicRepository(multiSource([a, b])).getHomepage(now);

    expect(projection.builds.map((feature) => feature.entity.title)).toEqual(['Three', 'Nine']);
  });
});
