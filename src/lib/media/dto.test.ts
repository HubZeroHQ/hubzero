import { ObjectId } from 'mongodb';
import { describe, expect, it } from 'vitest';
import { toMediaAssetDTO } from './dto';
import type { MediaAsset } from '@/types/studio';

function makeAsset(overrides: Partial<MediaAsset> = {}): MediaAsset {
  return {
    _id: new ObjectId(),
    cloudinaryPublicId: 'hubzero/general/abc',
    url: 'https://res.cloudinary.com/demo/image/upload/abc.jpg',
    altText: 'A description',
    folder: 'general',
    reuseTags: [],
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    ...overrides,
  };
}

describe('toMediaAssetDTO', () => {
  it('serializes ObjectId and Date fields to plain strings', () => {
    const asset = makeAsset();
    const dto = toMediaAssetDTO(asset);

    expect(dto.id).toBe(asset._id.toString());
    expect(dto.createdAt).toBe('2026-01-01T00:00:00.000Z');
    expect(dto.updatedAt).toBe('2026-01-02T00:00:00.000Z');
    // Never a leaked ObjectId/Date instance across the Server Action boundary.
    expect(typeof dto.id).toBe('string');
    expect(typeof dto.createdAt).toBe('string');
  });

  it('carries optional fields through unset', () => {
    const dto = toMediaAssetDTO(makeAsset());
    expect(dto.caption).toBeUndefined();
    expect(dto.width).toBeUndefined();
    expect(dto.fileSizeBytes).toBeUndefined();
  });

  it('carries optional fields through when present', () => {
    const dto = toMediaAssetDTO(
      makeAsset({ caption: 'A caption', credit: 'Photo by X', width: 1200, height: 800 }),
    );
    expect(dto.caption).toBe('A caption');
    expect(dto.credit).toBe('Photo by X');
    expect(dto.width).toBe(1200);
    expect(dto.height).toBe(800);
  });
});
