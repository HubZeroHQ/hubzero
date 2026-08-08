import { describe, expect, it } from 'vitest';
import { activityQueryString, hasActiveFilters, parseActivityFilters } from './filters';

describe('parseActivityFilters', () => {
  it('returns no filters for an empty query string', () => {
    expect(parseActivityFilters({})).toEqual({});
    expect(hasActiveFilters(parseActivityFilters({}))).toBe(false);
  });

  it('accepts repeated params and the comma form for the same filter', () => {
    expect(parseActivityFilters({ collection: ['work', 'note'] }).entityTypes).toEqual([
      'work',
      'note',
    ]);
    expect(parseActivityFilters({ collection: 'work,note' }).entityTypes).toEqual(['work', 'note']);
  });

  /**
   * A typo must widen the feed, not empty it — an unrecognised value silently
   * matching nothing would read as "no activity" rather than "bad URL".
   */
  it('drops unrecognised collections and event types', () => {
    expect(parseActivityFilters({ collection: 'work,nonsense' }).entityTypes).toEqual(['work']);
    expect(parseActivityFilters({ collection: 'nonsense' }).entityTypes).toBeUndefined();
    expect(parseActivityFilters({ type: 'entry.created,entry.exploded' }).types).toEqual([
      'entry.created',
    ]);
    expect(parseActivityFilters({ type: 'entry.exploded' }).types).toBeUndefined();
    expect(parseActivityFilters({ type: 'entry.mediaChanged' }).types).toBeUndefined();
  });

  it('parses a date range with an inclusive upper bound', () => {
    const filters = parseActivityFilters({ from: '2026-08-01', to: '2026-08-03' });
    expect(filters.from?.getHours()).toBe(0);
    expect(filters.from?.getDate()).toBe(1);
    // Through the end of the 3rd: midnight would exclude everything that day.
    expect(filters.to?.getDate()).toBe(3);
    expect(filters.to?.getHours()).toBe(23);
    expect(filters.to?.getMinutes()).toBe(59);
  });

  it('ignores malformed dates rather than throwing', () => {
    expect(parseActivityFilters({ from: 'yesterday', to: '2026-13-45' })).toEqual({});
  });

  it('trims the search query and drops it when empty', () => {
    expect(parseActivityFilters({ q: '  HZ-BP-701 ' }).q).toBe('HZ-BP-701');
    expect(parseActivityFilters({ q: '   ' }).q).toBeUndefined();
  });

  it('reports active filters for every filter kind', () => {
    expect(hasActiveFilters(parseActivityFilters({ collection: 'work' }))).toBe(true);
    expect(hasActiveFilters(parseActivityFilters({ type: 'entry.created' }))).toBe(true);
    expect(hasActiveFilters(parseActivityFilters({ actor: 'abc' }))).toBe(true);
    expect(hasActiveFilters(parseActivityFilters({ from: '2026-08-01' }))).toBe(true);
    expect(hasActiveFilters(parseActivityFilters({ q: 'x' }))).toBe(true);
  });
});

describe('activityQueryString', () => {
  it('omits empty values and expands repeated ones', () => {
    expect(activityQueryString({ q: 'note', collection: ['work', 'note'], actor: '' })).toBe(
      '?q=note&collection=work&collection=note',
    );
    expect(activityQueryString({})).toBe('');
  });
});
