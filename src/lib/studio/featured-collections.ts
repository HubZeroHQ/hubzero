import 'server-only';

import { blueprintRepository } from '@/lib/db/repositories/blueprint';
import { buildRepository } from '@/lib/db/repositories/build';
import { labRepository } from '@/lib/db/repositories/lab';
import { noteRepository } from '@/lib/db/repositories/note';
import { workRepository } from '@/lib/db/repositories/work';
import type { PublicDetailEntityType, PublicEntityType } from '@/lib/public/domain';
import { listHomepageEligibility, listHomepageEligibilityForTypes } from '@/lib/public/queries';
import { isFeatured } from '@/lib/studio/featured-order';
import type { StudioContentSnapshot } from '@/lib/studio/request-data';
import type {
  Blueprint,
  Build,
  Lab,
  Note,
  PublishStatus,
  ReferenceId,
  ReferenceIdPrefix,
  Work,
} from '@/types/studio';

/**
 * The registry of collections that participate in editorial featured ordering
 * (v3.1 Milestone 2), and the single place that answers "which collections are
 * orderable, and how do I read and write their order?".
 *
 * Adding a collection here is the whole opt-in: the server action, the reorder
 * screen, and the route all read from this map rather than each carrying their
 * own list. That is what keeps "featured" from meaning five slightly different
 * things.
 *
 * ## Why these five and not the others
 *
 * Ordering is only meaningful where an editor is *curating a public sequence*.
 * That is true of the four content pillars (Work, Builds, Blueprints, Labs)
 * and of Notes, all of which the homepage surfaces as ranked lists.
 *
 * It is deliberately not extended to:
 * - **Services** — already carries its own `order: number`, a different,
 *   simpler contract (a full manual sort of a short fixed list, not a featured
 *   subset). Migrating it onto this system would be a behaviour change to a
 *   shipped surface, not an addition.
 * - **Careers** — a hiring pipeline, not a curated showcase; open roles are
 *   surfaced by status, not by editorial rank.
 * - **Engineering Profiles / Team** — ordering people by editorial preference
 *   is a product decision nobody has made, and the homepage already ranks
 *   profiles by evidence rather than by hand.
 * - **Users / Taxonomy** — internal infrastructure with no public sequence at
 *   all.
 */
export type FeaturedCollectionKey = 'work' | 'builds' | 'blueprints' | 'labs' | 'notes';

/** The shape every orderable repository already satisfies via `createFeaturedOrdering`. */
interface FeaturedOrderableRecord {
  _id: { toString(): string };
  slug: string;
  status: PublishStatus;
  referenceId: ReferenceId<ReferenceIdPrefix>;
  /** Optional at the type level because pre-migration documents simply lack the key. */
  featuredOrder?: number | null;
  updatedAt: Date;
}

export interface FeaturedCollectionEntry {
  id: string;
  slug: string;
  referenceId: ReferenceId<ReferenceIdPrefix>;
  label: string;
  status: PublishStatus;
  featuredOrder: number | null;
  updatedAt: Date;
  /**
   * Whether this entry would actually appear on the homepage if featured, and
   * why not when it wouldn't — read from the public layer's own predicate, so
   * the Studio never re-describes eligibility in its own words.
   */
  homepage: HomepageAppearance;
}

export type HomepageAppearance =
  { kind: 'eligible' } | { kind: 'notPublished' } | { kind: 'ineligible'; reason: string };

export interface FeaturedCollectionDefinition {
  key: FeaturedCollectionKey;
  /** Plural, as it appears in Studio navigation. */
  label: string;
  /** Used in prose: "Choose which {singular} entries lead the public site." */
  singular: string;
  listPath: string;
  featuredPath: string;
  /** Which public cache to invalidate when the order changes. */
  publicType: PublicEntityType;
  /** Where the ordered list actually appears to a visitor — shown to the editor so the effect of featuring is never a guess. */
  surface: string;
  listEntries: () => Promise<FeaturedCollectionEntry[]>;
  setFeaturedOrder: (orderedIds: readonly string[]) => Promise<number>;
}

function toEntry(
  record: FeaturedOrderableRecord,
  label: string,
  eligibility: ReadonlyMap<string, string | null>,
): FeaturedCollectionEntry {
  return {
    id: record._id.toString(),
    slug: record.slug,
    referenceId: record.referenceId,
    label,
    status: record.status,
    // Normalised at the boundary: a record written before this field existed has
    // it *absent*, not null, and `undefined !== null` would otherwise read as
    // "featured with an invalid position" everywhere downstream.
    featuredOrder: record.featuredOrder ?? null,
    updatedAt: record.updatedAt,
    homepage: appearance(record, eligibility),
  };
}

/**
 * Three distinct answers, kept distinct on purpose. "Not published" is a
 * workflow fact the editor already understands and can act on directly;
 * "ineligible" is an editorial-quality gap with a specific cause. Collapsing
 * them into one "won't appear" badge would hide which of the two applies.
 *
 * Publication status is read from the record, not inferred from the entry
 * being missing from the eligibility map. Absence there means "not publicly
 * visible", which a `published` record can still be — and reporting that as
 * "not published" would contradict the status shown beside it.
 */
function appearance(
  record: FeaturedOrderableRecord,
  eligibility: ReadonlyMap<string, string | null>,
): HomepageAppearance {
  if (record.status !== 'published') {
    return { kind: 'notPublished' };
  }
  if (!eligibility.has(record.slug)) {
    return {
      kind: 'ineligible',
      reason: 'Not visible on the public site yet.',
    };
  }
  const reason = eligibility.get(record.slug) ?? null;
  return reason === null ? { kind: 'eligible' } : { kind: 'ineligible', reason };
}

/** One eligibility pass per collection, shared by every entry in it. */
async function eligibilityFor(type: PublicDetailEntityType): Promise<Map<string, string | null>> {
  const rows = await listHomepageEligibility(type);
  return new Map(rows.map((row) => [row.slug, row.reason]));
}

export const FEATURED_COLLECTIONS: Record<FeaturedCollectionKey, FeaturedCollectionDefinition> = {
  work: {
    key: 'work',
    label: 'Work',
    singular: 'Work',
    listPath: '/studio/content/work',
    featuredPath: '/studio/content/work/featured',
    publicType: 'work',
    surface: 'the homepage’s lead Work slot',
    listEntries: async () => {
      const [records, eligibility] = await Promise.all([
        workRepository.list(),
        eligibilityFor('work'),
      ]);
      return records.map((record: Work) => toEntry(record, record.title, eligibility));
    },
    setFeaturedOrder: workRepository.setFeaturedOrder,
  },
  builds: {
    key: 'builds',
    label: 'Builds',
    singular: 'Build',
    listPath: '/studio/content/builds',
    featuredPath: '/studio/content/builds/featured',
    publicType: 'build',
    surface: 'the homepage’s Featured Builds section',
    listEntries: async () => {
      const [records, eligibility] = await Promise.all([
        buildRepository.list(),
        eligibilityFor('build'),
      ]);
      return records.map((record: Build) => toEntry(record, record.title, eligibility));
    },
    setFeaturedOrder: buildRepository.setFeaturedOrder,
  },
  blueprints: {
    key: 'blueprints',
    label: 'Blueprints',
    singular: 'Blueprint',
    listPath: '/studio/content/blueprints',
    featuredPath: '/studio/content/blueprints/featured',
    publicType: 'blueprint',
    surface: 'the homepage’s Blueprints section',
    listEntries: async () => {
      const [records, eligibility] = await Promise.all([
        blueprintRepository.list(),
        eligibilityFor('blueprint'),
      ]);
      return records.map((record: Blueprint) => toEntry(record, record.name, eligibility));
    },
    setFeaturedOrder: blueprintRepository.setFeaturedOrder,
  },
  labs: {
    key: 'labs',
    label: 'Labs',
    singular: 'Lab',
    listPath: '/studio/content/labs',
    featuredPath: '/studio/content/labs/featured',
    publicType: 'lab',
    surface: 'the homepage’s Featured Labs section',
    listEntries: async () => {
      const [records, eligibility] = await Promise.all([
        labRepository.list(),
        eligibilityFor('lab'),
      ]);
      return records.map((record: Lab) => toEntry(record, record.title, eligibility));
    },
    setFeaturedOrder: labRepository.setFeaturedOrder,
  },
  notes: {
    key: 'notes',
    label: 'Notes',
    singular: 'Note',
    listPath: '/studio/content/notes',
    featuredPath: '/studio/content/notes/featured',
    publicType: 'note',
    surface: 'the homepage’s Featured Notes section',
    listEntries: async () => {
      const [records, eligibility] = await Promise.all([
        noteRepository.list(),
        eligibilityFor('note'),
      ]);
      return records.map((record: Note) => toEntry(record, record.title, eligibility));
    },
    setFeaturedOrder: noteRepository.setFeaturedOrder,
  },
};

export function isFeaturedCollectionKey(value: string): value is FeaturedCollectionKey {
  return value in FEATURED_COLLECTIONS;
}

/**
 * Loads the five orderable Studio collections and their public eligibility as
 * one snapshot. The record queries remain independent and parallel; public
 * eligibility shares one evidence graph instead of rebuilding it five times.
 */
export async function listAllFeaturedCollectionEntries(
  snapshot?: StudioContentSnapshot,
): Promise<Record<FeaturedCollectionKey, FeaturedCollectionEntry[]>> {
  const [work, builds, blueprints, labs, notes, eligibility] = await Promise.all([
    snapshot ? Promise.resolve(snapshot.work) : workRepository.list(),
    snapshot ? Promise.resolve(snapshot.builds) : buildRepository.list(),
    snapshot ? Promise.resolve(snapshot.blueprints) : blueprintRepository.list(),
    snapshot ? Promise.resolve(snapshot.labs) : labRepository.list(),
    snapshot ? Promise.resolve(snapshot.notes) : noteRepository.list(),
    listHomepageEligibilityForTypes(['work', 'build', 'blueprint', 'lab', 'note']),
  ]);

  const map = (type: PublicDetailEntityType) =>
    new Map((eligibility[type] ?? []).map((row) => [row.slug, row.reason]));
  const workEligibility = map('work');
  const buildEligibility = map('build');
  const blueprintEligibility = map('blueprint');
  const labEligibility = map('lab');
  const noteEligibility = map('note');

  return {
    work: work.map((record) => toEntry(record, record.title, workEligibility)),
    builds: builds.map((record) => toEntry(record, record.title, buildEligibility)),
    blueprints: blueprints.map((record) => toEntry(record, record.name, blueprintEligibility)),
    labs: labs.map((record) => toEntry(record, record.title, labEligibility)),
    notes: notes.map((record) => toEntry(record, record.title, noteEligibility)),
  };
}

export interface FeaturedCoverageGap {
  key: FeaturedCollectionKey;
  label: string;
  surface: string;
  featuredPath: string;
  /** Entries that would appear on the homepage if featured, but are not. */
  eligibleUnfeatured: number;
}

/**
 * Collections whose homepage section would render empty even though there is
 * qualifying content sitting behind it (v3.1 Milestone 2 finalization).
 *
 * This exists because the featured-order migration deliberately starts
 * everything unfeatured — the correct choice, since inferring an editorial
 * ranking from publish dates would be inventing a decision nobody made. The
 * cost of that correctness is that the homepage is empty until someone
 * curates it, and a deploy could carry that emptiness to visitors unnoticed.
 *
 * So the gap is *reported*, never closed automatically. Nothing here writes,
 * orders, or chooses; it only answers "is there content that could be leading
 * the homepage but isn't?" — which is exactly the question an accidental empty
 * homepage is the wrong answer to.
 *
 * A collection with no eligible content at all is not a gap: an empty section
 * is then the honest outcome, not an oversight.
 */
export async function listFeaturedCoverageGaps(): Promise<FeaturedCoverageGap[]> {
  const gaps = await Promise.all(
    Object.values(FEATURED_COLLECTIONS).map(async (collection) => {
      const entries = await collection.listEntries();
      const featured = entries.filter((entry) => isFeatured(entry.featuredOrder));
      if (featured.length > 0) return null;

      const eligibleUnfeatured = entries.filter(
        (entry) => entry.homepage.kind === 'eligible',
      ).length;
      if (eligibleUnfeatured === 0) return null;

      return {
        key: collection.key,
        label: collection.label,
        surface: collection.surface,
        featuredPath: collection.featuredPath,
        eligibleUnfeatured,
      };
    }),
  );

  return gaps.filter((gap): gap is FeaturedCoverageGap => gap !== null);
}
