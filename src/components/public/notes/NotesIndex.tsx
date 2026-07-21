import Link from 'next/link';
import { PUBLIC_ENTITY_ROUTES } from '@/config/public-site';
import type { ImmutablePublic, PublicNoteIndexEntry } from '@/lib/public/domain';
import {
  formatPublicDate,
  PublicEmptyState,
  relationshipKey,
  TechnologyList,
} from '../EditorialPrimitives';
import { PageContainer, PublicSection } from '../PageContainer';

export function NotesIndex({
  entries,
}: {
  entries: readonly ImmutablePublic<PublicNoteIndexEntry>[];
}) {
  const technologyCount = new Set(
    entries.flatMap(({ note }) => note.technologies.map((technology) => technology.slug)),
  ).size;

  return (
    <main id="main-content" tabIndex={-1} className="collection-main notes-main">
      <header className="collection-hero notes-hero">
        <PageContainer className="collection-hero-grid">
          <div className="collection-hero-copy">
            <p className="home-eyebrow">Notes / engineering journal</p>
            <h1>Small records of consequential decisions.</h1>
            <p>
              Observations, implementation details, experiments, and lessons recorded close to the
              work that produced them.
            </p>
          </div>
          <dl className="collection-register" aria-label="Notes collection metadata">
            <div>
              <dt>Format</dt>
              <dd>Short-form engineering writing</dd>
            </div>
            <div>
              <dt>Published</dt>
              <dd>{entries.length}</dd>
            </div>
            <div>
              <dt>Technologies</dt>
              <dd>{technologyCount}</dd>
            </div>
          </dl>
        </PageContainer>
      </header>

      <PublicSection className="notes-index" aria-labelledby="notes-index-title">
        <PageContainer>
          <header className="collection-index-header notes-index-header">
            <p className="home-eyebrow">Chronology / newest first</p>
            <h2 id="notes-index-title">Published notes</h2>
            {entries.length ? <p>A continuous record, ordered by publication date.</p> : null}
          </header>

          {entries.length ? (
            <ol className="notes-ledger">
              {entries.map(({ note, relationships }) => (
                <li key={note.url}>
                  <time dateTime={note.publicationDate}>
                    {formatPublicDate(note.publicationDate)}
                  </time>
                  <article>
                    <div className="notes-ledger-heading">
                      <p className="home-eyebrow">
                        {note.referenceId} / {note.author.name}
                      </p>
                      <Link href={note.url}>
                        <h3>{note.title}</h3>
                        <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                    <p>{note.summary}</p>
                    <TechnologyList technologies={note.technologies} />
                    {relationships.length ? (
                      <nav
                        aria-label={`${note.title} relationships`}
                        className="notes-ledger-relations"
                      >
                        <span>Discusses</span>
                        <ul>
                          {relationships.map((relationship) => (
                            <li key={relationshipKey(relationship)}>
                              {PUBLIC_ENTITY_ROUTES[relationship.target.type] ? (
                                <Link href={relationship.target.url}>
                                  {relationship.target.title}
                                </Link>
                              ) : (
                                <span>{relationship.target.title}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </nav>
                    ) : null}
                  </article>
                </li>
              ))}
            </ol>
          ) : (
            <PublicEmptyState
              id="notes-empty-title"
              eyebrow="Journal / no eligible entries"
              title="The journal begins with a useful record."
              className="notes-empty"
            >
              Notes will appear here when a published entry contains a specific question or claim,
              substantive reasoning, accountable authorship, and the references its conclusions
              require.
            </PublicEmptyState>
          )}
        </PageContainer>
      </PublicSection>
    </main>
  );
}
