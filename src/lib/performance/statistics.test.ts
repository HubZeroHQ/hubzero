import { describe, expect, it } from 'vitest';
import { distribution } from './statistics';

describe('performance statistics', () => {
  it('reports nearest-rank percentiles from unsorted samples', () => {
    expect(distribution([50.04, 10.02, 40.03, 20.01, 30.05])).toEqual({
      min: 10,
      p50: 30.1,
      p75: 40,
      p95: 50,
      max: 50,
    });
  });

  it('keeps a single sample as every percentile', () => {
    expect(distribution([13])).toEqual({ min: 13, p50: 13, p75: 13, p95: 13, max: 13 });
  });

  it('rejects an empty distribution instead of reporting invented zeroes', () => {
    expect(() => distribution([])).toThrow('requires at least one sample');
  });
});
