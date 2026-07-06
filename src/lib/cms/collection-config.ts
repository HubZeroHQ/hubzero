import type { Model } from "mongoose";
import type { ZodType } from "zod";

import type {
  ClientDocument,
  FieldConfig,
  FilterConfig,
  Resource,
  TableColumn,
  Workflow,
} from "@/types/cms";

/**
 * The generic shape the homepage's featured-content system
 * (`lib/cms/public-content.ts`'s `resolveHomepageItem`) needs from one
 * document, regardless of which collection it belongs to — title/summary
 * field names differ per collection (`client` vs `title` vs `name`,
 * `summary` vs `tagline`), so each collection's own config resolves its own
 * document into this one shape rather than the homepage renderer branching
 * on collection.
 */
export interface PublicCard {
  title: string;
  summary: string;
  /** `null` for a collection with no public detail route yet (e.g. `Build`, Studio-only today) — rendered without a link, never a broken href. */
  href: string | null;
  coverImageId?: string;
  techTags: string[];
  featured: boolean;
  readingTimeMinutes: number;
  contributorIds: string[];
}

/**
 * One object per collection declaring everything generic about it
 * (`ARCHITECTURE/19_CMS_FOUNDATION.md` §5), consumed by `createCrudActions()`
 * (`crud-actions.ts`) and the generic `DataTable`/`CmsForm` components.
 *
 * Three type views of one collection, not one: `T` is the full Mongoose
 * document shape (including server-managed fields like
 * `status`/`version`/`createdBy`) — what `model`, `publishGuard`, and
 * `revalidatesPaths` see. `TInput` is what a create/edit form actually
 * submits — the engine adds the server-managed fields itself, so a
 * collection's Zod schema and `formFields` never need to declare them.
 * `listColumns`/`filters` see `ClientDocument<T>` — the shape `T` has *after*
 * `list()` serializes it for the `DataTable` Client Component (`ObjectId`/
 * `Date` fields become strings, see `types/cms.ts`'s `ClientDocument`).
 */
export interface CollectionConfig<
  T,
  TInput extends Record<string, unknown> = Record<string, unknown>,
> {
  resource: Resource;
  /** Human-readable collection name (e.g. "Case Studies") — the review queue and the dashboard's activity feed render this instead of the machine-cased `resource` key. */
  label: string;
  model: Model<T>;
  zodSchema: ZodType<TInput>;
  workflow: Workflow;
  listColumns: TableColumn<ClientDocument<T>>[];
  filters: FilterConfig<ClientDocument<T>>[];
  formFields: FieldConfig<TInput>[];
  searchableFields: (keyof T & string)[];
  emptyStateMessage: string;
  /**
   * The `/studio/**` URL segment this collection's own list/detail screens
   * live under (e.g. `"case-studies"`) — lets cross-collection generic
   * screens (the review queue, the dashboard's activity feed) link straight
   * to a document's real edit page instead of only its generic version-
   * history view. Optional: a collection with no studio screens yet (there
   * are none today, but the registry doesn't assume otherwise) simply won't
   * get a deep link.
   */
  studioBasePath?: string;
  /**
   * A short, human display string for one document (e.g. a Case Study's
   * `client` name) — used anywhere a document needs a label without
   * importing that collection's own table-column config (the review queue,
   * the activity feed). Falls back to `searchableFields[0]`'s value, then
   * the document's `_id`, via `getRecordLabel()` below — supplying this is
   * an improvement, not a requirement, so a new collection works here with
   * zero code the moment it's registered.
   */
  recordLabel?: (doc: T) => string;
  /** e.g. `(doc) => ["/work", `/work/${doc.slug}`]` — revalidated on publish. */
  revalidatesPaths?: (doc: T) => string[];
  /**
   * Collection-specific publish rule beyond "the workflow reached the
   * publish step" — e.g. Blueprint's `demoStatus === "live"` gate (§11).
   * Return an error message to block publish, `null` to allow it. The
   * *sanctioned* extension point for a publish rule; a new requirement
   * should fit this hook before the engine grows a second one.
   */
  publishGuard?: (doc: T) => string | null;
  /** Server-computed fields derived from input before validation/save (e.g. Note's `readingTimeMinutes`, §11). */
  computedFields?: (input: TInput) => Partial<T>;
  /**
   * Referential-integrity check before delete — `ARCHITECTURE/11_DATABASE_ARCHITECTURE.md`
   * §2's "never a silent dangling reference." Return a message to block the
   * delete (surfaced to the caller), `null`/`undefined` to allow it. Unused
   * by collections nothing else references yet (e.g. Case Study, for now).
   */
  deleteGuard?: (id: string) => Promise<string | null>;
  /**
   * Resolves a document of this collection into the generic `PublicCard`
   * shape the homepage's featured-content system needs — the sanctioned
   * extension point for "what does one card look like" (mirrors
   * `recordLabel`'s "what do we call this document" pattern above). Only
   * collections eligible to be featured on the homepage define this; a
   * collection that omits it (e.g. Team Member, Testimonial) simply can't be
   * added to `SiteSettings.homepage`.
   */
  publicCard?: (doc: T) => PublicCard;
  /**
   * Which field `can()`'s `editOwn` check compares against the signed-in
   * user's id. Defaults to `createdBy` (whoever's Server Action call created
   * the row) when omitted — the right default for authored content like
   * Note, where the creator *is* the author. TeamMember is the
   * documented exception (`ARCHITECTURE/19_CMS_FOUNDATION.md` §11): a Head
   * Admin typically creates a Teammate's profile row during onboarding, but
   * "own content" for a profile means *whose profile it is*
   * (`linkedUserId`), not who happened to create the row — without this
   * override, the teammate the profile belongs to could never edit their
   * own bio, and whichever admin onboarded them could edit it forever. A
   * genuine, sanctioned per-collection override of one generic assumption,
   * not a second ownership model (`crud-actions.ts`'s `ownerTarget` is the
   * only place this is read).
   */
  ownerField?: keyof T & string;
  /**
   * Label for this collection's "new" command in the global command palette
   * (`components/admin/command-palette/command-palette.tsx`) — e.g. `"New
   * Case Study"`. Omit for a collection with no standalone create screen yet,
   * or one that shouldn't be quick-creatable (`Lead`, `User`). The palette's
   * command list is generated from `listCollections()` filtered to this
   * field, never a hardcoded per-collection list — a new collection gets a
   * quick-create command the moment it sets this, no palette code change.
   */
  quickCreateLabel?: string;
}

/**
 * Exists for type-inference ergonomics, not runtime behavior — the same
 * reason `defineConfig()` helpers exist in Vite/Next/etc. (§5).
 */
export function defineCollection<
  T,
  TInput extends Record<string, unknown> = Record<string, unknown>,
>(config: CollectionConfig<T, TInput>): CollectionConfig<T, TInput> {
  return config;
}

/** The type-erased shape every cross-collection consumer (the registry, `restoreVersion`, the review queue, the activity feed) works against. */
export type AnyCollectionConfig = CollectionConfig<
  Record<string, unknown>,
  Record<string, unknown>
>;

const registry = new Map<Resource, AnyCollectionConfig>();

/**
 * Populates the cross-collection registry — used by anything that needs to
 * browse collections generically (e.g. Phase C's unified review queue)
 * rather than importing each collection's config by name. Registration is
 * deliberately separate from `defineCollection()`: a config is a plain,
 * type-safe object the moment it's defined; only a module that wants it
 * discoverable cross-collection calls this, once, at module load.
 *
 * The cast is a one-time, contained type erasure: `Model<T>`'s methods make
 * `CollectionConfig<T>` invariant in `T`, so a registry holding every
 * collection's config necessarily can't keep each one's concrete `T`. Code
 * that needs a specific collection's real type imports that collection's
 * config directly instead of going through the registry.
 */
export function registerCollection<T, TInput extends Record<string, unknown>>(
  config: CollectionConfig<T, TInput>,
): CollectionConfig<T, TInput> {
  if (registry.has(config.resource)) {
    throw new Error(`Collection "${config.resource}" is already registered.`);
  }
  registry.set(config.resource, config as unknown as AnyCollectionConfig);
  return config;
}

export function getCollection(resource: Resource): AnyCollectionConfig | undefined {
  return registry.get(resource);
}

export function listCollections(): AnyCollectionConfig[] {
  return [...registry.values()];
}

/**
 * The one place that resolves "what do we call this document" generically —
 * the review queue and the dashboard's activity feed call this instead of
 * each re-deriving a fallback, so a future collection that forgets
 * `recordLabel` still gets a reasonable label rather than a blank row.
 */
export function getRecordLabel(
  config: AnyCollectionConfig | undefined,
  doc: Record<string, unknown>,
): string {
  if (!config) return String(doc._id ?? "Untitled");
  if (config.recordLabel) return config.recordLabel(doc);
  const field = config.searchableFields[0];
  const value = field ? doc[field] : undefined;
  return typeof value === "string" && value.length > 0 ? value : String(doc._id ?? "Untitled");
}
