import { ObjectId } from 'mongodb';
import { describe, expect, it } from 'vitest';
import type { MediaAsset } from '@/types/studio';
import { cloudinaryImageUrl, toPublicMedia } from './media';

function asset(overrides: Partial<MediaAsset> = {}): MediaAsset {
  return {
    _id: new ObjectId(),
    cloudinaryPublicId: 'hubzero/builds/product',
    url: 'https://res.cloudinary.com/demo/image/upload/v1/product.png',
    altText: 'Product settings screen',
    width: 1600,
    height: 900,
    folder: 'builds',
    reuseTags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('public media resolution', () => {
  it('creates bounded Cloudinary transformations and responsive variants', () => {
    const result = toPublicMedia(asset(), 'hero');
    expect(result?.url).toContain('/upload/f_auto,q_auto,c_limit,w_1600/');
    expect(result?.responsive.srcSet).toContain('320w');
    expect(result?.placeholder).toEqual({ kind: 'color', value: '#141414' });
  });

  it('fails closed without dimensions or truthful alt text', () => {
    expect(toPublicMedia(asset({ width: undefined }), 'hero')).toBeUndefined();
    expect(toPublicMedia(asset({ altText: '' }), 'hero')).toBeUndefined();
  });

  it('does not treat arbitrary external URLs as Cloudinary delivery sources', () => {
    expect(cloudinaryImageUrl('https://example.com/image.png', 640)).toBeNull();
    expect(cloudinaryImageUrl('javascript:alert(1)', 640)).toBeNull();
  });
});
