import { ObjectId } from 'mongodb';
import { describe, expect, it } from 'vitest';
import type { Build, MediaAsset } from '@/types/studio';
import {
  evaluateBuildPublicationChecklist,
  isBuildDetailEligible,
  isBuildHomepageEligible,
  isEngineeringProfileHomepageEligible,
  type EligibilityDocument,
} from './eligibility';
import { createPublicRepository } from './repository';
import type { PublicDataSource, StudioPublicEntity } from './source';
import type { DocumentRecord } from '@/lib/documents/schema';

const now = new Date('2026-07-22T00:00:00.000Z');
const creator = new ObjectId();

function substantiveBlocks(
  prefix: string,
): { id: string; type: 'paragraph'; data: { text: string } }[] {
  return [
    {
      id: `${prefix}-1`,
      type: 'paragraph',
      data: { text: Array.from({ length: 45 }, (_, i) => `${prefix}-${i}`).join(' ') },
    },
    {
      id: `${prefix}-2`,
      type: 'paragraph',
      data: { text: Array.from({ length: 45 }, (_, i) => `${prefix}-${i}`).join(' ') },
    },
  ];
}

const substantiveCaseStudy: EligibilityDocument = {
  role: 'caseStudy',
  blocks: substantiveBlocks('case'),
};
const substantiveTechnical: EligibilityDocument = {
  role: 'technical',
  blocks: substantiveBlocks('tech'),
};
const thinCaseStudy: EligibilityDocument = {
  role: 'caseStudy',
  blocks: [{ id: 'thin', type: 'paragraph', data: { text: 'Too short.' } }],
};

describe('evaluateBuildPublicationChecklist', () => {
  it('passes every check for a fully eligible Build', () => {
    const checks = evaluateBuildPublicationChecklist({
      status: 'published',
      summary: 'A complete public summary.',
      hasHero: true,
      documents: [substantiveCaseStudy, substantiveTechnical],
    });
    expect(checks.every((check) => check.passed)).toBe(true);
  });

  it('reproduces the QueryCraft incident — a case study with no technical document', () => {
    const checks = evaluateBuildPublicationChecklist({
      status: 'published',
      summary: 'QueryCraft was an AI-assisted SQL workbench.',
      hasHero: true,
      documents: [substantiveCaseStudy],
    });
    const byId = Object.fromEntries(checks.map((check) => [check.id, check]));

    expect(byId.published?.passed).toBe(true);
    expect(byId.summary?.passed).toBe(true);
    expect(byId.hero?.passed).toBe(true);
    expect(byId.caseStudy?.passed).toBe(true);
    expect(byId.caseStudySubstantive?.passed).toBe(true);
    expect(byId.technical?.passed).toBe(false);
    expect(byId.technicalSubstantive?.passed).toBe(false);
    expect(byId.technical?.affectedSurfaces).toEqual(['detail', 'homepage']);

    // findDetail and homepage selection both fail; the index, search, and
    // relationships surfaces (which never call findDetail) are unaffected.
    expect(isBuildDetailEligible([substantiveCaseStudy])).toBe(false);
    expect(isBuildHomepageEligible({ hasHero: true, documents: [substantiveCaseStudy] })).toBe(
      false,
    );
  });

  it('flags an unpublished draft as excluded from every surface', () => {
    const checks = evaluateBuildPublicationChecklist({
      status: 'draft',
      summary: 'A summary.',
      hasHero: true,
      documents: [substantiveCaseStudy, substantiveTechnical],
    });
    const published = checks.find((check) => check.id === 'published');
    expect(published?.passed).toBe(false);
    expect(published?.affectedSurfaces).toEqual([
      'index',
      'detail',
      'homepage',
      'search',
      'relationships',
    ]);
  });

  it('flags a missing hero image as a homepage-only exclusion', () => {
    const checks = evaluateBuildPublicationChecklist({
      status: 'published',
      summary: 'A summary.',
      hasHero: false,
      documents: [substantiveCaseStudy, substantiveTechnical],
    });
    const hero = checks.find((check) => check.id === 'hero');
    expect(hero?.passed).toBe(false);
    expect(hero?.affectedSurfaces).toEqual(['homepage']);
    // Detail-page eligibility is unaffected by the missing hero.
    expect(isBuildDetailEligible([substantiveCaseStudy, substantiveTechnical])).toBe(true);
  });

  it('flags a present-but-too-thin Case Study document as homepage-only', () => {
    const checks = evaluateBuildPublicationChecklist({
      status: 'published',
      summary: 'A summary.',
      hasHero: true,
      documents: [thinCaseStudy, substantiveTechnical],
    });
    const caseStudy = checks.find((check) => check.id === 'caseStudy');
    const substantive = checks.find((check) => check.id === 'caseStudySubstantive');
    expect(caseStudy?.passed).toBe(true);
    expect(substantive?.passed).toBe(false);
    expect(substantive?.affectedSurfaces).toEqual(['homepage']);
    expect(isBuildDetailEligible([thinCaseStudy, substantiveTechnical])).toBe(true);
    expect(
      isBuildHomepageEligible({ hasHero: true, documents: [thinCaseStudy, substantiveTechnical] }),
    ).toBe(false);
  });
});

describe('Engineering Profile homepage eligibility', () => {
  const substantiveDocuments = [
    {
      role: 'overview',
      blocks: [
        {
          type: 'paragraph',
          data: { text: Array.from({ length: 50 }, (_, index) => `alpha-${index}`).join(' ') },
        },
        {
          type: 'paragraph',
          data: { text: Array.from({ length: 50 }, (_, index) => `beta-${index}`).join(' ') },
        },
      ],
    },
  ];

  it('excludes profiles without public contributions', () => {
    expect(
      isEngineeringProfileHomepageEligible({
        hasPortrait: true,
        contributionCount: 0,
        documents: substantiveDocuments,
      }),
    ).toBe(false);
  });

  it('includes a publicly eligible profile with a contribution and substantive record', () => {
    expect(
      isEngineeringProfileHomepageEligible({
        hasPortrait: true,
        contributionCount: 1,
        documents: substantiveDocuments,
      }),
    ).toBe(true);
  });
});

/**
 * Proves the Studio checklist and the public repository agree — not just
 * that each independently looks reasonable. Same document set fed through
 * `isBuildDetailEligible`/`isBuildHomepageEligible` directly, and through
 * `createPublicRepository`'s actual `findDetail`/`getHomepage`, must reach
 * the same verdict every time.
 */
describe('Studio checklist parity with the public repository', () => {
  function media(id: ObjectId): MediaAsset {
    return {
      _id: id,
      createdAt: now,
      updatedAt: now,
      cloudinaryPublicId: 'builds/hero',
      url: 'https://res.cloudinary.com/hubzero/image/upload/builds/hero.png',
      altText: 'Hero',
      width: 1600,
      height: 1000,
      folder: 'builds',
      reuseTags: [],
    };
  }

  function sourceFor(
    build: Build,
    documents: DocumentRecord[],
    heroMedia?: MediaAsset,
  ): PublicDataSource {
    const entity: StudioPublicEntity = { type: 'build', id: build._id.toString(), record: build };
    return {
      findEntityBySlug: async (type, slug) =>
        type === 'build' && slug === build.slug ? entity : null,
      findEntityById: async (type, id) => (type === 'build' && id === entity.id ? entity : null),
      listEntities: async (type) => (type === 'build' ? [entity] : []),
      findDocuments: async () => documents,
      findMedia: async (ids) =>
        heroMedia && ids.includes(heroMedia._id.toString()) ? [heroMedia] : [],
      findTaxonomy: async () => [],
      findUser: async () => null,
      findTeamsByUserId: async () => [],
      findProfileByTeamId: async () => null,
    };
  }

  function toDocumentRecord(ownerId: ObjectId, doc: EligibilityDocument): DocumentRecord {
    return {
      _id: new ObjectId(),
      ownerType: 'Build',
      ownerId,
      role: doc.role as DocumentRecord['role'],
      blocks: doc.blocks as DocumentRecord['blocks'],
      createdAt: now,
      updatedAt: now,
    };
  }

  it('agrees with findDetail: missing the technical Document nulls out the detail page', async () => {
    const heroId = new ObjectId();
    const build: Build = {
      _id: new ObjectId(),
      createdAt: now,
      updatedAt: now,
      createdByUserId: creator,
      status: 'published',
      slug: 'querycraft',
      referenceId: 'HZ-BL-001',
      title: 'QueryCraft',
      summary: 'QueryCraft was an AI-assisted SQL workbench.',
      deploymentState: 'retired',
      heroImageId: heroId,
      technologyIds: [],
      relatedWorkIds: [],
      galleryImageIds: [],
      featured: true,
      contributors: [],
    };
    const documents = [toDocumentRecord(build._id, substantiveCaseStudy)];
    const repository = createPublicRepository(sourceFor(build, documents, media(heroId)));

    const checklistVerdict = isBuildDetailEligible([substantiveCaseStudy]);
    const repositoryDetail = await repository.findDetail('build', 'querycraft');

    expect(checklistVerdict).toBe(false);
    expect(repositoryDetail).toBeNull();
  });

  it('agrees with getHomepage: a hero plus two substantive Documents makes a featured Build eligible', async () => {
    const heroId = new ObjectId();
    const build: Build = {
      _id: new ObjectId(),
      createdAt: now,
      updatedAt: now,
      createdByUserId: creator,
      status: 'published',
      slug: 'querycraft-complete',
      referenceId: 'HZ-BL-002',
      title: 'QueryCraft',
      summary: 'QueryCraft was an AI-assisted SQL workbench.',
      deploymentState: 'live',
      heroImageId: heroId,
      technologyIds: [],
      relatedWorkIds: [],
      galleryImageIds: [],
      featured: true,
      contributors: [],
    };
    const documents = [
      toDocumentRecord(build._id, substantiveCaseStudy),
      toDocumentRecord(build._id, substantiveTechnical),
    ];
    const repository = createPublicRepository(sourceFor(build, documents, media(heroId)));

    const checklistVerdict = isBuildHomepageEligible({
      hasHero: true,
      documents: [substantiveCaseStudy, substantiveTechnical],
    });
    const projection = await repository.getHomepage(now);

    expect(checklistVerdict).toBe(true);
    expect(projection.builds).toHaveLength(1);
    expect(projection.builds[0]?.entity.slug).toBe('querycraft-complete');
  });
});
