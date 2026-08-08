import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  append: vi.fn(),
  ensureIndexes: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({ auth: mocks.auth }));
vi.mock('./repository', () => ({
  editorialEventRepository: { append: mocks.append },
  ensureEditorialEventIndexes: mocks.ensureIndexes,
}));

import { recordEditorialEvent } from './record';

describe('recordEditorialEvent', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    mocks.auth.mockReset();
    mocks.append.mockReset();
    mocks.ensureIndexes.mockReset();
  });

  it('records the resolved actor after indexes are ready', async () => {
    mocks.ensureIndexes.mockResolvedValue(undefined);
    mocks.auth.mockResolvedValue({ user: { id: '6a6c9ede16af3400242a48e9' } });
    mocks.append.mockResolvedValue({});

    await recordEditorialEvent({
      entityType: 'work',
      entityId: '6a6c9ede16af3400242a48e8',
      payload: { type: 'entry.updated' },
    });

    expect(mocks.ensureIndexes).toHaveBeenCalledBefore(mocks.append);
    expect(mocks.append).toHaveBeenCalledWith({
      entityType: 'work',
      entityId: '6a6c9ede16af3400242a48e8',
      actorUserId: '6a6c9ede16af3400242a48e9',
      payload: { type: 'entry.updated' },
    });
  });

  it('surfaces a failed append internally without failing the mutation', async () => {
    mocks.ensureIndexes.mockResolvedValue(undefined);
    mocks.auth.mockResolvedValue({ user: { id: '6a6c9ede16af3400242a48e9' } });
    mocks.append.mockRejectedValue(new Error('insert failed'));
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(
      recordEditorialEvent({
        entityType: 'note',
        entityId: '6a6c9ede16af3400242a48e8',
        payload: { type: 'entry.updated' },
      }),
    ).resolves.toBeUndefined();

    expect(error).toHaveBeenCalledWith(
      'Editorial event write failed',
      expect.objectContaining({
        entityType: 'note',
        entityId: '6a6c9ede16af3400242a48e8',
        eventType: 'entry.updated',
        error: expect.any(Error),
      }),
    );
  });
});
