"use server";

import "@/lib/cms/collections";

import { getCollection } from "@/lib/cms/collection-config";
import { restoreVersion as restoreVersionForCollection } from "@/lib/cms/crud-actions";
import type { Resource } from "@/types/cms";

/**
 * The one Server Action the generic version-history screen needs
 * (`app/studio/(protected)/history/[resource]/[id]/page.tsx`) — that screen
 * doesn't know which collection it's showing until a request names a
 * `resource`, so unlike every other collection's actions (`actions/studio/
 * case-studies.ts`), this can't be a `createCrudActions(config)` re-export
 * bound to one config at module load. It resolves `resource` against the
 * registry instead, then delegates to the exact same `restoreVersion()` core
 * every collection's own action uses.
 */
export async function restoreVersion(
  resource: Resource,
  id: string,
  versionHistoryId: string,
): Promise<{ status: "success" } | { status: "error"; message: string }> {
  const config = getCollection(resource);
  if (!config) return { status: "error", message: "Unknown collection." };
  return restoreVersionForCollection(config, id, versionHistoryId);
}
