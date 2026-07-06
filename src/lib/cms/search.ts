import { getRecordLabel, listCollections } from "@/lib/cms/collection-config";
import { connectToDatabase } from "@/lib/db";
import { listMedia } from "@/lib/cms/media";
import { can } from "@/lib/cms/permissions";
import { escapeRegExp } from "@/lib/utils";
import type { Resource, SessionUser } from "@/types/cms";

export interface SearchResultItem {
  id: string;
  label: string;
  sublabel?: string;
  href: string;
}

export interface SearchResultGroup {
  resource: Resource | "media";
  label: string;
  items: SearchResultItem[];
}

export interface QuickCreateAction {
  resource: Resource;
  label: string;
  href: string;
}

const RESULTS_PER_GROUP = 5;

/**
 * The global Studio search engine (Phase F). Entirely registry-driven —
 * `listCollections()` is the only source of "what's searchable," so a new
 * collection is included the moment it registers with `studioBasePath` +
 * `searchableFields` set, no change here. Reuses the exact regex-match
 * approach `crud-actions.ts`'s `list()` already uses for a single collection's
 * own search box, generalized across every collection the signed-in user can
 * view.
 *
 * Media and (via the caller's separately-derived "Go to" navigation group,
 * `command-palette.tsx`) Site Settings sit outside the `CollectionConfig`
 * registry by design (`ARCHITECTURE/19_CMS_FOUNDATION.md` §11's precedent —
 * a grid of files and a singleton form, not a workflow document list), so
 * they're folded in here as two small, explicit additions rather than forced
 * into the registry shape they don't fit.
 */
export async function globalSearch(user: SessionUser, query: string): Promise<SearchResultGroup[]> {
  const q = query.trim();
  if (!q) return [];

  await connectToDatabase();

  const collections = listCollections().filter(
    (config) =>
      config.searchableFields.length > 0 &&
      config.studioBasePath &&
      can(user, "view", config.resource),
  );

  const collectionGroups = await Promise.all(
    collections.map(async (config): Promise<SearchResultGroup | null> => {
      const filter = {
        $or: config.searchableFields.map((field) => ({
          [field]: { $regex: escapeRegExp(q), $options: "i" },
        })),
      };
      const docs = await config.model
        .find(filter)
        .limit(RESULTS_PER_GROUP)
        .lean<Record<string, unknown>[]>();
      if (docs.length === 0) return null;

      return {
        resource: config.resource,
        label: config.label,
        items: docs.map((doc) => ({
          id: String(doc._id),
          label: getRecordLabel(config, doc),
          sublabel: config.label,
          href: `/studio/${config.studioBasePath}/${doc._id}`,
        })),
      };
    }),
  );

  const groups = collectionGroups.filter((group): group is SearchResultGroup => group !== null);

  if (can(user, "view", "media")) {
    const media = await listMedia({ q, page: 1 });
    if (media.items.length > 0) {
      groups.push({
        resource: "media",
        label: "Media",
        items: media.items.slice(0, RESULTS_PER_GROUP).map((item) => ({
          id: item.id,
          label: item.originalName || item.alt,
          sublabel: "Media",
          href: `/studio/media?highlight=${item.id}`,
        })),
      });
    }
  }

  return groups;
}

/**
 * The command palette's "New …" actions (Phase F) — derived from
 * `listCollections()`'s `quickCreateLabel` field, never a hardcoded action
 * list. "Upload Media" is a small, explicit addition alongside it for the
 * same reason Media sits outside the registry in `globalSearch` above.
 */
export function getQuickCreateActions(user: SessionUser): QuickCreateAction[] {
  const actions: QuickCreateAction[] = listCollections()
    .filter(
      (config) =>
        config.quickCreateLabel && config.studioBasePath && can(user, "create", config.resource),
    )
    .map((config) => ({
      resource: config.resource,
      label: config.quickCreateLabel!,
      href: `/studio/${config.studioBasePath}/new`,
    }));

  if (can(user, "create", "media")) {
    actions.push({ resource: "media", label: "Upload Media", href: "/studio/media?upload=1" });
  }

  return actions;
}
