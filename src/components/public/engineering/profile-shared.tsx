import Link from 'next/link';
import { PUBLIC_ENTITY_ROUTES } from '@/config/public-site';
import type { ImmutablePublic, PublicEntityDetail, PublicRelationship } from '@/lib/public/domain';
import { PageContainer } from '../PageContainer';
import { RelationshipCard, relationshipKey } from '../EditorialPrimitives';

export type EngineeringProfile = Extract<PublicEntityDetail, { type: 'engineeringProfile' }>;

/**
 * Shared across every founder composition and the generic template: the
 * same document roles, labels, and relationship groupings, so a founder's
 * bespoke page still speaks the same editorial vocabulary as every other
 * Engineering Profile — only the arrangement differs, not the content model.
 */
export const DOCUMENT_LABELS = {
  introduction: {
    eyebrow: 'Introduction / engineering context',
    title: 'Position and practice',
  },
  interview: { eyebrow: 'Interview / specific judgement', title: 'Questions from the work' },
  quotes: { eyebrow: 'Principles / concise record', title: 'Working positions' },
  timeline: { eyebrow: 'Timeline / meaningful change', title: 'Changes in practice' },
  achievements: { eyebrow: 'Outcomes / verified record', title: 'Documented outcomes' },
} as const;

export const DOCUMENT_ORDER = [
  'introduction',
  'interview',
  'quotes',
  'timeline',
  'achievements',
] as const;

export const RELATIONSHIP_GROUPS = [
  { type: 'work', title: 'Related Work' },
  { type: 'build', title: 'Related Builds' },
  { type: 'lab', title: 'Related Labs' },
  { type: 'blueprint', title: 'Related Blueprints' },
  { type: 'note', title: 'Authored Notes' },
] as const;

export function resolveDocuments(profile: ImmutablePublic<EngineeringProfile>) {
  return DOCUMENT_ORDER.flatMap((role) => {
    const document = profile.documents.find((entry) => entry.role === role);
    return document ? [{ document, ...DOCUMENT_LABELS[role] }] : [];
  });
}

export function resolveRelationshipGroups(profile: ImmutablePublic<EngineeringProfile>) {
  return RELATIONSHIP_GROUPS.map((group) => ({
    ...group,
    relationships: profile.relationships.filter(
      (relationship) => relationship.target.type === group.type,
    ),
  })).filter((group) => group.relationships.length);
}

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

/** Identical closing footer across every composition — the return paths never change per founder. */
export function ProfileFooter({ profile }: { profile: ImmutablePublic<EngineeringProfile> }) {
  return (
    <footer className="detail-footer">
      <PageContainer className="detail-footer-grid">
        <div>
          <p className="home-eyebrow">Identity / company context</p>
          <p>{profile.referenceId} / HubZero Engineering</p>
        </div>
        <div className="profile-footer-actions">
          <Link href="/engineering">
            Return to Engineering Profiles <span aria-hidden="true">→</span>
          </Link>
          <Link href="/about">
            How HubZero operates <span aria-hidden="true">→</span>
          </Link>
        </div>
      </PageContainer>
    </footer>
  );
}
