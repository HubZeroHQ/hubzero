import { isFeatured, isValidFeaturedPosition } from '@/lib/studio/featured-order';
import type { FeaturedCollectionEntry } from '@/lib/studio/featured-collections';
import type { PublishStatus } from '@/types/studio';
import { bySeverity, type HealthIssue, type HealthSection } from './types';

/**
 * Every health rule, as pure functions over an already-loaded snapshot.
 *
 * Pure and DOM-free on purpose: these are the assertions the dashboard makes
 * about the site, and they should be testable without a database, a browser,
 * or a session. Adding a future check means adding a function here and listing
 * it in `buildSections` — no change to the loader, the page, or the rendering,
 * which is the extensibility the brief asks for.
 */

export interface HealthCollectionSnapshot {
  key: string;
  label: string;
  listPath: string;
  /** Present only for the five collections that support editorial featured order. */
  featuredPath?: string;
  entries: FeaturedCollectionEntry[];
}

export interface HealthSnapshot {
  collections: HealthCollectionSnapshot[];
  /**
   * Relationship defects, already computed by the integrity scanner
   * (`relationship-health/rules.ts`) — counted here, never re-derived.
   */
  relationshipIssues: {
    critical: number;
    warning: number;
    info: number;
  };
  now: Date;
}

const PUBLISH_STATUSES: readonly PublishStatus[] = [
  'draft',
  'inReview',
  'approved',
  'published',
  'archived',
];

function entityOf(entry: FeaturedCollectionEntry) {
  return { id: entry.id, label: entry.label, referenceId: entry.referenceId };
}

// ---------------------------------------------------------------------------
// Featured
// ---------------------------------------------------------------------------

/**
 * Featured entries that cannot actually appear.
 *
 * The reason text is the public layer's own (`homepageIneligibilityReason`),
 * carried through `FeaturedCollectionEntry.homepage`. This rule adds no
 * judgement of its own — it only notices that an editorial decision (feature
 * this) and a system fact (it doesn't qualify) contradict each other, which is
 * invisible from either screen alone.
 */
export function featuredButInvisible(snapshot: HealthSnapshot): HealthIssue[] {
  return snapshot.collections.flatMap((collection) =>
    collection.entries
      .filter((entry) => isFeatured(entry.featuredOrder) && entry.homepage.kind !== 'eligible')
      .map((entry) => ({
        id: `featured-invisible:${collection.key}:${entry.id}`,
        section: 'featured' as const,
        severity: 'warning' as const,
        title: `${entry.label} is featured but will not appear`,
        detail:
          entry.homepage.kind === 'notPublished'
            ? 'It is featured for the homepage but is not published, so visitors never see it.'
            : `It is featured for the homepage but does not qualify: ${entry.homepage.kind === 'ineligible' ? entry.homepage.reason : ''}`,
        remedy:
          entry.homepage.kind === 'notPublished'
            ? 'Publish it, or remove it from the featured order so the slot goes to something visible.'
            : 'Resolve the gap above, or remove it from the featured order.',
        href: collection.featuredPath ?? collection.listPath,
        entity: entityOf(entry),
      })),
  );
}

/**
 * Duplicate or non-canonical stored positions.
 *
 * Both are *impossible* through the Studio: `setFeaturedOrder` derives
 * positions from array index and rewrites the whole set. Reaching either state
 * means something wrote outside that path — a migration, a direct database
 * edit, a partially applied write — so this is reported as critical despite
 * having no visible public symptom. A silently corrupted invariant is worse
 * than a visible one, because nothing else will ever notice it.
 */
export function nonCanonicalFeaturedOrder(snapshot: HealthSnapshot): HealthIssue[] {
  return snapshot.collections.flatMap((collection) => {
    const featured = collection.entries.filter((entry) => isFeatured(entry.featuredOrder));
    if (featured.length === 0) return [];

    const positions = featured.map((entry) => entry.featuredOrder as number);
    const issues: HealthIssue[] = [];

    const invalid = featured.filter((entry) => !isValidFeaturedPosition(entry.featuredOrder));
    for (const entry of invalid) {
      issues.push({
        id: `featured-invalid-position:${collection.key}:${entry.id}`,
        section: 'featured',
        severity: 'critical',
        title: `${entry.label} has an invalid featured position`,
        detail: `Its stored position is ${String(entry.featuredOrder)}, which is not a whole number of 1 or greater. It is treated as unfeatured everywhere.`,
        remedy:
          'Open Featured Order and save the list once — that rewrites every position cleanly.',
        href: collection.featuredPath ?? collection.listPath,
        entity: entityOf(entry),
      });
    }

    const duplicates = positions.filter((value, index) => positions.indexOf(value) !== index);
    if (duplicates.length > 0) {
      issues.push({
        id: `featured-duplicate:${collection.key}`,
        section: 'featured',
        severity: 'critical',
        title: `${collection.label} has duplicate featured positions`,
        detail: `Position ${[...new Set(duplicates)].join(', ')} is used more than once. The Studio cannot produce this, so something wrote to the database outside it.`,
        remedy: 'Open Featured Order and save the list once to renumber the whole set.',
        href: collection.featuredPath ?? collection.listPath,
      });
    }

    const sorted = [...positions].sort((left, right) => left - right);
    const canonical = sorted.every((value, index) => value === index + 1);
    if (!canonical && duplicates.length === 0 && invalid.length === 0) {
      issues.push({
        id: `featured-gaps:${collection.key}`,
        section: 'featured',
        severity: 'critical',
        title: `${collection.label} featured positions are not consecutive`,
        detail: `Stored positions are ${sorted.join(', ')} rather than 1…${sorted.length}. Ordering still works, but the numbering came from outside the Studio.`,
        remedy: 'Open Featured Order and save the list once to renumber the whole set.',
        href: collection.featuredPath ?? collection.listPath,
      });
    }

    return issues;
  });
}

// ---------------------------------------------------------------------------
// Homepage coverage
// ---------------------------------------------------------------------------

/**
 * A homepage section that renders empty while qualifying content sits behind
 * it. A collection with nothing eligible is not reported: an empty section is
 * then the honest outcome, not an oversight.
 */
export function emptyHomepageSections(snapshot: HealthSnapshot): HealthIssue[] {
  return snapshot.collections
    .filter((collection) => collection.featuredPath !== undefined)
    .flatMap((collection) => {
      const featured = collection.entries.filter((entry) => isFeatured(entry.featuredOrder));
      if (featured.length > 0) return [];

      const eligible = collection.entries.filter((entry) => entry.homepage.kind === 'eligible');
      if (eligible.length === 0) return [];

      return [
        {
          id: `homepage-empty:${collection.key}`,
          section: 'homepageCoverage' as const,
          severity: 'warning' as const,
          title: `${collection.label} is missing from the homepage`,
          detail: `${eligible.length} ${eligible.length === 1 ? 'entry qualifies' : 'entries qualify'} for the homepage, but nothing is featured, so the section renders empty.`,
          remedy: 'Choose which entries lead this section, and in what order.',
          href: collection.featuredPath as string,
        },
      ];
    });
}

// ---------------------------------------------------------------------------
// Missing content — published but invisible
// ---------------------------------------------------------------------------

/**
 * Published entries that fail the public site's own quality gates.
 *
 * These are not "missing field" checks — a field the Zod schema requires
 * cannot be absent, because the repository validates on write. What *can*
 * happen is an entry passing validation while still lacking the media,
 * documents or taxonomy the public layer expects before it will surface
 * something. That predicate already exists; this rule only reports where it
 * says no.
 */
export function publishedButIneligible(snapshot: HealthSnapshot): HealthIssue[] {
  return snapshot.collections.flatMap((collection) =>
    collection.entries
      .filter(
        (entry) =>
          entry.status === 'published' &&
          entry.featuredOrder === null &&
          entry.homepage.kind === 'ineligible',
      )
      .map((entry) => ({
        id: `published-ineligible:${collection.key}:${entry.id}`,
        section: 'missingContent' as const,
        severity: 'info' as const,
        title: `${entry.label} cannot be featured yet`,
        detail: `Published, but it does not meet the homepage bar: ${entry.homepage.kind === 'ineligible' ? entry.homepage.reason : ''}`,
        remedy: 'Fill the gap above if this entry is meant to be homepage material.',
        href: collection.listPath,
        entity: entityOf(entry),
      })),
  );
}

// ---------------------------------------------------------------------------
// Publishing / review queue / activity
// ---------------------------------------------------------------------------

export function publishingCounts(snapshot: HealthSnapshot): HealthIssue[] {
  return snapshot.collections.map((collection) => {
    const counts = PUBLISH_STATUSES.map((status) => ({
      status,
      count: collection.entries.filter((entry) => entry.status === status).length,
    })).filter((row) => row.count > 0);

    return {
      id: `publishing:${collection.key}`,
      section: 'publishing' as const,
      severity: 'info' as const,
      title: collection.label,
      detail:
        counts.length === 0
          ? 'No entries yet.'
          : counts.map((row) => `${row.count} ${row.status}`).join(' · '),
      remedy: 'Open the collection to work through it.',
      href: collection.listPath,
    };
  });
}

export function reviewQueue(snapshot: HealthSnapshot): HealthIssue[] {
  const issues: HealthIssue[] = [];

  for (const collection of snapshot.collections) {
    const inReview = collection.entries.filter((entry) => entry.status === 'inReview');
    if (inReview.length > 0) {
      issues.push({
        id: `review-waiting:${collection.key}`,
        section: 'reviewQueue',
        severity: 'warning',
        title: `${inReview.length} ${collection.label} ${inReview.length === 1 ? 'entry is' : 'entries are'} awaiting review`,
        detail: 'Work is finished and blocked on someone reading it.',
        remedy: 'Review and approve, or send it back with a reason.',
        href: `${collection.listPath}?status=inReview`,
      });
    }

    const approved = collection.entries.filter((entry) => entry.status === 'approved');
    if (approved.length > 0) {
      issues.push({
        id: `review-approved:${collection.key}`,
        section: 'reviewQueue',
        severity: 'warning',
        title: `${approved.length} approved ${collection.label} ${approved.length === 1 ? 'entry is' : 'entries are'} not published`,
        detail: 'Approved but still invisible to visitors — the last step was never taken.',
        remedy: 'Publish it, or send it back if it is no longer wanted.',
        href: `${collection.listPath}?status=approved`,
      });
    }
  }

  return issues;
}

export function recentActivity(snapshot: HealthSnapshot): HealthIssue[] {
  const sevenDaysAgo = new Date(snapshot.now.getTime() - 7 * 24 * 60 * 60 * 1000);

  return snapshot.collections
    .map((collection): HealthIssue | null => {
      const recent = collection.entries.filter((entry) => entry.updatedAt >= sevenDaysAgo);
      if (recent.length === 0) return null;
      return {
        id: `recent:${collection.key}`,
        section: 'recentActivity' as const,
        severity: 'info' as const,
        title: `${collection.label} — ${recent.length} edited in the last 7 days`,
        detail: recent
          .slice(0, 3)
          .map((entry) => entry.label)
          .join(', '),
        remedy: 'Open the collection to see the full list.',
        href: collection.listPath,
      };
    })
    .filter((issue): issue is HealthIssue => issue !== null);
}

export function relationshipDefects(snapshot: HealthSnapshot): HealthIssue[] {
  const { critical, warning, info } = snapshot.relationshipIssues;
  const issues: HealthIssue[] = [];

  if (critical > 0) {
    issues.push({
      id: 'relationships-critical',
      section: 'brokenRelationships',
      severity: 'critical',
      title: `${critical} relationship${critical === 1 ? '' : 's'} point at something that does not exist`,
      detail:
        'A reference names a deleted record, or a record in a different collection than the relationship expects. The public site drops these silently, so they are invisible from the site itself.',
      remedy: 'Open Relationship health to see each one and the entry that holds it.',
      href: '/studio/health/relationships',
    });
  }

  if (warning > 0) {
    issues.push({
      id: 'relationships-warning',
      section: 'brokenRelationships',
      severity: 'warning',
      title: `${warning} relationship${warning === 1 ? ' needs' : 's need'} attention`,
      detail:
        'References to archived entries, duplicated selections, or an entry related to itself. Nothing is broken publicly, but the data says something the editor probably did not mean.',
      remedy: 'Open Relationship health to review and tidy them.',
      href: '/studio/health/relationships',
    });
  }

  if (info > 0) {
    issues.push({
      id: 'relationships-info',
      section: 'brokenRelationships',
      severity: 'info',
      title: `${info} relationship${info === 1 ? ' points' : 's point'} at unpublished work`,
      detail:
        'Expected while content is still being written — the reference resolves, but the target is not public yet.',
      remedy: 'No action needed unless the target was meant to be live.',
      href: '/studio/health/relationships',
    });
  }

  return issues;
}

// ---------------------------------------------------------------------------
// Assembly
// ---------------------------------------------------------------------------

const SECTION_DEFINITIONS: ReadonlyArray<{
  key: HealthSection['key'];
  label: string;
  description: string;
  rules: ReadonlyArray<(snapshot: HealthSnapshot) => HealthIssue[]>;
}> = [
  {
    key: 'featured',
    label: 'Featured',
    description: 'Whether editorial featuring matches what the public site can actually show.',
    rules: [nonCanonicalFeaturedOrder, featuredButInvisible],
  },
  {
    key: 'homepageCoverage',
    label: 'Homepage coverage',
    description: 'Homepage sections that would render empty while qualifying content exists.',
    rules: [emptyHomepageSections],
  },
  {
    key: 'brokenRelationships',
    label: 'Relationships',
    description: 'References that no longer resolve, reported by the shared relationship graph.',
    rules: [relationshipDefects],
  },
  {
    key: 'reviewQueue',
    label: 'Review queue',
    description: 'Work that is finished but blocked on a person.',
    rules: [reviewQueue],
  },
  {
    key: 'missingContent',
    label: 'Published but not homepage-ready',
    description: 'Live entries that do not meet the public site’s own quality bar.',
    rules: [publishedButIneligible],
  },
  {
    key: 'publishing',
    label: 'Publishing',
    description: 'Status counts across every collection.',
    rules: [publishingCounts],
  },
  {
    key: 'recentActivity',
    label: 'Recent activity',
    description: 'What has changed in the last seven days.',
    rules: [recentActivity],
  },
];

export function buildSections(snapshot: HealthSnapshot): HealthSection[] {
  return SECTION_DEFINITIONS.map((definition) => ({
    key: definition.key,
    label: definition.label,
    description: definition.description,
    issues: definition.rules.flatMap((rule) => rule(snapshot)).sort(bySeverity),
  }));
}
