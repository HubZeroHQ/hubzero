import { describe, expect, it, vi } from 'vitest';

// `entry-actions` imports `auth` from `@/lib/auth`, which initializes the
// real NextAuth config (next-auth + the MongoDB adapter) — that chain
// doesn't resolve under vitest's module graph, same reasoning as
// `lib/auth/permissions.test.ts`. A stub session is enough since nothing
// under test needs a real NextAuth session.
vi.mock('@/lib/auth', () => ({ auth: vi.fn() }));

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

// `invalidatePublicEntity` pulls in `server-only`, which throws outside a
// real Next.js server bundle. None of these tests pass `publicType`, so the
// real implementation is never reached — a stub just lets the module load.
vi.mock('@/lib/public/cache', () => ({ invalidatePublicEntity: vi.fn() }));

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { createEntryTransitionAction } from './entry-actions';

function mockSession(role: 'headAdmin' | 'admin' | 'member') {
  vi.mocked(auth).mockResolvedValue({
    user: { role, id: 'user-1' },
  } as unknown as Awaited<ReturnType<typeof auth>>);
}

describe('createEntryTransitionAction', () => {
  it('revalidates both the entry detail path and the collection list path on a forward/override transition', async () => {
    vi.mocked(revalidatePath).mockClear();
    mockSession('headAdmin');

    const record = { _id: 'entry-1', status: 'published' as const, slug: 'entry-1' };
    const setStatus = vi.fn().mockResolvedValue({ ...record, status: 'draft' });
    const findById = vi.fn().mockResolvedValue(record);

    const transitionAction = createEntryTransitionAction({
      findById,
      setStatus,
      detailPath: (id) => `/studio/content/work/${id}`,
      listPath: '/studio/content/work',
    });

    const result = await transitionAction('entry-1', 'draft');

    expect(result).toEqual({});
    expect(setStatus).toHaveBeenCalledWith('entry-1', 'draft', null);
    // Regression coverage for the Studio review-page staleness bug: the
    // collection list must be revalidated alongside the detail page,
    // otherwise a Link/back-button return to the list serves the
    // pre-transition Router Cache entry until a hard reload.
    expect(vi.mocked(revalidatePath)).toHaveBeenCalledWith('/studio/content/work/entry-1');
    expect(vi.mocked(revalidatePath)).toHaveBeenCalledWith('/studio/content/work');
  });

  it('revalidates both paths on a reject transition too', async () => {
    vi.mocked(revalidatePath).mockClear();
    mockSession('headAdmin');

    const record = { _id: 'entry-2', status: 'inReview' as const, slug: 'entry-2' };
    const setStatus = vi.fn().mockResolvedValue({ ...record, status: 'draft' });
    const findById = vi.fn().mockResolvedValue(record);

    const transitionAction = createEntryTransitionAction({
      findById,
      setStatus,
      detailPath: (id) => `/studio/content/notes/${id}`,
      listPath: '/studio/content/notes',
    });

    const result = await transitionAction('entry-2', 'draft', 'Needs another pass.');

    expect(result).toEqual({});
    expect(setStatus).toHaveBeenCalledWith('entry-2', 'draft', 'Needs another pass.');
    expect(vi.mocked(revalidatePath)).toHaveBeenCalledWith('/studio/content/notes/entry-2');
    expect(vi.mocked(revalidatePath)).toHaveBeenCalledWith('/studio/content/notes');
  });

  describe('Restore (archived -> draft)', () => {
    it('succeeds for Admin, who has publish but not unpublishOverride — proves restore is classified as a normal forward transition, not swallowed by the Head-Admin-only override branch', async () => {
      vi.mocked(revalidatePath).mockClear();
      mockSession('admin');

      const record = { _id: 'entry-3', status: 'archived' as const, slug: 'entry-3' };
      const setStatus = vi.fn().mockResolvedValue({ ...record, status: 'draft' });
      const findById = vi.fn().mockResolvedValue(record);

      const transitionAction = createEntryTransitionAction({
        findById,
        setStatus,
        detailPath: (id) => `/studio/content/blueprints/${id}`,
        listPath: '/studio/content/blueprints',
      });

      const result = await transitionAction('entry-3', 'draft');

      expect(result).toEqual({});
      // No note required for Restore, unlike Reject.
      expect(setStatus).toHaveBeenCalledWith('entry-3', 'draft', null);
      expect(vi.mocked(revalidatePath)).toHaveBeenCalledWith('/studio/content/blueprints/entry-3');
      expect(vi.mocked(revalidatePath)).toHaveBeenCalledWith('/studio/content/blueprints');
    });

    it('is rejected for Member, who lacks `publish`', async () => {
      mockSession('member');

      const record = { _id: 'entry-4', status: 'archived' as const, slug: 'entry-4' };
      const setStatus = vi.fn();
      const findById = vi.fn().mockResolvedValue(record);

      const transitionAction = createEntryTransitionAction({
        findById,
        setStatus,
        detailPath: (id) => `/studio/content/blueprints/${id}`,
        listPath: '/studio/content/blueprints',
      });

      const result = await transitionAction('entry-4', 'draft');

      expect(result.error).toBeTruthy();
      expect(setStatus).not.toHaveBeenCalled();
    });
  });
});
