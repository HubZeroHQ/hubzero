import { describe, expect, it } from 'vitest';
import {
  describeContactSource,
  isLikelyAutomated,
  normalizeContactSource,
  publicContactSchema,
} from './contact';

describe('public Contact boundary', () => {
  it('accepts only named or canonical public source paths', () => {
    expect(normalizeContactSource('/work/public-case-study')).toBe('/work/public-case-study');
    expect(normalizeContactSource('services')).toBe('services');
    expect(normalizeContactSource('/studio/leads')).toBe('direct');
    expect(normalizeContactSource('https://example.com')).toBe('direct');
    expect(describeContactSource('/labs/cache-study')).toBe('Labs / cache study');
  });

  it('validates the three required public fields and their size limits', () => {
    expect(
      publicContactSchema.safeParse({
        name: 'Ari',
        email: 'ari@example.com',
        message: 'A real constraint.',
      }).success,
    ).toBe(true);
    expect(publicContactSchema.safeParse({ name: '', email: 'wrong', message: '' }).success).toBe(
      false,
    );
    expect(
      publicContactSchema.safeParse({
        name: 'Ari',
        email: 'ari@example.com',
        message: 'x'.repeat(5_001),
      }).success,
    ).toBe(false);
  });

  it('detects the honeypot and implausibly fast submissions', () => {
    const now = 10_000;
    expect(isLikelyAutomated({ website: 'spam.example', startedAt: 1_000, now })).toBe(true);
    expect(isLikelyAutomated({ website: '', startedAt: 9_000, now })).toBe(true);
    expect(isLikelyAutomated({ website: '', startedAt: 1_000, now })).toBe(false);
  });
});
