import { describe, expect, it } from 'vitest';
import { mediaAssetSchema } from './media';

describe('mediaAssetSchema', () => {
  it('requires alt text', () => {
    const result = mediaAssetSchema.safeParse({
      cloudinaryPublicId: 'hubzero/general/abc',
      url: 'https://res.cloudinary.com/demo/image/upload/abc.jpg',
      altText: '',
    });
    expect(result.success).toBe(false);
  });

  it('defaults folder to "general" and reuseTags to an empty array', () => {
    const result = mediaAssetSchema.parse({
      cloudinaryPublicId: 'hubzero/general/abc',
      url: 'https://res.cloudinary.com/demo/image/upload/abc.jpg',
      altText: 'A description',
    });
    expect(result.folder).toBe('general');
    expect(result.reuseTags).toEqual([]);
  });

  it('rejects a folder outside the fixed one-level set', () => {
    const result = mediaAssetSchema.safeParse({
      cloudinaryPublicId: 'hubzero/general/abc',
      url: 'https://res.cloudinary.com/demo/image/upload/abc.jpg',
      altText: 'A description',
      folder: 'not-a-real-folder',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a non-url string', () => {
    const result = mediaAssetSchema.safeParse({
      cloudinaryPublicId: 'hubzero/general/abc',
      url: 'not-a-url',
      altText: 'A description',
    });
    expect(result.success).toBe(false);
  });

  it('accepts optional file info fields', () => {
    const result = mediaAssetSchema.parse({
      cloudinaryPublicId: 'hubzero/general/abc',
      url: 'https://res.cloudinary.com/demo/image/upload/abc.jpg',
      altText: 'A description',
      width: 1200,
      height: 800,
      fileSizeBytes: 204800,
      mimeType: 'image/jpeg',
      originalFilename: 'hero.jpg',
      folder: 'work',
      reuseTags: ['hero', 'dark-mode'],
    });
    expect(result).toMatchObject({
      width: 1200,
      height: 800,
      fileSizeBytes: 204800,
      mimeType: 'image/jpeg',
      originalFilename: 'hero.jpg',
      folder: 'work',
      reuseTags: ['hero', 'dark-mode'],
    });
  });
});
