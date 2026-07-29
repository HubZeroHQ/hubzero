import { describe, expect, it } from 'vitest';
import { buildSchema } from './build';

const valid = {
  title: 'QueryCraft',
  summary: 'A query authoring product built for internal analytics teams.',
  slug: 'querycraft',
  status: 'published' as const,
  deploymentState: 'live' as const,
  technologyIds: [],
  relatedWorkIds: [],
  galleryImageIds: [],
  featured: true,
  contributors: [],
};

describe('buildSchema', () => {
  it('accepts a complete published Build with a public summary', () =>
    expect(buildSchema.parse(valid)).toMatchObject(valid));

  it('rejects a published Build with no summary — the field the public repository depends on', () =>
    expect(() => buildSchema.parse({ ...valid, summary: undefined })).toThrow());

  it('rejects a published Build with an empty/whitespace-only summary', () =>
    expect(() => buildSchema.parse({ ...valid, summary: '   ' })).toThrow());
});
