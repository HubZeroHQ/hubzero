import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { PublicSearchResult } from '@/lib/public/discovery/search';
import { SearchPage } from './SearchPage';

const result: PublicSearchResult = {
  type: 'build',
  title: 'Release Ledger',
  url: '/builds/release-ledger',
  summary: 'A bounded release record.',
  referenceId: 'HZ-BL-101',
  taxonomy: ['TypeScript'],
  state: 'live',
  relationships: [],
  matchedTerms: ['TypeScript'],
  matchedRelationships: [],
};

describe('public search page', () => {
  it('renders a distinct empty-query state and an accessible search input', () => {
    const markup = renderToStaticMarkup(createElement(SearchPage, { query: '', results: [] }));
    expect(markup).toContain('role="search"');
    expect(markup).toContain('Start with something specific.');
    expect(markup).toContain('name="q"');
  });

  it('groups results by public content type and presents match context', () => {
    const markup = renderToStaticMarkup(
      createElement(SearchPage, { query: 'typescript', results: [result] }),
    );
    expect(markup).toContain('id="search-group-build"');
    expect(markup).toContain('Release Ledger');
    expect(markup).toContain('Technology match:');
    expect(markup).toContain('TypeScript');
    expect(markup).toContain('class="search-result-row public-connected-row"');
    expect(markup).toContain('class="search-result-primary"');
  });

  it('shows the shared retired treatment for historical Build results', () => {
    const markup = renderToStaticMarkup(
      createElement(SearchPage, {
        query: 'release',
        results: [{ ...result, state: 'retired' }],
      }),
    );

    expect(markup).toContain('data-tone="historical"');
    expect(markup).toContain('Retired');
  });

  it('keeps no-results and unavailable states explicit', () => {
    expect(
      renderToStaticMarkup(createElement(SearchPage, { query: 'missing', results: [] })),
    ).toContain('No public record matches that query.');
    expect(
      renderToStaticMarkup(
        createElement(SearchPage, { query: 'missing', results: [], unavailable: true }),
      ),
    ).toContain('The public index could not be read.');
  });
});
