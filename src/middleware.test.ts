import type { NextFetchEvent } from 'next/server';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { middleware } from './middleware';

const queryMocks = vi.hoisted(() => ({
  getPublicDetail: vi.fn(),
}));

vi.mock('@/lib/public/queries', () => queryMocks);
vi.mock('next-auth', () => ({
  default: () => ({ auth: (handler: unknown) => handler }),
}));

const event = {
  passThroughOnException: vi.fn(),
  waitUntil: vi.fn(),
} as unknown as NextFetchEvent;

const routeFamilies = [
  ['work', 'work'],
  ['builds', 'build'],
  ['blueprints', 'blueprint'],
  ['labs', 'lab'],
  ['notes', 'note'],
  ['engineering', 'engineeringProfile'],
  ['careers', 'career'],
] as const;

describe('public detail not-found preflight', () => {
  beforeEach(() => vi.clearAllMocks());

  it.each(routeFamilies)(
    'rewrites a genuinely missing /%s record to the independently rendered 404',
    async (route, type) => {
      queryMocks.getPublicDetail.mockResolvedValueOnce(null);

      const response = await middleware(
        new NextRequest(`https://hubzero.in/${route}/does-not-exist`),
        event,
      );

      expect(response).toBeInstanceOf(Response);
      if (!response) throw new Error('Expected middleware response');
      expect(queryMocks.getPublicDetail).toHaveBeenCalledWith(type, 'does-not-exist');
      expect(response.status).toBe(404);
      expect(response.headers.get('x-middleware-rewrite')).toBe('https://hubzero.in/_not-found');
    },
  );

  it.each(routeFamilies)('allows an existing /%s record through', async (route, type) => {
    queryMocks.getPublicDetail.mockResolvedValueOnce({ type });

    const response = await middleware(
      new NextRequest(`https://hubzero.in/${route}/published`),
      event,
    );

    expect(response).toBeInstanceOf(Response);
    if (!response) throw new Error('Expected middleware response');
    expect(response.status).toBe(200);
    expect(response.headers.get('x-middleware-next')).toBe('1');
    expect(response.headers.has('x-middleware-rewrite')).toBe(false);
  });

  it('preserves Draft Mode resolution for unpublished preview records', async () => {
    const request = new NextRequest('https://hubzero.in/work/draft-record', {
      headers: { cookie: '__prerender_bypass=signed-preview-cookie' },
    });

    const response = await middleware(request, event);

    expect(response).toBeInstanceOf(Response);
    if (!response) throw new Error('Expected middleware response');
    expect(queryMocks.getPublicDetail).not.toHaveBeenCalled();
    expect(response.headers.get('x-middleware-next')).toBe('1');
  });

  it('resolves an encoded slug using the same decoded value as App Router params', async () => {
    queryMocks.getPublicDetail.mockResolvedValueOnce({ type: 'work' });

    const response = await middleware(
      new NextRequest('https://hubzero.in/work/published%2Drecord'),
      event,
    );

    expect(queryMocks.getPublicDetail).toHaveBeenCalledWith('work', 'published-record');
    expect(response?.status).toBe(200);
    expect(response?.headers.get('x-middleware-next')).toBe('1');
  });

  it('safely returns the global 404 for a malformed encoded slug without querying', async () => {
    const response = await middleware(
      new NextRequest('https://hubzero.in/work/malformed%E0%A4%A'),
      event,
    );

    expect(queryMocks.getPublicDetail).not.toHaveBeenCalled();
    expect(response?.status).toBe(404);
    expect(response?.headers.get('x-middleware-rewrite')).toBe('https://hubzero.in/_not-found');
  });

  it('propagates a read failure instead of presenting it as a missing record', async () => {
    const readFailure = new Error('public read failed');
    queryMocks.getPublicDetail.mockRejectedValueOnce(readFailure);

    await expect(
      middleware(new NextRequest('https://hubzero.in/notes/read-failure'), event),
    ).rejects.toBe(readFailure);
  });
});
