import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PublishStatus } from '@/types/studio';

const mocks = vi.hoisted(() => ({
  requireEntryCapability: vi.fn(),
  findDocument: vi.fn(),
  updateBlocks: vi.fn(),
  createDocument: vi.fn(),
  recordEvent: vi.fn(),
  revalidatePath: vi.fn(),
  invalidateEntity: vi.fn(),
}));

vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock('@/lib/auth/permissions', () => ({
  requireEntryCapability: mocks.requireEntryCapability,
}));
vi.mock('@/lib/db/repositories/document', () => ({
  documentRepository: {
    findByOwnerAndRole: mocks.findDocument,
    updateBlocks: mocks.updateBlocks,
    create: mocks.createDocument,
  },
}));
vi.mock('@/lib/events/record', () => ({
  eventEntityTypeFor: (value: string) => value,
  recordEditorialEvent: mocks.recordEvent,
}));
vi.mock('@/lib/public/cache', () => ({
  invalidatePublicEntity: mocks.invalidateEntity,
}));
vi.mock('@/lib/public/repository', () => ({
  OWNER_TO_PUBLIC_TYPE: { Work: 'work' },
}));

import { createDocumentSaveAction } from './document-actions';

const blocks = [{ id: 'p', type: 'paragraph' as const, data: { text: 'Edited' } }];

function setup(status: 'draft' | 'published' = 'draft') {
  const owner: { slug: string; status: PublishStatus } = { slug: 'alpha', status };
  const setOwnerStatus = vi.fn(async (_id: string, nextStatus: PublishStatus) => ({
    ...owner,
    status: nextStatus,
  }));
  const action = createDocumentSaveAction({
    ownerType: 'Work',
    role: 'caseStudy',
    findOwnerById: async () => owner,
    setOwnerStatus,
    detailPath: (id) => `/studio/content/work/${id}`,
    listPath: '/studio/content/work',
  });
  return { action, setOwnerStatus };
}

describe('createDocumentSaveAction publishing integrity', () => {
  beforeEach(() => {
    Object.values(mocks).forEach((mock) => mock.mockReset());
    mocks.requireEntryCapability.mockResolvedValue({ userId: 'actor' });
    mocks.findDocument.mockResolvedValue({ _id: { toString: () => 'document' } });
    mocks.updateBlocks.mockResolvedValue({});
    mocks.recordEvent.mockResolvedValue(undefined);
  });

  it('moves a published owner back to review before saving its document', async () => {
    const { action, setOwnerStatus } = setup('published');

    await expect(action('owner', blocks)).resolves.toEqual({});

    expect(setOwnerStatus).toHaveBeenCalledTimes(1);
    expect(setOwnerStatus).toHaveBeenCalledWith('owner', 'inReview');
    expect(setOwnerStatus.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.updateBlocks.mock.invocationCallOrder[0] as number,
    );
    expect(mocks.recordEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: 'work',
        entityId: 'owner',
        payload: { type: 'entry.statusChanged', from: 'published', to: 'inReview' },
      }),
    );
    expect(mocks.invalidateEntity).toHaveBeenCalledWith('work', 'alpha');
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/studio/content/work');
  });

  it('restores published status when persistence fails', async () => {
    mocks.updateBlocks.mockRejectedValue(new Error('write failed'));
    const { action, setOwnerStatus } = setup('published');

    await expect(action('owner', blocks)).resolves.toEqual({ error: 'write failed' });

    expect(setOwnerStatus.mock.calls).toEqual([
      ['owner', 'inReview'],
      ['owner', 'published'],
    ]);
    expect(mocks.invalidateEntity).not.toHaveBeenCalled();
    expect(mocks.recordEvent).not.toHaveBeenCalled();
  });

  it('invalidates public state and logs if rollback itself fails', async () => {
    mocks.updateBlocks.mockRejectedValue(new Error('write failed'));
    const { action, setOwnerStatus } = setup('published');
    setOwnerStatus
      .mockResolvedValueOnce({ slug: 'alpha', status: 'inReview' })
      .mockRejectedValueOnce(new Error('rollback failed'));
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(action('owner', blocks)).resolves.toEqual({ error: 'write failed' });

    expect(mocks.invalidateEntity).toHaveBeenCalledWith('work', 'alpha');
    expect(error).toHaveBeenCalledWith(
      'Document save status rollback failed',
      expect.objectContaining({ ownerType: 'Work', ownerId: 'owner' }),
    );
  });

  it('does not touch workflow or public caches for a draft document save', async () => {
    const { action, setOwnerStatus } = setup('draft');

    await expect(action('owner', blocks)).resolves.toEqual({});

    expect(setOwnerStatus).not.toHaveBeenCalled();
    expect(mocks.invalidateEntity).not.toHaveBeenCalled();
  });
});
