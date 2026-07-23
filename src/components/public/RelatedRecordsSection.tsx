import type { ReactNode } from 'react';
import { PUBLIC_ENTITY_ROUTES } from '@/config/public-site';
import type { ImmutablePublic, PublicRelationship } from '@/lib/public/domain';
import {
  DetailSectionHeading,
  RelationshipCard,
  RelationshipGroup,
  relationshipKey,
} from './EditorialPrimitives';
import { PageContainer, PublicSection } from './PageContainer';

export interface RelatedRecordsGroup {
  /** Omit for a flat, ungrouped list (e.g. a Build's product lineage) — present for named groups (e.g. "Related Work"). */
  title?: string;
  relationships: readonly ImmutablePublic<PublicRelationship>[];
}

/**
 * The shared shape behind every "relationships under a heading" block on
 * the public site: a flat list when there's exactly one untitled group, or
 * several titled groups side by side. One implementation, replacing what
 * were four independent copies (`PublicCollectionDetail`'s
 * `RelationshipSection` and `GroupedRelationshipSection`, `NoteDetail`'s
 * inline block, and the data these draw from is unchanged — this only
 * replaces how it's rendered).
 *
 * `sectionClassName`/`containerClassName` are caller-supplied rather than
 * hardcoded so each existing call site can keep its own CSS hook
 * (`detail-relations`, `note-relations`, `profile-evidence profile-chapter`
 * — several of which turned out to compute identical rules under different
 * names, but reconciling that is a CSS-layer decision outside this
 * component's job).
 */
export function RelatedRecordsSection({
  id,
  eyebrow = 'Relationships / typed links',
  title,
  description,
  headerContent,
  groups,
  sectionClassName,
  containerClassName,
}: {
  id: string;
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  headerContent?: ReactNode;
  groups: readonly RelatedRecordsGroup[];
  sectionClassName: string;
  containerClassName: string;
}) {
  if (!groups.length) return null;
  const flat = groups.length === 1 && !groups[0]?.title;

  return (
    <PublicSection className={sectionClassName} aria-labelledby={id}>
      <PageContainer className={containerClassName}>
        <DetailSectionHeading id={id} eyebrow={eyebrow} title={title} description={description}>
          {headerContent}
        </DetailSectionHeading>
        {flat ? (
          <div className="home-relationships" aria-label={title}>
            {groups[0]!.relationships.map((relationship) => (
              <RelationshipCard
                key={relationshipKey(relationship)}
                relationship={relationship}
                enabled={PUBLIC_ENTITY_ROUTES[relationship.target.type]}
              />
            ))}
          </div>
        ) : (
          <div className="detail-relation-groups">
            {groups.map((group, index) => (
              <RelationshipGroup
                key={group.title ?? index}
                title={group.title ?? ''}
                relationships={group.relationships}
              />
            ))}
          </div>
        )}
      </PageContainer>
    </PublicSection>
  );
}
