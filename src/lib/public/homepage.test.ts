import { ObjectId } from 'mongodb';
import { describe, expect, it } from 'vitest';
import type { DocumentRecord } from '@/lib/documents/schema';
import type { Build, MediaAsset } from '@/types/studio';
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

function build(featured = true): Build & { productSummary: string } {
  return {
    _id: new ObjectId(),
    createdAt: now,
    updatedAt: now,
    createdByUserId: creator,
    status: 'published',
    slug: 'public-build',
    referenceId: 'HZ-BL-101',
    title: 'Public build',
    productSummary: 'A product with a complete, evidence-backed public record.',
    deploymentState: 'live',
    liveUrl: 'https://example.com/product',
    technologyIds: [],
    relatedWorkIds: [],
    heroImageId: new ObjectId(),
    galleryImageIds: [],
    featured,
    contributorProfileIds: [],
  };
}

function source(record: ReturnType<typeof build>, thin = false): PublicDataSource {
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
    findEntityById: async (type, id) => (type === 'build' && id === wrapped.id ? wrapped : null),
    listEntities: async (type) => (type === 'build' ? [wrapped] : []),
    findInverseEntities: async () => [],
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
});
