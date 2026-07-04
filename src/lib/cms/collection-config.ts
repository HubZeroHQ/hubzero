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
  model: Model<T>;
  zodSchema: ZodType<TInput>;
  workflow: Workflow;
  listColumns: TableColumn<ClientDocument<T>>[];
  filters: FilterConfig<ClientDocument<T>>[];
  formFields: FieldConfig<TInput>[];
  searchableFields: (keyof T & string)[];
  emptyStateMessage: string;
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
  /** Server-computed fields derived from input before validation/save (e.g. BlogPost's `readingTimeMinutes`, §11). */
  computedFields?: (input: TInput) => Partial<T>;
  /**
   * Referential-integrity check before delete — `ARCHITECTURE/11_DATABASE_ARCHITECTURE.md`
   * §2's "never a silent dangling reference." Return a message to block the
   * delete (surfaced to the caller), `null`/`undefined` to allow it. Unused
   * by collections nothing else references yet (e.g. Case Study, for now).
   */
  deleteGuard?: (id: string) => Promise<string | null>;
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

type AnyCollectionConfig = CollectionConfig<Record<string, unknown>, Record<string, unknown>>;

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
