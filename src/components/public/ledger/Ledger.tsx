import { PUBLIC_ENTITY_ROUTES } from '@/config/public-site';
import type { ImmutablePublic } from '@/lib/public/domain';
import type { LedgerEntry } from '@/lib/public/ledger-projection';
import { groupLedgerByYear } from '@/lib/public/ledger-projection';
import { PublicEmptyState } from '../EditorialPrimitives';
import { EditorialCard } from '../homepage/EditorialCard';
import { PageContainer, PublicSection } from '../PageContainer';

/**
 * Ledger: the canonical reverse-chronological view of HubZero's published
 * activity. Deliberately built from two existing pieces rather than a new
 * timeline renderer: `EditorialCard`'s `'row'` layout (already the shared
 * "dated ledger entry" primitive Homepage's own Labs/Notes sections use)
 * and `groupLedgerByYear`'s pure grouping over data `buildLedger` already
 * sorted server-side. There is no client state here — grouping, sorting,
 * and rendering all happen once, on the server, before this ever reaches
 * the browser.
 *
 * Only Notes and Labs appear — see `ledger-projection.ts`'s
 * `resolveLedgerDate` for why every other entity type is excluded (no
 * trustworthy editorial date field today, not an oversight).
 */
export function Ledger({ entries }: { entries: readonly ImmutablePublic<LedgerEntry>[] }) {
  const years = groupLedgerByYear(entries);

  return (
    <main id="main-content" tabIndex={-1} className="collection-main ledger-main">
      <header className="collection-hero ledger-hero">
        <PageContainer className="collection-hero-grid">
          <div className="collection-hero-copy">
            <p className="home-eyebrow">Ledger / chronological record</p>
            <h1>Evidence of continuous engineering work.</h1>
            <p>
              Every published Note and Lab update, newest first — one truthful timeline, not an
              event log or a deployment history.
            </p>
          </div>
          <dl className="collection-register" aria-label="Ledger metadata">
            <div>
              <dt>Entries</dt>
              <dd>{entries.length}</dd>
            </div>
            <div>
              <dt>Years</dt>
              <dd>{years.length}</dd>
            </div>
          </dl>
        </PageContainer>
      </header>

      <PublicSection className="ledger-index" aria-labelledby="ledger-index-title">
        <PageContainer>
          <header className="collection-index-header ledger-index-header">
            <p className="home-eyebrow">Chronology / newest first</p>
            <h2 id="ledger-index-title">Published activity</h2>
          </header>

          {years.length ? (
            years.map((group) => (
              <section key={group.year} aria-labelledby={`ledger-year-${group.year}`}>
                <h3 id={`ledger-year-${group.year}`} className="home-subsection-title">
                  {group.year}
                </h3>
                <ol className="home-ledger">
                  {group.entries.map((entry) => (
                    <li key={entry.entity.url}>
                      <EditorialCard
                        feature={{ entity: entry.entity, relationships: [] }}
                        routeEnabled={PUBLIC_ENTITY_ROUTES[entry.entity.type]}
                        relationshipRoutes={PUBLIC_ENTITY_ROUTES}
                        layout="row"
                      />
                    </li>
                  ))}
                </ol>
              </section>
            ))
          ) : (
            <PublicEmptyState
              id="ledger-empty-title"
              eyebrow="Ledger / no eligible entries"
              title="The ledger begins with a published record."
              className="ledger-empty"
            >
              Entries appear here once a Note or Lab update is published — nothing is backfilled or
              estimated.
            </PublicEmptyState>
          )}
        </PageContainer>
      </PublicSection>
    </main>
  );
}
