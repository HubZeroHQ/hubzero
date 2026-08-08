import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ revalidateTag: vi.fn() }));
vi.mock('next/cache', () => ({ revalidateTag: mocks.revalidateTag }));

import {
  invalidatePublicEntity,
  invalidatePublicFeaturedOrder,
  invalidatePublicMediaTargets,
  invalidatePublicTaxonomyTargets,
} from './cache';

describe('public cache invalidation', () => {
  beforeEach(() => {
    mocks.revalidateTag.mockClear();
  });

  it('invalidates every real dependency of a published entity mutation', () => {
    invalidatePublicEntity('work', 'alpha');

    expect(mocks.revalidateTag.mock.calls.map(([tag]) => tag)).toEqual([
      'public:entity:work:alpha',
      'public:collection:work',
      'public:relations',
      'public:homepage',
      'public:discovery',
    ]);
  });

  it('keeps featured-order invalidation scoped to its collection and homepage', () => {
    invalidatePublicFeaturedOrder('note');

    expect(mocks.revalidateTag.mock.calls.map(([tag]) => tag)).toEqual([
      'public:collection:note',
      'public:homepage',
    ]);
  });

  it('invalidates only entities that reference changed media, including discovery', () => {
    invalidatePublicMediaTargets([
      { type: 'work', slug: 'alpha' },
      { type: 'work', slug: 'alpha' },
      { type: 'lab', slug: 'experiment' },
    ]);

    expect(mocks.revalidateTag.mock.calls.map(([tag]) => tag)).toEqual([
      'public:entity:work:alpha',
      'public:entity:lab:experiment',
      'public:collection:work',
      'public:collection:lab',
      'public:homepage',
      'public:discovery',
    ]);
  });

  it('also refreshes discovery for precise taxonomy dependants', () => {
    invalidatePublicTaxonomyTargets([{ type: 'engineeringProfile', slug: 'ada' }]);

    expect(mocks.revalidateTag.mock.calls.map(([tag]) => tag)).toEqual([
      'public:entity:engineeringProfile:ada',
      'public:collection:engineeringProfile',
      'public:relations',
      'public:authors',
      'public:homepage',
      'public:discovery',
    ]);
  });

  it('refreshes Note author projections only for identity targets', () => {
    invalidatePublicEntity('engineeringProfile', 'ada');

    expect(mocks.revalidateTag.mock.calls.map(([tag]) => tag)).toEqual([
      'public:entity:engineeringProfile:ada',
      'public:collection:engineeringProfile',
      'public:relations',
      'public:authors',
      'public:homepage',
      'public:discovery',
    ]);
  });

  it('does nothing when a media/taxonomy mutation has no public dependants', () => {
    invalidatePublicMediaTargets([]);
    invalidatePublicTaxonomyTargets([]);

    expect(mocks.revalidateTag).not.toHaveBeenCalled();
  });
});
