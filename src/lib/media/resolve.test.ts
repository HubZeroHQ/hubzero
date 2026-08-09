import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { MediaAsset } from '@/types/studio';

const { findByIds } = vi.hoisted(() => ({ findByIds: vi.fn() }));

vi.mock('@/lib/db/repositories/media', () => ({
  mediaRepository: { findByIds },
}));

import { resolveHeroAndGallery, resolveMediaAssets } from './resolve';

function asset(id: ObjectId, label: string): MediaAsset {
  return {
    _id: id,
    createdAt: new Date('2026-08-08T00:00:00.000Z'),
    updatedAt: new Date('2026-08-08T00:00:00.000Z'),
    cloudinaryPublicId: `performance/${label}`,
    url: `https://res.cloudinary.com/demo/image/upload/${label}.png`,
    altText: label,
    width: 1600,
    height: 1000,
    folder: 'general',
    reuseTags: [],
  };
}

describe('batched media resolution', () => {
  beforeEach(() => findByIds.mockReset());

  it('resolves hero and gallery with one repository call while preserving gallery order', async () => {
    const heroId = new ObjectId();
    const firstId = new ObjectId();
    const secondId = new ObjectId();
    const hero = asset(heroId, 'hero');
    const first = asset(firstId, 'first');
    const second = asset(secondId, 'second');
    findByIds.mockResolvedValue([second, hero, first]);

    const result = await resolveHeroAndGallery(heroId, [firstId, secondId]);

    expect(findByIds).toHaveBeenCalledOnce();
    expect(findByIds).toHaveBeenCalledWith([
      heroId.toString(),
      firstId.toString(),
      secondId.toString(),
    ]);
    expect(result.heroAsset).toBe(hero);
    expect(result.galleryAssets).toEqual([first, second]);
  });

  it('omits missing assets without changing the requested order or issuing per-id reads', async () => {
    const firstId = new ObjectId();
    const missingId = new ObjectId();
    const first = asset(firstId, 'first');
    findByIds.mockResolvedValue([first]);

    const result = await resolveMediaAssets([missingId, firstId, missingId]);

    expect(findByIds).toHaveBeenCalledOnce();
    expect(result).toEqual([first]);
  });
});
