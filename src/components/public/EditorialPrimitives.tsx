import Link from 'next/link';
import type { ReactNode } from 'react';
import { founderAccentStyle, getFounderIdentity } from '@/config/founder-identity';
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
  if (entity.state && entity.type !== 'blueprint') values.push(entity.state);

  return (
    <dl className="home-metadata" aria-label={`${entity.title} metadata`}>
      {values.map((value, index) => (
        <div key={`${value}-${index}`}>
          <dt className="sr-only">Metadata</dt>
          <dd>{entity.type === 'blueprint' && index > 0 ? value : formatMetadata(value)}</dd>
        </div>
      ))}
    </dl>
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
          const profileHref =
            contributor.target.type === 'engineeringProfile'
              ? contributor.target.url
              : contributor.target.profileUrl;
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
  const content = (
    <>
      <span>{relationship.label}</span>
      <strong className={identity ? 'founder-accent-text' : undefined}>
        {relationship.target.title}
      </strong>
      {enabled ? <span aria-hidden="true">→</span> : null}
    </>
  );
  const style = identity ? founderAccentStyle(identity.accent) : undefined;
  return enabled ? (
    <Link href={relationship.target.url} className="home-relationship-card" style={style}>
      {content}
    </Link>
  ) : (
    <div className="home-relationship-card" style={style}>
      {content}
    </div>
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
