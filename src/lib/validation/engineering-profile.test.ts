import { describe, expect, it } from 'vitest';
import { engineeringProfileSchema } from './engineering-profile';

const id = '507f1f77bcf86cd799439011';
const valid = {
  slug: 'aarav-menon',
  status: 'draft' as const,
  teamMemberId: id,
  overview: 'Systems-focused engineer.',
  engineeringPhilosophy: 'Make constraints visible.',
  currentExploration: 'Schema evolution.',
  areasOfExpertise: ['Content architecture'],
  currentInterests: ['Local-first'],
  engineeringIdentity: ['Evidence before claims'],
  technologyIds: [id],
  featuredWorkIds: [],
  featuredBuildIds: [],
  featuredBlueprintIds: [],
  featuredLabIds: [],
  featuredNoteIds: [],
  galleryImageIds: [],
};

describe('engineeringProfileSchema', () => {
  it('accepts the complete structured migration-friendly shape', () =>
    expect(engineeringProfileSchema.parse(valid)).toMatchObject(valid));
  it('requires a Team Member', () =>
    expect(() => engineeringProfileSchema.parse({ ...valid, teamMemberId: '' })).toThrow());
  it('rejects empty core thinking fields', () =>
    expect(() =>
      engineeringProfileSchema.parse({ ...valid, engineeringPhilosophy: '' }),
    ).toThrow());
});
