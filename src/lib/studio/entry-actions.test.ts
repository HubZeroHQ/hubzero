import { describe, expect, it, vi } from 'vitest';

// `entry-actions` imports `auth` from `@/lib/auth`, which initializes the
// real NextAuth config (next-auth + the MongoDB adapter) — that chain
// doesn't resolve under vitest's module graph, same reasoning as
// `lib/auth/permissions.test.ts`. A stub session is enough since nothing
// under test needs a real NextAuth session.
vi.mock('@/lib/auth', () => ({ auth: vi.fn() }));
vi.mock('@/lib/events/record', () => ({
  eventEntityTypeFor: (value: string) => value,
  recordEditorialEvent: vi.fn(),
}));

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

// `invalidatePublicEntity` pulls in `server-only`, which throws outside a
// real Next.js server bundle. A spy also verifies the publish-boundary rule.
vi.mock('@/lib/public/cache', () => ({ invalidatePublicEntity: vi.fn() }));

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { invalidatePublicEntity } from '@/lib/public/cache';
import type { PublishStatus } from '@/types/studio';
import { createEntryTransitionAction, createEntryUpdateAction } from './entry-actions';

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

    expect(result).toMatchObject({ ok: true, workflow: { status: 'draft' } });
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

    expect(result).toMatchObject({
      ok: true,
      workflow: { status: 'draft', reviewNote: 'Needs another pass.' },
    });
    expect(setStatus).toHaveBeenCalledWith('entry-2', 'draft', 'Needs another pass.');
    expect(vi.mocked(revalidatePath)).toHaveBeenCalledWith('/studio/content/notes/entry-2');
    expect(vi.mocked(revalidatePath)).toHaveBeenCalledWith('/studio/content/notes');
  });

  it('invalidates public reads only when a transition crosses the published boundary', async () => {
    vi.mocked(invalidatePublicEntity).mockClear();
    mockSession('headAdmin');

    const draft = { _id: 'entry-5', status: 'draft' as const, slug: 'entry-5' };
    const transitionAction = createEntryTransitionAction({
      findById: vi
        .fn()
        .mockResolvedValueOnce(draft)
        .mockResolvedValueOnce({ ...draft, status: 'approved' }),
      setStatus: vi.fn().mockImplementation(async (_id, status) => ({ ...draft, status })),
      detailPath: (id) => `/studio/content/work/${id}`,
      listPath: '/studio/content/work',
      publicType: 'work',
    });

    await transitionAction('entry-5', 'inReview');
    expect(vi.mocked(invalidatePublicEntity)).not.toHaveBeenCalled();

    await transitionAction('entry-5', 'published');
    expect(vi.mocked(invalidatePublicEntity)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(invalidatePublicEntity)).toHaveBeenCalledWith('work', 'entry-5');
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

      expect(result).toMatchObject({ ok: true, workflow: { status: 'draft' } });
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

describe('createEntryUpdateAction', () => {
  it('revalidates both the detail and collection paths after a metadata save', async () => {
    vi.mocked(revalidatePath).mockClear();
    mockSession('headAdmin');

    const record = {
      _id: 'entry-6',
      status: 'draft' as const,
      slug: 'entry-6',
      title: 'Before',
    };
    const updateAction = createEntryUpdateAction<
      typeof record,
      { title: string; status?: PublishStatus; reviewNote?: string | null }
    >({
      findById: vi.fn().mockResolvedValue(record),
      update: vi.fn().mockResolvedValue({ ...record, title: 'After' }),
      parseFormData: () => ({ title: 'After' }),
      detailPath: (id) => `/studio/content/work/${id}`,
      listPath: '/studio/content/work',
    });

    await expect(updateAction('entry-6', {}, new FormData())).resolves.toEqual({ ok: true });
    expect(vi.mocked(revalidatePath)).toHaveBeenCalledWith('/studio/content/work/entry-6');
    expect(vi.mocked(revalidatePath)).toHaveBeenCalledWith('/studio/content/work');
  });
});
