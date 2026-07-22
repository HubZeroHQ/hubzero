import Link from 'next/link';
import type { ImmutablePublic, PublicHomepageFeature } from '@/lib/public/domain';
import { PublicImage } from '../PublicImage';
import {
  MetadataRow,
  PublicationMetadata,
  RelationshipCard,
  TechnologyList,
  relationshipKey,
} from '../EditorialPrimitives';

export function EditorialCard({
  feature,
  routeEnabled,
  relationshipRoutes,
  prominent = false,
  priority = false,
  layout = 'card',
}: {
  feature: ImmutablePublic<PublicHomepageFeature>;
  routeEnabled: boolean;
  relationshipRoutes: Readonly<Record<string, boolean>>;
  prominent?: boolean;
  priority?: boolean;
  /**
   * 'row' is the same primitive rendered as a compact, dated ledger entry
   * instead of a boxed card — used where a section wants to read as a
   * chronological record (current Labs/Notes) rather than a shelf of
   * products, without introducing a second card component to keep in sync.
   */
  layout?: 'card' | 'row';
}) {
  const { entity, relationships } = feature;
  const heading = <h3>{entity.title}</h3>;
  const cardClassName = prominent
    ? `home-card home-card-prominent ${entity.hero ? 'home-card-with-media' : 'home-card-editorial'}`
    : 'home-card';

  if (layout === 'row') {
    return (
      <article className="home-ledger-row">
        <div className="home-ledger-heading">
          <MetadataRow entity={entity} />
          {routeEnabled ? (
            <Link href={entity.url} className="home-ledger-title">
              {heading}
              <span aria-hidden="true">→</span>
            </Link>
          ) : (
            <div className="home-ledger-title">{heading}</div>
          )}
        </div>
        <p className="home-ledger-summary">{entity.summary}</p>
        <PublicationMetadata entity={entity} />
        <TechnologyList technologies={entity.technologies} />
        {relationships.length ? (
          <div className="home-relationships" aria-label="Connected evidence">
            {relationships.map((relationship) => (
              <RelationshipCard
                key={relationshipKey(relationship)}
                relationship={relationship}
                enabled={Boolean(relationshipRoutes[relationship.target.type])}
              />
            ))}
          </div>
        ) : null}
      </article>
    );
  }

  return (
    <article className={cardClassName}>
      {entity.hero ? (
        <div className="home-card-media">
          <PublicImage media={entity.hero} priority={priority} />
        </div>
      ) : null}
      <div className="home-card-body">
        <MetadataRow entity={entity} />
        {routeEnabled ? (
          <Link href={entity.url} className="home-card-title">
            {heading}
            <span aria-hidden="true">↗</span>
          </Link>
        ) : (
          <div className="home-card-title">{heading}</div>
        )}
        <p className="home-card-summary">{entity.summary}</p>
        <PublicationMetadata entity={entity} />
        <TechnologyList technologies={entity.technologies} />
        {relationships.length ? (
          entity.type === 'engineeringProfile' ? (
            <ProfileContributions
              relationships={relationships}
              relationshipRoutes={relationshipRoutes}
            />
          ) : (
            <div className="home-relationships" aria-label="Connected evidence">
              {relationships.map((relationship) => (
                <RelationshipCard
                  key={relationshipKey(relationship)}
                  relationship={relationship}
                  enabled={Boolean(relationshipRoutes[relationship.target.type])}
                />
              ))}
            </div>
          )
        ) : null}
      </div>
    </article>
  );
}

function ProfileContributions({
  relationships,
  relationshipRoutes,
}: {
  relationships: readonly ImmutablePublic<PublicHomepageFeature>['relationships'][number][];
  relationshipRoutes: Readonly<Record<string, boolean>>;
}) {
  const contributions = relationships.filter(
    (relationship) => relationship.kind === 'teamContributedToEntry',
  );
  const visible = contributions.slice(0, 3);
  const remaining = contributions.length - visible.length;

  return (
    <div className="home-relationships" aria-label="Public contributions">
      {visible.map((relationship) => (
        <RelationshipCard
          key={relationshipKey(relationship)}
          relationship={relationship}
          enabled={Boolean(relationshipRoutes[relationship.target.type])}
        />
      ))}
      {remaining > 0 ? (
        <div className="home-relationship-card home-relationship-summary">
          +{remaining} more contribution{remaining === 1 ? '' : 's'}
        </div>
      ) : null}
    </div>
  );
}
