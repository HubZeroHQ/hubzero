import { describe, expect, it } from 'vitest';
import { formatBytes } from './format-bytes';

describe('formatBytes', () => {
  it('formats zero and negative sizes as "0 B"', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(-5)).toBe('0 B');
  });

  it('keeps whole bytes unitless-decimal', () => {
    expect(formatBytes(512)).toBe('512 B');
  });

  it('formats kilobytes and megabytes with one decimal place', () => {
    expect(formatBytes(2048)).toBe('2.0 KB');
    expect(formatBytes(2_400_000)).toBe('2.3 MB');
  });

  it('formats gigabytes', () => {
    expect(formatBytes(1_500_000_000)).toBe('1.4 GB');
  });
});
