import Link from 'next/link';
import { PUBLIC_ENTITY_ROUTES } from '@/config/public-site';
import type { ImmutablePublic, PublicEntityDetail, PublicRelationship } from '@/lib/public/domain';
import {
  formatPublicDate,
  PublicBreadcrumbs,
  RelationshipCard,
  TechnologyList,
} from '../EditorialPrimitives';
import { PageContainer, PublicSection } from '../PageContainer';
import { ProseRenderer } from '../ProseRenderer';
import { PublicImage } from '../PublicImage';

type Note = Extract<PublicEntityDetail, { type: 'note' }>;

const RELATIONSHIP_GROUPS = [
  { type: 'work', title: 'Related Work' },
  { type: 'build', title: 'Related Builds' },
  { type: 'lab', title: 'Related Labs' },
  { type: 'blueprint', title: 'Related Blueprints' },
] as const;

export function NoteDetail({ note }: { note: ImmutablePublic<Note> }) {
  const body = note.documents.find((document) => document.role === 'body');
  const groups = RELATIONSHIP_GROUPS.map((group) => ({
    ...group,
    relationships: note.relationships.filter(
      (relationship) => relationship.target.type === group.type,
    ),
  })).filter((group) => group.relationships.length);
  const authorDestinationAvailable =
    note.author.kind === 'person' &&
    note.author.profileAvailable &&
    PUBLIC_ENTITY_ROUTES.engineeringProfile;

  return (
    <article id="main-content" role="main" tabIndex={-1} className="collection-main note-detail">
      <header className="note-hero">
        <PageContainer>
          <PublicBreadcrumbs
            items={[
              { label: 'HubZero', href: '/' },
              { label: 'Notes', href: '/notes' },
              { label: note.title },
            ]}
          />
          <div className="note-hero-grid">
            <div className="note-title-block">
              <p className="home-eyebrow">Note / engineering record</p>
              <h1>{note.title}</h1>
              <p className="detail-summary">{note.summary}</p>
            </div>
            <aside className="note-register" aria-label={`${note.title} publication metadata`}>
              <dl>
                <div>
                  <dt>Published</dt>
                  <dd>
                    <time dateTime={note.publicationDate}>
                      {formatPublicDate(note.publicationDate)}
                    </time>
                  </dd>
                </div>
                <div>
                  <dt>Reading time</dt>
                  <dd>{note.readingTimeMinutes} min</dd>
                </div>
                <div>
                  <dt>Reference</dt>
                  <dd>{note.referenceId}</dd>
                </div>
                <div>
                  <dt>Author</dt>
                  <dd>{note.author.name}</dd>
                </div>
              </dl>
              <TechnologyList technologies={note.technologies} />
            </aside>
          </div>
        </PageContainer>
      </header>

      {note.hero ? (
        <PublicSection className="note-hero-media" aria-label="Lead media">
          <PageContainer>
            <PublicImage media={note.hero} priority />
          </PageContainer>
        </PublicSection>
      ) : null}

      {body ? (
        <PublicSection className="note-body" aria-labelledby="note-body-title">
          <PageContainer className="note-body-grid">
            <header>
              <p className="home-eyebrow">Journal entry / {note.referenceId}</p>
              <h2 id="note-body-title">Engineering note</h2>
              {body.outline?.length && body.outline.length > 1 ? (
                <nav className="detail-outline" aria-label="Note contents">
                  <ol>
                    {body.outline.map((item) => (
                      <li key={item.id}>
                        <a href={`#${item.id}`}>{item.text}</a>
                      </li>
                    ))}
                  </ol>
                </nav>
              ) : null}
            </header>
            <ProseRenderer document={body} headingOffset={1} as="div" />
          </PageContainer>
        </PublicSection>
      ) : null}

      {note.gallery.length ? (
        <PublicSection className="note-gallery" aria-labelledby="note-gallery-title">
          <PageContainer>
            <header className="detail-section-header">
              <p className="home-eyebrow">Supporting media / recorded evidence</p>
              <h2 id="note-gallery-title">Views from the work</h2>
            </header>
            <div className="detail-gallery-grid">
              {note.gallery.map((media) => (
                <PublicImage key={media.url} media={media} />
              ))}
            </div>
          </PageContainer>
        </PublicSection>
      ) : null}

      {groups.length ? (
        <PublicSection className="note-relations" aria-labelledby="note-relations-title">
          <PageContainer className="note-relations-grid">
            <header>
              <p className="home-eyebrow">Continuity / referenced engineering</p>
              <h2 id="note-relations-title">Continue through the record</h2>
              <p>These links are part of the evidence behind this note.</p>
            </header>
            <div className="detail-relation-groups">
              {groups.map((group) => (
                <RelationshipGroup
                  key={group.type}
                  title={group.title}
                  relationships={group.relationships}
                />
              ))}
            </div>
          </PageContainer>
        </PublicSection>
      ) : null}

      <footer className="note-author">
        <PageContainer className="note-author-grid">
          <div>
            <p className="home-eyebrow">Attribution / engineering profile</p>
            <h2>{note.author.name}</h2>
            <p>
              {note.author.kind === 'person'
                ? (note.author.role ?? 'HubZero engineering')
                : 'Published by the HubZero engineering team.'}
            </p>
          </div>
          <div className="note-author-actions">
            {authorDestinationAvailable ? (
              <Link href={note.author.url}>
                View engineering profile <span aria-hidden="true">→</span>
              </Link>
            ) : null}
            <Link href="/notes">
              Return to Notes <span aria-hidden="true">→</span>
            </Link>
          </div>
        </PageContainer>
      </footer>
    </article>
  );
}

function RelationshipGroup({
  title,
  relationships,
}: {
  title: string;
  relationships: readonly ImmutablePublic<PublicRelationship>[];
}) {
  return (
    <section className="detail-relation-group">
      <h3>{title}</h3>
      <div className="home-relationships" aria-label={title}>
        {relationships.map((relationship) => (
          <RelationshipCard
            key={`${relationship.kind}-${relationship.target.url}`}
            relationship={relationship}
            enabled={PUBLIC_ENTITY_ROUTES[relationship.target.type]}
          />
        ))}
      </div>
    </section>
  );
}
