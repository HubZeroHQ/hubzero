import Link from 'next/link';
import { PUBLIC_ENTITY_ROUTES } from '@/config/public-site';
import { founderAccentStyle, getFounderIdentity } from '@/config/founder-identity';
import type { ImmutablePublic, PublicEntityDetail } from '@/lib/public/domain';
import { publicRoute } from '@/lib/public/routes';
import { DetailGallery } from '../DetailGallery';
import {
  ContributorList,
  DetailSectionHeading,
  formatPublicDate,
  PublicBreadcrumbs,
  TechnologyList,
} from '../EditorialPrimitives';
import { FounderCrossLink } from '../engineering/FounderCrossLink';
import { slugFromProfileUrl } from '../engineering/profile-url';
import { PageContainer, PublicSection } from '../PageContainer';
import { ProseRenderer } from '../ProseRenderer';
import { PublicImage } from '../PublicImage';
import { RelatedRecordsSection } from '../RelatedRecordsSection';

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
  const contributors = note.relationships.filter(
    (relationship) => relationship.kind === 'teamContributedToEntry',
  );
  const authorDestinationAvailable =
    note.author.kind === 'person' &&
    note.author.profileAvailable &&
    PUBLIC_ENTITY_ROUTES.engineeringProfile;
  const authorIdentity =
    note.author.kind === 'person' && authorDestinationAvailable
      ? getFounderIdentity(slugFromProfileUrl(note.author.url) ?? '')
      : undefined;

  return (
    <article id="main-content" role="main" tabIndex={-1} className="collection-main note-detail">
      <header className="note-hero">
        <PageContainer>
          <PublicBreadcrumbs
            items={[
              { label: 'HubZero', href: publicRoute.home() },
              { label: 'Notes', href: publicRoute.collection('note') },
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
              <ContributorList contributors={contributors} />
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
            <DetailSectionHeading
              id="note-body-title"
              eyebrow={`Journal entry / ${note.referenceId}`}
              title="Engineering note"
            >
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
            </DetailSectionHeading>
            <ProseRenderer document={body} headingOffset={1} as="div" />
          </PageContainer>
        </PublicSection>
      ) : null}

      <DetailGallery
        id="note-gallery-title"
        eyebrow="Supporting media / recorded evidence"
        title="Views from the work"
        media={note.gallery}
        sectionClassName="note-gallery"
      />

      {groups.length ? (
        <RelatedRecordsSection
          id="note-relations-title"
          eyebrow="Continuity / referenced engineering"
          title="Continue through the record"
          description="These links are part of the evidence behind this note."
          groups={groups}
          sectionClassName="note-relations"
          containerClassName="note-relations-grid"
        />
      ) : null}

      <footer
        className="note-author"
        style={authorIdentity ? founderAccentStyle(authorIdentity.accent) : undefined}
      >
        <PageContainer className="note-author-grid">
          <div>
            <p className="home-eyebrow">Attribution / engineering profile</p>
            <h2 className={authorIdentity ? 'founder-accent-text' : undefined}>
              {note.author.name}
            </h2>
            <p>
              {note.author.kind === 'person'
                ? (note.author.role ?? 'HubZero engineering')
                : 'Published by the HubZero engineering team.'}
            </p>
          </div>
          <div className="note-author-actions">
            {authorDestinationAvailable && note.author.kind === 'person' ? (
              <FounderCrossLink href={note.author.url} technologies={note.author.technologies}>
                View engineering profile <span aria-hidden="true">→</span>
              </FounderCrossLink>
            ) : null}
            <Link href={publicRoute.collection('note')}>
              Return to Notes <span aria-hidden="true">→</span>
            </Link>
          </div>
        </PageContainer>
      </footer>
    </article>
  );
}
