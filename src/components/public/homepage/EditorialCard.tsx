import Link from 'next/link';
import type { ImmutablePublic, PublicHomepageFeature } from '@/lib/public/domain';
import { PublicImage } from '../PublicImage';
import {
  MetadataRow,
  PublicationMetadata,
  RelationshipCard,
  TechnologyList,
} from '../EditorialPrimitives';

export function EditorialCard({
  feature,
  routeEnabled,
  relationshipRoutes,
  prominent = false,
  priority = false,
}: {
  feature: ImmutablePublic<PublicHomepageFeature>;
  routeEnabled: boolean;
  relationshipRoutes: Readonly<Record<string, boolean>>;
  prominent?: boolean;
  priority?: boolean;
}) {
  const { entity, relationships } = feature;
  const heading = <h3>{entity.title}</h3>;

  return (
    <article className={prominent ? 'home-card home-card-prominent' : 'home-card'}>
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
          <div className="home-relationships" aria-label="Connected evidence">
            {relationships.map((relationship) => (
              <RelationshipCard
                key={`${relationship.kind}-${relationship.target.url}`}
                relationship={relationship}
                enabled={Boolean(relationshipRoutes[relationship.target.type])}
              />
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}
