import Link from 'next/link';
import type { ReactNode } from 'react';
import type {
  ImmutablePublic,
  PublicEntitySummary,
  PublicRelationship,
  PublicTaxonomyTerm,
} from '@/lib/public/domain';
import { cn } from '@/lib/utils/cn';

export function SectionHeader({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  className?: string;
}) {
  return (
    <header className={cn('home-section-header', className)}>
      <p className="home-eyebrow">{eyebrow}</p>
      <div>
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
    </header>
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
        <li key={`${technology.kind}-${technology.slug}`}>{technology.label}</li>
      ))}
    </ul>
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
  const content = (
    <>
      <span>{relationship.label}</span>
      <strong>{relationship.target.title}</strong>
      {enabled ? <span aria-hidden="true">→</span> : null}
    </>
  );
  return enabled ? (
    <Link href={relationship.target.url} className="home-relationship-card">
      {content}
    </Link>
  ) : (
    <div className="home-relationship-card">{content}</div>
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
