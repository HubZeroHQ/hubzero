import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const repository = () => ({ list: vi.fn(), update: vi.fn() });
  return {
    work: repository(),
    build: repository(),
    blueprint: repository(),
    lab: repository(),
    note: repository(),
    profile: repository(),
    findDocuments: vi.fn(),
    replaceDocumentReference: vi.fn(),
    publicTargetForOwner: vi.fn(),
  };
});

vi.mock('@/lib/db/repositories', () => ({
  workRepository: mocks.work,
  buildRepository: mocks.build,
  blueprintRepository: mocks.blueprint,
  labRepository: mocks.lab,
  noteRepository: mocks.note,
  engineeringProfileRepository: mocks.profile,
}));

vi.mock('@/lib/db/repositories/document', () => ({
  documentRepository: {
    findUsingTaxonomyEntry: mocks.findDocuments,
    replaceTaxonomyReference: mocks.replaceDocumentReference,
  },
}));

vi.mock('@/lib/public/cache-targets', () => ({
  publicCacheTargetsForOwner: mocks.publicTargetForOwner,
}));

import { reassignTaxonomyReferences, taxonomyPublicCacheTargets, taxonomyUsage } from './taxonomy';

const sourceId = new ObjectId().toString();
const targetId = new ObjectId().toString();

describe('taxonomy safeguards', () => {
  beforeEach(() => {
    for (const repository of [
      mocks.work,
      mocks.build,
      mocks.blueprint,
      mocks.lab,
      mocks.note,
      mocks.profile,
    ]) {
      repository.list.mockReset().mockResolvedValue([]);
      repository.update.mockReset().mockResolvedValue(null);
    }
    mocks.findDocuments.mockReset().mockResolvedValue([]);
    mocks.replaceDocumentReference.mockReset().mockResolvedValue(undefined);
    mocks.publicTargetForOwner.mockReset().mockResolvedValue([]);
  });

  it('counts distinct document owners so a referenced term cannot be deleted', async () => {
    const ownerId = new ObjectId();
    mocks.work.list.mockResolvedValue([
      { _id: new ObjectId(), technologyIds: [sourceId], categoryTagIds: [] },
    ]);
    mocks.findDocuments.mockResolvedValue([
      { ownerType: 'Work', ownerId, role: 'caseStudy' },
      { ownerType: 'Work', ownerId, role: 'caseStudy' },
    ]);

    await expect(taxonomyUsage(sourceId)).resolves.toEqual([
      { collection: 'Work', count: 1 },
      { collection: 'Document blocks', count: 1 },
    ]);
  });

  it('includes public Document owners in precise invalidation targets', async () => {
    const ownerId = new ObjectId();
    mocks.findDocuments.mockResolvedValue([
      { ownerType: 'Work', ownerId, role: 'caseStudy' },
      { ownerType: 'Team', ownerId: new ObjectId(), role: 'profile' },
    ]);
    mocks.publicTargetForOwner.mockResolvedValue([
      {
        type: 'work',
        slug: 'verification-work',
      },
    ]);

    await expect(taxonomyPublicCacheTargets(sourceId)).resolves.toEqual([
      { type: 'work', slug: 'verification-work' },
    ]);
    expect(mocks.publicTargetForOwner).toHaveBeenCalledTimes(1);
  });

  it('reassigns Document-block references through the Document repository', async () => {
    const entryId = new ObjectId();
    mocks.work.list.mockResolvedValue([
      {
        _id: entryId,
        technologyIds: [sourceId, targetId],
        categoryTagIds: [],
      },
    ]);

    await reassignTaxonomyReferences(sourceId, targetId);

    expect(mocks.replaceDocumentReference).toHaveBeenCalledWith(sourceId, targetId);
    expect(mocks.work.update).toHaveBeenCalledWith(entryId.toString(), {
      technologyIds: [targetId],
    });
  });
});
