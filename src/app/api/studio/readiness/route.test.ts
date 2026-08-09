import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  ensureMongoReady: vi.fn(),
}));

vi.mock('@/lib/db/mongodb', () => ({
  ensureMongoReady: mocks.ensureMongoReady,
}));

describe('Studio readiness endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 204 without a body when MongoDB is ready', async () => {
    mocks.ensureMongoReady.mockResolvedValue(undefined);
    const { GET } = await import('./route');

    const response = await GET();

    expect(response.status).toBe(204);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(await response.text()).toBe('');
  });

  it('returns a detail-free 503 when MongoDB readiness fails', async () => {
    mocks.ensureMongoReady.mockRejectedValue(new Error('private connection detail'));
    const { GET } = await import('./route');

    const response = await GET();

    expect(response.status).toBe(503);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(await response.json()).toEqual({ error: 'Service unavailable' });
  });
});
