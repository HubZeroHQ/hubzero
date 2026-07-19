import Link from 'next/link';
import { Search } from 'lucide-react';
import { PUBLIC_SEARCH_GROUPS } from '@/config/public-site';
import { founderAccentStyle, getFounderIdentity } from '@/config/founder-identity';
import type { PublicSearchResult } from '@/lib/public/discovery/search';
import type { ImmutablePublic } from '@/lib/public/domain';
import { formatMetadata, formatPublicDate, PublicEmptyState } from '../EditorialPrimitives';
import { slugFromProfileUrl } from '../engineering/profile-url';
import { PageContainer, PublicSection } from '../PageContainer';

export function SearchPage({
  query,
  results,
  unavailable = false,
}: {
  query: string;
  results: readonly ImmutablePublic<PublicSearchResult>[];
  unavailable?: boolean;
}) {
  const groups = PUBLIC_SEARCH_GROUPS.map((group) => ({
    ...group,
    results: results.filter((result) => result.type === group.type),
  })).filter((group) => group.results.length);

  return (
    <main id="main-content" tabIndex={-1} className="collection-main search-main">
      <header className="search-hero">
        <PageContainer className="search-hero-grid">
          <div className="search-hero-copy">
            <p className="home-eyebrow">Search / public record</p>
            <h1>Find the work behind the words.</h1>
            <p>
              Search published products, case studies, investigations, writing, people, and the
              technologies or relationships that connect them.
            </p>
          </div>
          <form action="/search" role="search" className="search-form">
            <label htmlFor="public-search-page">Search HubZero</label>
            <div className="search-input-wrap">
              <Search aria-hidden="true" />
              <input
                id="public-search-page"
                name="q"
                type="search"
                defaultValue={query}
                maxLength={120}
                placeholder="Title, technology, reference, or topic"
                autoComplete="off"
                aria-describedby="search-page-hint"
              />
              <button type="submit">Search</button>
            </div>
            <p id="search-page-hint">
              Use a product name, technology, public reference, author, or related record.
            </p>
          </form>
        </PageContainer>
      </header>

      <PublicSection className="search-results" aria-labelledby="search-results-title">
        <PageContainer>
          <header className="search-results-header">
            <p className="home-eyebrow">Discovery / visibility-safe index</p>
            <div>
              <h2 id="search-results-title">
                {query ? `Results for “${query}”` : 'Search the publication'}
              </h2>
              {query && !unavailable ? (
                <p>
                  {results.length} published {results.length === 1 ? 'record' : 'records'} matched.
                </p>
              ) : null}
            </div>
          </header>

          {unavailable ? (
            <SearchState
              eyebrow="Search / temporarily unavailable"
              title="The public index could not be read."
              body="Try the search again. Published collection pages remain available from the navigation."
            />
          ) : !query ? (
            <SearchState
              eyebrow="Search / waiting for a query"
              title="Start with something specific."
              body="Titles, summaries, reference IDs, technologies, authors, current states, and explicit relationships all participate in ranking."
            />
          ) : !results.length ? (
            <SearchState
              eyebrow="Search / no published matches"
              title="No public record matches that query."
              body="Check the spelling, use fewer terms, or try a technology, title, or public reference ID. Draft and archived records never appear here."
            />
          ) : (
            <div className="search-groups">
              {groups.map((group) => (
                <section
                  key={group.type}
                  className="search-group"
                  aria-labelledby={`search-group-${group.type}`}
                >
                  <header>
                    <h3 id={`search-group-${group.type}`}>{group.label}</h3>
                    <span>{group.results.length.toString().padStart(2, '0')}</span>
                  </header>
                  <ol>
                    {group.results.map((result) => (
                      <li key={`${result.type}-${result.url}-${result.title}`}>
                        <SearchResultRow result={result} />
                      </li>
                    ))}
                  </ol>
                </section>
              ))}
            </div>
          )}
        </PageContainer>
      </PublicSection>
    </main>
  );
}

function SearchResultRow({ result }: { result: ImmutablePublic<PublicSearchResult> }) {
  const metadata = [
    result.referenceId,
    result.author?.name,
    result.state
      ? result.type === 'note'
        ? formatPublicDate(result.state)
        : formatMetadata(result.state)
      : undefined,
  ].filter(Boolean);
  const identity =
    result.type === 'engineeringProfile'
      ? getFounderIdentity(slugFromProfileUrl(result.url) ?? '')
      : undefined;

  return (
    <article className="search-result-row">
      <div className="search-result-index">
        <span>{metadata.join(' / ') || formatMetadata(result.type)}</span>
      </div>
      <div className="search-result-copy">
        <Link href={result.url} style={identity ? founderAccentStyle(identity.accent) : undefined}>
          <h4 className={identity ? 'founder-accent-text' : undefined}>{result.title}</h4>
          <span aria-hidden="true">→</span>
        </Link>
        <p>{result.summary}</p>
        {result.matchedTerms.length ? (
          <p className="search-match-context">
            Technology match: <strong>{result.matchedTerms.join(', ')}</strong>
          </p>
        ) : null}
        {result.matchedRelationships.length ? (
          <ul className="search-relationship-matches" aria-label="Matching relationships">
            {result.matchedRelationships.slice(0, 2).map((relationship) => (
              <li key={`${relationship.label}-${relationship.url}`}>
                <span>{relationship.label}</span>
                <Link href={relationship.url}>{relationship.title}</Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}

function SearchState({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <PublicEmptyState
      id="search-state-title"
      eyebrow={eyebrow}
      title={title}
      className="search-state"
    >
      {body}
    </PublicEmptyState>
  );
}
