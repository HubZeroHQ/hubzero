import { ObjectId } from 'mongodb';
import { describe, expect, it } from 'vitest';
import type { Blueprint, Build, Lab, MediaAsset, Note, Work } from '@/types/studio';
import { createPublicRepository } from './repository';
import type { PublicDataSource, StudioPublicEntity } from './source';

/**
 * Regression coverage for the QueryCraft incident: `mapSummary()` reads a
 * record-level summary field per collection (Work.summary, Blueprint.
 * shortDescription, Lab.objective, Note.summary, Build.summary), and every
 * one of those fields must actually exist on the schema-backed record — not
 * be assumed, like Build's `productSummary`/`summary` guess once was. Each
 * case here proves the schema-backed field alone is sufficient to produce a
 * public summary, an EntityGraph node, and a search/discovery entry.
 */

const now = new Date('2026-07-18T00:00:00.000Z');
const creator = new ObjectId();

function entity(type: StudioPublicEntity['type'], record: StudioPublicEntity['record']) {
  return { type, id: record._id.toString(), record } as StudioPublicEntity;
}

function sourceFor(target: StudioPublicEntity, media: MediaAsset[] = []): PublicDataSource {
  return {
    findEntityBySlug: async (type, slug) =>
      type === target.type && 'slug' in target.record && target.record.slug === slug
        ? target
        : null,
    findEntityById: async (type, id) => (type === target.type && id === target.id ? target : null),
    listEntities: async (type) => (type === target.type ? [target] : []),
    findDocuments: async () => [],
    findMedia: async (ids) => media.filter((asset) => ids.includes(asset._id.toString())),
    findTaxonomy: async () => [],
    findUser: async () => null,
    findTeamsByUserId: async () => [],
    findProfileByTeamId: async () => null,
  };
}

async function expectSummaryProduced(
  target: StudioPublicEntity,
  expectedSummary: string,
  media: MediaAsset[] = [],
) {
  const repository = createPublicRepository(sourceFor(target, media));

  const summaries = await repository.listSummaries(target.type);
  expect(summaries).toHaveLength(1);
  expect(summaries[0]?.summary).toBe(expectedSummary);

  const discovery = await repository.listDiscoveryEntries([target.type]);
  expect(discovery).toHaveLength(1);
}

describe('every public collection produces a summary from its own schema-backed field', () => {
  it('Work — reads `summary`', async () => {
    const work: Work = {
      _id: new ObjectId(),
      createdAt: now,
      updatedAt: now,
      createdByUserId: creator,
      status: 'published',
      slug: 'northwind-migration',
      referenceId: 'HZ-WK-901',
      title: 'Northwind migration',
      summary: 'A concise account of the Northwind migration and its consequences.',
      clientType: 'Private',
      categoryTagIds: [],
      timeline: '2026',
      role: 'Engineering',
      technologyIds: [],
      relatedBuildIds: [],
      relatedBlueprintIds: [],
      relatedLabIds: [],
      contributors: [],
    };
    await expectSummaryProduced(entity('work', work), work.summary);
  });

  it('Blueprint — reads `shortDescription`', async () => {
    const previewAsset: MediaAsset = {
      _id: new ObjectId(),
      createdAt: now,
      updatedAt: now,
      cloudinaryPublicId: 'blueprints/preview',
      url: 'https://res.cloudinary.com/hubzero/image/upload/blueprints/preview.png',
      altText: 'Preview',
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
      referenceId: 'HZ-BP-901',
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
      contributors: [],
    };
    await expectSummaryProduced(entity('blueprint', blueprint), blueprint.shortDescription, [
      previewAsset,
    ]);
  });

  it('Lab — reads `objective`', async () => {
    const lab: Lab = {
      _id: new ObjectId(),
      createdAt: now,
      updatedAt: now,
      createdByUserId: creator,
      status: 'published',
      slug: 'edge-inference-lab',
      referenceId: 'HZ-LB-901',
      title: 'Edge inference',
      stage: 'building',
      objective: 'Investigate low-latency inference at the edge.',
      researchDirection: 'On-device quantized models.',
      currentMilestone: 'Benchmark against the cloud baseline.',
      graduationCriteria: 'Sub-50ms inference on target hardware.',
      startDate: now,
      internalRepoUrl: 'https://example.com/internal/edge-inference',
      technologyIds: [],
      relatedBuildIds: [],
      relatedBlueprintIds: [],
      galleryImageIds: [],
      featured: false,
      milestones: [],
      contributors: [],
    };
    await expectSummaryProduced(entity('lab', lab), lab.objective);
  });

  it('Note — reads `summary`', async () => {
    const note: Note = {
      _id: new ObjectId(),
      createdAt: now,
      updatedAt: now,
      createdByUserId: creator,
      status: 'published',
      slug: 'read-models',
      referenceId: 'HZ-NT-901',
      title: 'Read models',
      authorId: new ObjectId(),
      summary: 'Why public contracts should differ from editing records.',
      technologyIds: [],
      relatedEntries: [],
      publicationDate: now,
      featured: false,
      galleryImageIds: [],
      contributors: [],
    };
    await expectSummaryProduced(entity('note', note), note.summary);
  });

  it('Build — reads `summary` (the field QueryCraft was missing)', async () => {
    const build: Build = {
      _id: new ObjectId(),
      createdAt: now,
      updatedAt: now,
      createdByUserId: creator,
      status: 'published',
      slug: 'querycraft',
      referenceId: 'HZ-BL-901',
      title: 'QueryCraft',
      summary: 'A query authoring product built for internal analytics teams.',
      deploymentState: 'live',
      technologyIds: [],
      relatedWorkIds: [],
      galleryImageIds: [],
      featured: true,
      contributors: [],
    };
    await expectSummaryProduced(entity('build', build), build.summary);
  });
});
