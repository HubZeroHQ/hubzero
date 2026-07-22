import type { GraphQuery, HubZeroRelationshipKind } from '@/lib/entity-graph';
import type { PublicDiscoveryEntry, PublicEntitySummary, PublicEntityType } from './domain';
import { projectEvidence, type PublicEvidenceNode } from './evidence-projection';
import type { PublicRelationshipData } from './relationships';

export function projectSearchEntry(
  query: GraphQuery<PublicEvidenceNode, HubZeroRelationshipKind, PublicRelationshipData>,
  destinations: ReadonlyMap<string, import('./domain').PublicEntityLink>,
  ref: { type: PublicEntityType; id: string },
  summary: PublicEntitySummary,
): PublicDiscoveryEntry {
  const relationships = projectEvidence(query, destinations, ref)?.relationships ?? [];
  return {
    type: summary.type,
    title: summary.title,
    url: summary.url,
    summary: summary.summary,
    ...(summary.referenceId ? { referenceId: summary.referenceId } : {}),
    taxonomy: summary.technologies.map((term) => term.label),
    ...(summary.state ? { state: summary.state } : {}),
    ...(summary.type === 'note'
      ? { lastModified: summary.publicationDate, author: summary.author }
      : summary.type === 'lab' && summary.lastMajorUpdate
        ? { lastModified: summary.lastMajorUpdate }
        : {}),
    ...(summary.hero ? { media: summary.hero } : {}),
    relationships: [...relationships],
  };
}
