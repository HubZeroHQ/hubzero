import 'server-only';

import { documentRepository } from '@/lib/db/repositories/document';
import { documentVersionRepository } from '@/lib/db/repositories/document-version';
import type { OwnerType } from '@/lib/documents/schema';
import { publicRoute } from '@/lib/public/routes';
import type { PublicDetailEntityType } from '@/lib/public/domain';
import {
  FEATURED_COLLECTIONS,
  isFeaturedCollectionKey,
  type FeaturedCollectionEntry,
  type FeaturedCollectionKey,
} from '@/lib/studio/featured-collections';
import { isFeatured } from '@/lib/studio/featured-order';
import type { RelationshipIssue } from '@/lib/studio/relationship-health/rules';
import { loadHealthReport } from './service';
import { countBySeverity, type HealthIssue, type HealthSeverity } from './types';

/**
 * The per-entry Health inspector (v3.1 Milestone 11).
 *
 * ## This module owns no rules
 *
 * Not one health verdict is computed here. Every issue shown in an editor's
 * panel is produced by `loadHealthReport` — the same call, the same rules, the
 * same phrasing the global dashboard renders — and this module's entire job is
 * to *select* the findings that name this entry and pair them with the facts
 * that entry already carries. A rule added to `health/rules.ts` appears in the
 * panel with no change here; a rule changed there changes here. There is
 * deliberately no code path by which the two can disagree, because there is
 * only one computation.
 *
 * The selection is exact rather than textual: per-entry rules attach
 * `entity.id`, so findings are matched by identity, never by parsing an issue
 * id or comparing labels. Aggregate findings — "no Blueprints are featured",
 * "the review queue is backing up" — carry no entity and therefore never leak
 * into a single entry's panel, which is the correct behaviour rather than a
 * filter that happens to drop them.
 *
 * ## Query shape
 *
 * Two concurrent loads, never a waterfall: the health report (which already
 * reads every collection once and returns the snapshot it used) and this
 * entry's documents. Nothing is read twice — the entry's own status, featured
 * position and homepage verdict all come out of the report's snapshot rather
 * than a second fetch of the record.
 */

export interface InspectorDocument {
  role: string;
  exists: boolean;
  /** When the document body was last saved. */
  updatedAt?: Date;
  /** The most recent pre-overwrite snapshot, when the document engine has taken one. */
  latestVersionAt?: Date;
  blockCount: number;
  href: string;
}

export interface InspectorPublicUrls {
  slug: string;
  /** The public route this entry occupies, or null for a collection with no detail page. */
  route: string | null;
  canonical: string | null;
  preview: string;
}

export interface EntryInspection {
  collection: {
    key: string;
    label: string;
    singular: string;
    listPath: string;
    featuredPath?: string;
    /** Where a featured entry actually appears to a visitor. */
    surface?: string;
  };
  entry: FeaturedCollectionEntry;
  featured: { isFeatured: boolean; position: number | null };
  public: InspectorPublicUrls;
  documents: InspectorDocument[];
  /** Health findings naming this entry, from the global engine. */
  issues: HealthIssue[];
  /** Relationship defects this entry *holds* — the ones an editor fixes by opening it. */
  relationshipIssues: RelationshipIssue[];
  counts: Record<HealthSeverity, number>;
  generatedAt: Date;
}

/**
 * Which document roles each collection is expected to have, and how its
 * records map onto the document engine's owner vocabulary.
 *
 * The roles are read from the editors that already create them rather than
 * invented here: this is the same `ownerType`/`role` pair each detail page
 * passes to `findByOwnerAndRole`. A collection missing from this map simply
 * reports no documents instead of guessing at a body.
 */
const DOCUMENT_OWNERS: Record<string, { ownerType: OwnerType; roles: string[] }> = {
  work: { ownerType: 'Work', roles: ['caseStudy'] },
  builds: { ownerType: 'Build', roles: ['technical'] },
  blueprints: { ownerType: 'Blueprint', roles: ['caseStudy'] },
  labs: { ownerType: 'Lab', roles: ['overview', 'engineeringJournal', 'findings'] },
  notes: { ownerType: 'Note', roles: ['body'] },
  careers: { ownerType: 'Career', roles: ['body'] },
  engineeringProfiles: { ownerType: 'EngineeringProfile', roles: ['profile'] },
};

/** Collections whose entries have a public detail page, by public entity type. */
const PUBLIC_DETAIL_TYPE: Record<string, PublicDetailEntityType> = {
  work: 'work',
  builds: 'build',
  blueprints: 'blueprint',
  labs: 'lab',
  notes: 'note',
};

export async function loadEntryInspection(input: {
  collectionKey: string;
  entryId: string;
  editHref: string;
  siteOrigin?: string;
}): Promise<EntryInspection | null> {
  const { collectionKey, entryId } = input;
  const owner = DOCUMENT_OWNERS[collectionKey];

  const [report, documents] = await Promise.all([
    loadHealthReport(),
    owner
      ? documentRepository.findByOwner(owner.ownerType, entryId).catch(() => [])
      : Promise.resolve([]),
  ]);

  const collectionSnapshot = report.collections.find((entry) => entry.key === collectionKey);
  const entry = collectionSnapshot?.entries.find((candidate) => candidate.id === entryId);
  if (!collectionSnapshot || !entry) return null;

  // Versions are only fetched for documents that exist, so an entry with no
  // body issues no version queries at all.
  const versions = await Promise.all(
    documents.map((document) =>
      documentVersionRepository.findLatestForDocument(document._id.toString()).catch(() => null),
    ),
  );

  const definition = isFeaturedCollectionKey(collectionKey)
    ? FEATURED_COLLECTIONS[collectionKey as FeaturedCollectionKey]
    : undefined;

  const issues = report.sections
    .flatMap((section) => section.issues)
    .filter((issue) => issue.entity?.id === entryId);

  const relationshipIssues = report.relationshipIssues.filter(
    (issue) => issue.source.id === entryId,
  );

  const detailType = PUBLIC_DETAIL_TYPE[collectionKey];
  const route = detailType ? publicRoute.entity({ type: detailType, slug: entry.slug }) : null;

  return {
    collection: {
      key: collectionSnapshot.key,
      label: collectionSnapshot.label,
      singular: definition?.singular ?? collectionSnapshot.label,
      listPath: collectionSnapshot.listPath,
      ...(collectionSnapshot.featuredPath ? { featuredPath: collectionSnapshot.featuredPath } : {}),
      ...(definition?.surface ? { surface: definition.surface } : {}),
    },
    entry,
    featured: {
      isFeatured: isFeatured(entry.featuredOrder),
      position: isFeatured(entry.featuredOrder) ? entry.featuredOrder : null,
    },
    public: {
      slug: entry.slug,
      route,
      canonical: route && input.siteOrigin ? `${input.siteOrigin}${route}` : route,
      preview: input.editHref,
    },
    documents: (owner?.roles ?? []).map((role) => {
      const index = documents.findIndex((document) => document.role === role);
      const document = index === -1 ? undefined : documents[index];
      const version = index === -1 ? null : versions[index];
      return {
        role,
        exists: Boolean(document),
        ...(document?.updatedAt ? { updatedAt: document.updatedAt } : {}),
        ...(version?.createdAt ? { latestVersionAt: version.createdAt } : {}),
        blockCount: document?.blocks?.length ?? 0,
        href: input.editHref,
      };
    }),
    issues,
    relationshipIssues,
    counts: countBySeverity(issues),
    generatedAt: report.generatedAt,
  };
}
