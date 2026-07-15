import { describe, expect, it } from 'vitest';
import {
  fileAttachmentBlockSchema,
  imageBlockSchema,
  linksBlockSchema,
  referencesBlockSchema,
  videoEmbedBlockSchema,
} from './blocks';

// Regression coverage: `z.string().url()` alone accepts any well-formed URL,
// including javascript:/data: schemes, which BlockRenderer would then render
// as a real href/src with no further check (a genuine click-triggered XSS
// vector for links/references/videoEmbed/fileAttachment, and a phishing
// vector for fileAttachment's data: URLs).
describe('block URL fields reject unsafe schemes', () => {
  const dangerous = ['javascript:alert(document.cookie)', 'data:text/html,<script>1</script>'];
  const safe = ['https://example.com/doc', 'http://example.com/doc'];

  it('image.url', () => {
    for (const url of dangerous) {
      expect(
        imageBlockSchema.safeParse({
          id: '1',
          type: 'image',
          data: { mediaId: 'm', url, altText: 'alt' },
        }).success,
      ).toBe(false);
    }
    for (const url of safe) {
      expect(
        imageBlockSchema.safeParse({
          id: '1',
          type: 'image',
          data: { mediaId: 'm', url, altText: 'alt' },
        }).success,
      ).toBe(true);
    }
  });

  it('videoEmbed.url', () => {
    for (const url of dangerous) {
      expect(
        videoEmbedBlockSchema.safeParse({ id: '1', type: 'videoEmbed', data: { url } }).success,
      ).toBe(false);
    }
    expect(
      videoEmbedBlockSchema.safeParse({ id: '1', type: 'videoEmbed', data: { url: safe[0] } })
        .success,
    ).toBe(true);
  });

  it('fileAttachment.url', () => {
    for (const url of dangerous) {
      expect(
        fileAttachmentBlockSchema.safeParse({
          id: '1',
          type: 'fileAttachment',
          data: { url, fileName: 'f.pdf' },
        }).success,
      ).toBe(false);
    }
  });

  it('links[].url', () => {
    for (const url of dangerous) {
      expect(
        linksBlockSchema.safeParse({
          id: '1',
          type: 'links',
          data: { links: [{ label: 'L', url }] },
        }).success,
      ).toBe(false);
    }
  });

  it('references[].url (optional field, still validated when present)', () => {
    for (const url of dangerous) {
      expect(
        referencesBlockSchema.safeParse({
          id: '1',
          type: 'references',
          data: { citations: [{ label: 'C', url }] },
        }).success,
      ).toBe(false);
    }
    expect(
      referencesBlockSchema.safeParse({
        id: '1',
        type: 'references',
        data: { citations: [{ label: 'C' }] },
      }).success,
    ).toBe(true);
  });
});
