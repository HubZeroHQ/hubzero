import Link from 'next/link';
import type { ImmutablePublic, PublicEntityDetail } from '@/lib/public/domain';
import { publicRoute } from '@/lib/public/routes';
import { PageContainer } from '../PageContainer';
import { RelationshipGraph } from '../EvidenceVisuals';

/**
 * Re-exported, not redefined: `RelationshipGroup` used to be duplicated
 * here and in `NoteDetail.tsx` and `PublicCollectionDetail.tsx`. It now has
 * one canonical implementation in `EditorialPrimitives.tsx` (next to
 * `RelationshipCard`, which it composes). Re-exporting here means every
 * founder composition's existing `from './profile-shared'` import keeps
 * working unchanged.
 */
export { RelationshipGroup } from '../EditorialPrimitives';

export type EngineeringProfile = Extract<PublicEntityDetail, { type: 'engineeringProfile' }>;

/**
 * Shared across every founder composition and the generic template: the
 * same document roles, labels, and relationship groupings, so a founder's
 * bespoke page still speaks the same editorial vocabulary as every other
 * Engineering Profile — only the arrangement differs, not the content model.
 */
const DOCUMENT_LABELS = {
  introduction: {
    eyebrow: 'Introduction / engineering context',
    title: 'Position and practice',
  },
  interview: { eyebrow: 'Interview / specific judgement', title: 'Questions from the work' },
  quotes: { eyebrow: 'Principles / concise record', title: 'Working positions' },
  timeline: { eyebrow: 'Timeline / meaningful change', title: 'Changes in practice' },
  achievements: { eyebrow: 'Outcomes / verified record', title: 'Documented outcomes' },
} as const;

const DOCUMENT_ORDER = ['introduction', 'interview', 'quotes', 'timeline', 'achievements'] as const;

const RELATIONSHIP_GROUPS = [
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

/**
 * Shared by the generic template and every founder composition (§18
 * evidence visualization) — a monochrome SVG summary of the same
 * `profile.relationships` the `RelationshipGroup` lists below it render
 * accessibly. One implementation, so a future composition gets it for free
 * instead of needing its own copy of this block.
 */
export function ProfileEvidenceGraph({
  profile,
}: {
  profile: ImmutablePublic<EngineeringProfile>;
}) {
  if (!profile.relationships.length) return null;
  const total = profile.relationships.length;
  const collections = new Set(profile.relationships.map((relationship) => relationship.target.type))
    .size;
  return (
    <div className="home-section-artifact profile-evidence-graph">
      <p className="profile-evidence-graph-meta">
        {total} {total === 1 ? 'connection' : 'connections'} across {collections}{' '}
        {collections === 1 ? 'collection' : 'collections'}
      </p>
      <RelationshipGraph
        subject={{ label: profile.title, meta: 'Engineer' }}
        relationships={profile.relationships}
      />
    </div>
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
          <Link href={publicRoute.collection('engineeringProfile')}>
            Return to Engineering Profiles <span aria-hidden="true">→</span>
          </Link>
          <Link href={publicRoute.about()}>
            How HubZero operates <span aria-hidden="true">→</span>
          </Link>
        </div>
      </PageContainer>
    </footer>
  );
}
