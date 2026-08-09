import 'server-only';

import {
  FEATURED_COLLECTIONS,
  listAllFeaturedCollectionEntries,
  type FeaturedCollectionEntry,
} from '@/lib/studio/featured-collections';
import type { Career, EngineeringProfile, Service, Team } from '@/types/studio';
import { loadRelationshipIssues } from '@/lib/studio/relationship-health/service';
import { loadStudioContentSnapshot, type StudioContentSnapshot } from '@/lib/studio/request-data';
import type { RelationshipIssue } from '@/lib/studio/relationship-health/rules';
import { buildSections, type HealthCollectionSnapshot, type HealthSnapshot } from './rules';
import { countBySeverity, type HealthReportWithSnapshot } from './types';

/**
 * The one place editorial health is loaded (v3.1 Milestone 3).
 *
 * ## Query shape
 *
 * Studio records, public eligibility, and relationship integrity are loaded
 * as three bounded snapshots and handed to pure rules. There is no per-issue
 * lookup. Public eligibility uses one evidence graph for all five orderable
 * collections; before M32 each collection rebuilt that graph independently.
 *
 * The five orderable collections still use `FEATURED_COLLECTIONS` as their
 * canonical definitions, while `listAllFeaturedCollectionEntries` performs
 * their shared batched read. The Featured Order screen and this dashboard use
 * the same projection and cannot disagree about eligibility.
 *
 * ## What the four non-orderable collections contribute
 *
 * Careers, Services, Team and Engineering Profiles have no featured order and
 * no homepage slot of their own, so they are adapted into the same
 * `FeaturedCollectionEntry` shape with `featuredOrder: null` and a homepage
 * verdict of "not applicable" — expressed as `notPublished` for the entries
 * that genuinely are not public. Rules that only concern featuring skip them
 * naturally, and rules about publishing, review queues and activity cover them
 * without a second code path.
 */
export async function loadHealthReport(
  now = new Date(),
  providedSnapshot?: StudioContentSnapshot,
): Promise<HealthReportWithSnapshot<HealthCollectionSnapshot, RelationshipIssue>> {
  const studioSnapshot = providedSnapshot ?? (await loadStudioContentSnapshot());
  const [featuredEntries, careers, services, team, profiles, relationshipIssues] =
    await Promise.all([
      listAllFeaturedCollectionEntries(studioSnapshot),
      Promise.resolve(studioSnapshot.careers),
      Promise.resolve(studioSnapshot.services),
      Promise.resolve(studioSnapshot.team),
      Promise.resolve(studioSnapshot.profiles),
      loadRelationshipIssues(studioSnapshot),
    ]);

  const featuredCollections = Object.values(FEATURED_COLLECTIONS).map((collection) => ({
    key: collection.key,
    label: collection.label,
    listPath: collection.listPath,
    featuredPath: collection.featuredPath,
    entries: featuredEntries[collection.key],
  }));

  const collections: HealthCollectionSnapshot[] = [
    ...featuredCollections,
    adapt('careers', 'Careers', '/studio/content/careers', careers, (record: Career) => ({
      label: record.title,
      status: record.status,
      referenceId: record.referenceId,
      updatedAt: record.updatedAt,
      slug: record.slug,
      id: record._id.toString(),
    })),
    adapt('services', 'Services', '/studio/services', services, (record: Service) => ({
      label: record.title,
      // Service uses its own two-state workflow, not the five-state one; it is
      // mapped onto the shared vocabulary rather than given a parallel model.
      status: record.status === 'published' ? 'published' : 'draft',
      referenceId: undefined,
      updatedAt: record.updatedAt,
      slug: record._id.toString(),
      id: record._id.toString(),
    })),
    adapt('team', 'Team', '/studio/team', team, (record: Team) => ({
      label: record.name,
      status: record.archived ? 'archived' : 'published',
      referenceId: record.referenceId,
      updatedAt: record.updatedAt,
      slug: record._id.toString(),
      id: record._id.toString(),
    })),
    adapt(
      'engineeringProfiles',
      'Engineering Profiles',
      '/studio/engineering-profiles',
      profiles,
      (record: EngineeringProfile) => ({
        label: record.referenceId,
        status: record.status,
        referenceId: record.referenceId,
        updatedAt: record.updatedAt,
        slug: record.slug,
        id: record._id.toString(),
      }),
    ),
  ];

  const snapshot: HealthSnapshot = {
    collections,
    // Counted from the integrity scanner's own findings — this module never
    // re-derives relationship rules, it only summarises them for the dashboard.
    relationshipIssues: {
      critical: relationshipIssues.filter((issue) => issue.severity === 'critical').length,
      warning: relationshipIssues.filter((issue) => issue.severity === 'warning').length,
      info: relationshipIssues.filter((issue) => issue.severity === 'info').length,
    },
    now,
  };

  const sections = buildSections(snapshot);
  const allIssues = sections.flatMap((section) => section.issues);
  const counts = countBySeverity(allIssues);

  return {
    sections,
    counts,
    healthy: counts.critical === 0 && counts.warning === 0,
    generatedAt: now,
    // Carried through rather than recomputed — see `HealthReportWithSnapshot`.
    collections,
    relationshipIssues,
  };
}

function adapt<T>(
  key: string,
  label: string,
  listPath: string,
  records: T[],
  project: (record: T) => {
    id: string;
    label: string;
    slug: string;
    status: FeaturedCollectionEntry['status'];
    referenceId: FeaturedCollectionEntry['referenceId'] | undefined;
    updatedAt: Date;
  },
): HealthCollectionSnapshot {
  return {
    key,
    label,
    listPath,
    entries: records.map((record) => {
      const projected = project(record);
      return {
        id: projected.id,
        slug: projected.slug,
        referenceId: (projected.referenceId ?? '') as FeaturedCollectionEntry['referenceId'],
        label: projected.label,
        status: projected.status,
        featuredOrder: null,
        updatedAt: projected.updatedAt,
        homepage:
          projected.status === 'published'
            ? { kind: 'eligible' as const }
            : { kind: 'notPublished' as const },
      };
    }),
  };
}
