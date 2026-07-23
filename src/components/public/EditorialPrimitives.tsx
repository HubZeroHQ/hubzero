import Link from 'next/link';
import type { ReactNode } from 'react';
import { PUBLIC_ENTITY_ROUTES } from '@/config/public-site';
import { founderAccentStyle, getFounderIdentity } from '@/config/founder-identity';
import {
  getPublicBuildStatePresentation,
  type PublicBuildState,
} from '@/lib/public/build-presentation';
import type {
  ImmutablePublic,
  PublicEntitySummary,
  PublicRelationship,
  PublicTaxonomyTerm,
} from '@/lib/public/domain';
import { publicRoute } from '@/lib/public/routes';
import { cn } from '@/lib/utils/cn';
import { slugFromProfileUrl } from './engineering/profile-url';

/**
 * `target.url` is not a unique per-target identifier: every teamMember
 * target shares the literal '/about' url (see `PublicEntityLink.url` doc
 * comment), since that link intentionally doesn't vary by person. `target.referenceId`
 * (e.g. `HZ-TM-001`) is the stable per-entity identifier assigned at the data
 * layer, so it — not the url — is what makes a relationship key unique.
 */
export function relationshipKey(relationship: ImmutablePublic<PublicRelationship>): string {
  return `${relationship.kind}-${relationship.target.referenceId ?? relationship.target.url}`;
}

/**
 * The canonical destination for a relationship target. A teamMember link's
 * `url` is always the literal '/about' (it doesn't vary by person — see
 * `PublicEntityLink.profileUrl` doc comment), so a contributor only gets a
 * destination when they currently have a public Engineering Profile;
 * otherwise there is no canonical page to send them to and the caller should
 * render static text instead of a link to the About index. Every other
 * target type's `url` is already its own canonical page.
 */
export function relationshipHref(
  relationship: ImmutablePublic<PublicRelationship>,
): string | undefined {
  return relationship.target.type === 'teamMember'
    ? relationship.target.profileUrl
    : relationship.target.url;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  className?: string;
}) {
  return (
    <header className={cn('home-section-header', className)}>
      {eyebrow ? <p className="home-eyebrow">{eyebrow}</p> : null}
      <div>
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
    </header>
  );
}

/**
 * The eyebrow/heading/description shell repeated across every detail-page
 * sub-section (documents, galleries, relationship groups, profile
 * chapters) — distinct from `SectionHeader` above, which drives the
 * homepage's more spacious rhythm (`home-section-header`).
 *
 * `className` is intentionally omitted rather than hardcoded to
 * `detail-section-header`: some call sites (a Blueprint's specification, a
 * gallery) already carried that class and its `gap`/`margin-bottom`
 * spacing; others (a relationship section, a document body, a profile
 * chapter) were always a bare `<header>`, with spacing owned entirely by
 * the surrounding `*-grid` container's own `gap`. Defaulting to
 * `detail-section-header` here would have added real, unwanted spacing to
 * the second group — pass it explicitly only where the original markup
 * had it.
 */
export function DetailSectionHeading({
  id,
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  id: string;
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <header className={className}>
      <p className="home-eyebrow">{eyebrow}</p>
      <h2 id={id}>{title}</h2>
      {description ? <p>{description}</p> : null}
      {children}
    </header>
  );
}

export function PublicBreadcrumbs({
  items,
}: {
  items: readonly { label: string; href?: string }[];
}) {
  return (
    <nav className="detail-breadcrumbs" aria-label="Breadcrumb">
      <ol>
        {items.map((item, index) => {
          const current = index === items.length - 1;
          return (
            <li
              key={`${item.href ?? 'current'}-${item.label}`}
              aria-current={current ? 'page' : undefined}
            >
              {!current && item.href ? <Link href={item.href}>{item.label}</Link> : item.label}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function PublicEmptyState({
  id,
  eyebrow,
  title,
  children,
  className,
}: {
  id: string;
  eyebrow: string;
  title: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('collection-empty', className)} aria-labelledby={id}>
      <p className="home-eyebrow">{eyebrow}</p>
      <h3 id={id}>{title}</h3>
      <p>{children}</p>
    </section>
  );
}

export function MetadataRow({ entity }: { entity: ImmutablePublic<PublicEntitySummary> }) {
  const values: string[] = [];
  if (entity.referenceId) values.push(entity.referenceId);
  if (entity.type === 'work') values.push(entity.clientType, entity.timeline);
  if (entity.type === 'blueprint') {
    values.push(entity.architecture, entity.designLanguage, `v${entity.version}`);
  }
  if (entity.type === 'engineeringProfile') values.push(entity.role);
  if (entity.state && entity.type !== 'blueprint' && entity.type !== 'build') {
    values.push(entity.state);
  }

  return (
    <dl className="home-metadata" aria-label={`${entity.title} metadata`}>
      {values.map((value, index) => (
        <div key={`${value}-${index}`}>
          <dt className="sr-only">Metadata</dt>
          <dd>{entity.type === 'blueprint' && index > 0 ? value : formatMetadata(value)}</dd>
        </div>
      ))}
      {entity.type === 'build' ? (
        <div>
          <dt className="sr-only">Maintenance status</dt>
          <dd>
            <PublicBuildStateBadge state={entity.deploymentState} />
          </dd>
        </div>
      ) : null}
    </dl>
  );
}

export function PublicBuildStateBadge({ state }: { state: PublicBuildState | string }) {
  const presentation = getPublicBuildStatePresentation(state);
  if (!presentation) return null;

  return (
    <span
      className="public-build-state"
      data-tone={presentation.tone}
      title={presentation.description}
    >
      {presentation.label}
    </span>
  );
}

export function TechnologyList({
  technologies,
  label = 'Technologies',
}: {
  technologies: readonly ImmutablePublic<PublicTaxonomyTerm>[];
  label?: string;
}) {
  if (!technologies.length) return null;
  return (
    <ul className="home-technologies" aria-label={label}>
      {technologies.slice(0, 8).map((technology) => (
        <li key={`${technology.kind}-${technology.slug}`}>
          <Link href={publicRoute.taxonomy(technology)}>{technology.label}</Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * Publication metadata, not a blog "Author" card — deliberately compact and
 * placed in the register alongside Reference/Timeline/Role/Technologies,
 * never inside the generated document body. Order follows Studio's own
 * `contributors` array order (never re-sorted alphabetically here).
 *
 * Every contributor is a Team member (§3 of the personnel model) — whether
 * they link to an Engineering Profile depends only on whether that person
 * currently has one, resolved via `target.profileUrl`. It is never a
 * different kind of contributor, just a person who does or doesn't
 * currently have a profile to link to.
 */
export function ContributorList({
  contributors,
}: {
  contributors: readonly ImmutablePublic<PublicRelationship>[];
}) {
  if (!contributors.length) return null;
  return (
    <div className="detail-register-contributors">
      <p className="home-eyebrow">Contributors</p>
      <ul aria-label="Contributors">
        {contributors.map((contributor) => {
          const profileHref = relationshipHref(contributor);
          return (
            <li key={relationshipKey(contributor)}>
              {profileHref ? (
                <Link
                  href={profileHref}
                  aria-label={
                    contributor.target.role
                      ? `${contributor.target.title}, ${contributor.target.role} — Engineering Profile`
                      : `${contributor.target.title} — Engineering Profile`
                  }
                >
                  <span aria-hidden="true">
                    <span className="contributor-name">{contributor.target.title}</span>
                    {contributor.target.role ? (
                      <span className="contributor-role">{contributor.target.role}</span>
                    ) : null}
                    <span className="contributor-link">
                      Engineering Profile <span aria-hidden="true">→</span>
                    </span>
                  </span>
                </Link>
              ) : (
                <div className="contributor-static">
                  <span className="contributor-name">{contributor.target.title}</span>
                  {contributor.target.role ? (
                    <span className="contributor-role">{contributor.target.role}</span>
                  ) : null}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function PublicationMetadata({ entity }: { entity: ImmutablePublic<PublicEntitySummary> }) {
  if (entity.type === 'note') {
    return (
      <p className="home-publication-meta">
        <span>{entity.author.name}</span>
        <time dateTime={entity.publicationDate}>{formatPublicDate(entity.publicationDate)}</time>
      </p>
    );
  }
  if (entity.type === 'lab') {
    return (
      <p className="home-publication-meta">
        <span>{formatMetadata(entity.stage)}</span>
        {entity.lastMajorUpdate ? (
          <span>
            Updated{' '}
            <time dateTime={entity.lastMajorUpdate}>
              {formatPublicDate(entity.lastMajorUpdate)}
            </time>
          </span>
        ) : null}
      </p>
    );
  }
  return null;
}

export function RelationshipCard({
  relationship,
  enabled,
}: {
  relationship: ImmutablePublic<PublicRelationship>;
  enabled: boolean;
}) {
  const identity =
    relationship.target.type === 'engineeringProfile'
      ? getFounderIdentity(slugFromProfileUrl(relationship.target.url) ?? '')
      : undefined;
  const href = relationshipHref(relationship);
  const linked = enabled && Boolean(href);
  const content = (
    <>
      <span className="home-relationship-label">{relationship.label}</span>
      <strong className={`home-relationship-title${identity ? 'founder-accent-text' : ''}`}>
        {relationship.target.title}
      </strong>
      <span className="home-relationship-status">
        {relationship.target.type === 'build' && relationship.target.state ? (
          <PublicBuildStateBadge state={relationship.target.state} />
        ) : null}
      </span>
      {linked ? <span aria-hidden="true">→</span> : null}
    </>
  );
  const style = identity ? founderAccentStyle(identity.accent) : undefined;
  return enabled && href ? (
    <Link href={href} className="home-relationship-card" style={style}>
      {content}
    </Link>
  ) : (
    <div className="home-relationship-card" style={style}>
      {content}
    </div>
  );
}

/**
 * A titled group of `RelationshipCard`s — the shared shape behind every
 * "Related Work" / "Related Builds" / "Authored Notes" style block on the
 * public site (collection detail pages, Notes, Engineering Profiles).
 * Previously reimplemented identically in three separate files; this is
 * now the one canonical definition. See `RelatedRecordsSection`, which
 * composes this into a full page section.
 */
export function RelationshipGroup({
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
            key={relationshipKey(relationship)}
            relationship={relationship}
            enabled={PUBLIC_ENTITY_ROUTES[relationship.target.type]}
          />
        ))}
      </div>
    </section>
  );
}

export function formatMetadata(value: string): string {
  return value.replace(/([a-z])([A-Z])/g, '$1 $2');
}

export function formatPublicDate(value: string): string {
  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(value));
}
