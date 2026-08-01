import 'server-only';

import { careerRepository } from '@/lib/db/repositories/career';
import { engineeringProfileRepository } from '@/lib/db/repositories/engineering-profile';
import { serviceRepository } from '@/lib/db/repositories/service';
import { teamRepository } from '@/lib/db/repositories/team';
import {
  FEATURED_COLLECTIONS,
  type FeaturedCollectionEntry,
} from '@/lib/studio/featured-collections';
import type { Career, EngineeringProfile, Service, Team } from '@/types/studio';
import { loadRelationshipIssues } from '@/lib/studio/relationship-health/service';
import type { RelationshipIssue } from '@/lib/studio/relationship-health/rules';
import { buildSections, type HealthCollectionSnapshot, type HealthSnapshot } from './rules';
import { countBySeverity, type HealthReportWithSnapshot } from './types';

/**
 * The one place editorial health is loaded (v3.1 Milestone 3).
 *
 * ## Query shape
 *
 * Every collection is read exactly once, all nine in parallel, and the result
 * is handed to pure rules. There is no per-issue lookup and no per-entry
 * query — the N+1 the brief warns about would come from rules fetching their
 * own data, so rules are given a snapshot and cannot fetch at all.
 *
 * The five orderable collections come through `FEATURED_COLLECTIONS`, which
 * already joins each entry with its homepage eligibility in one pass per
 * collection. That is deliberate reuse rather than a second read path: the
 * Featured Order screen and this dashboard see byte-identical data, so they
 * can never disagree about whether an entry would appear.
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
): Promise<HealthReportWithSnapshot<HealthCollectionSnapshot, RelationshipIssue>> {
  const [featuredCollections, careers, services, team, profiles, relationshipIssues] =
    await Promise.all([
      Promise.all(
        Object.values(FEATURED_COLLECTIONS).map(async (collection) => ({
          key: collection.key,
          label: collection.label,
          listPath: collection.listPath,
          featuredPath: collection.featuredPath,
          entries: await collection.listEntries(),
        })),
      ),
      careerRepository.list(),
      serviceRepository.list(),
      teamRepository.list(),
      engineeringProfileRepository.list(),
      loadRelationshipIssues(),
    ]);

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
