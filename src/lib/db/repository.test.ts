import { z } from 'zod';
import { describe, expect, it } from 'vitest';
import { parsePartialInput } from './repository';

const schema = z.object({
  title: z.string().min(1),
  technologyIds: z.array(z.string()).default([]),
  publicProfile: z.boolean().default(false),
});

describe('parsePartialInput', () => {
  it('omits fields not present in the input, even when the schema defines a default for them', () => {
    // Regression test: workRepository.update(id, { status: 'inReview' }) was
    // silently resetting technologyIds (and every other `.default([])`
    // field) to [] because `schema.partial().parse(input)` substitutes the
    // default for any omitted field, and that substituted value is
    // indistinguishable from a real one once parsing finishes.
    const result = parsePartialInput(schema, { title: 'Updated title' });
    expect(result).toEqual({ title: 'Updated title' });
    expect('technologyIds' in result).toBe(false);
    expect('publicProfile' in result).toBe(false);
  });

  it('still includes a default-bearing field when the caller explicitly provides it', () => {
    const result = parsePartialInput(schema, { technologyIds: ['tech-1'] });
    expect(result).toEqual({ technologyIds: ['tech-1'] });
  });

  it('still includes a default-bearing field when the caller explicitly clears it', () => {
    const result = parsePartialInput(schema, { technologyIds: [] });
    expect(result).toEqual({ technologyIds: [] });
  });

  it('passes through fields with no default unaffected', () => {
    const result = parsePartialInput(schema, { title: 'Only title' });
    expect(result).toEqual({ title: 'Only title' });
  });
});
