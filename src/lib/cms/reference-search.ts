import { Types } from "mongoose";

import { getCollection } from "@/lib/cms/collection-config";
import { connectToDatabase } from "@/lib/db";
import { requirePermission } from "@/lib/cms/permissions";
import { escapeRegExp } from "@/lib/utils";
import type { FieldOption, Resource } from "@/types/cms";

/**
 * The generic engine behind every `reference`/`referenceArray` field
 * (`ARCHITECTURE/19_CMS_FOUNDATION.md` §6) — replaces "paste the referenced
 * record's ID" with a real search, without any collection-specific code:
 * `resource` resolves the target collection through the same
 * `collection-config.ts` registry `getMediaUsage()` already walks generically,
 * and `labelField` (declared once, on the field itself — `types/cms.ts`) says
 * which of that collection's own fields is the human-readable label. A new
 * collection with a `reference` field gets a working picker the moment it's
 * registered — nothing here names a specific resource.
 *
 * Permission is enforced here, once, the same way `crud-actions.ts`'s
 * `list()`/`getOne()` enforce it inside the generic engine rather than
 * trusting every call site to remember — a reference field on a collection
 * the signed-in user can't view still can't be searched around.
 */

const REFERENCE_SEARCH_LIMIT = 20;

function toOption(doc: Record<string, unknown>, labelField: string): FieldOption {
  const value = doc._id instanceof Types.ObjectId ? doc._id.toString() : String(doc._id);
  const label = doc[labelField];
  return { value, label: typeof label === "string" && label.length > 0 ? label : value };
}

/** Incremental search, newest-matching-`labelField` first — the `<ReferencePicker>` modal's result list, re-run on every debounced keystroke. */
export async function searchReferenceOptions(
  resource: Resource,
  labelField: string,
  q: string | undefined,
): Promise<FieldOption[]> {
  await requirePermission("view", resource);
  const config = getCollection(resource);
  if (!config) return [];

  await connectToDatabase();

  const filter: Record<string, unknown> = q
    ? { [labelField]: { $regex: escapeRegExp(q), $options: "i" } }
    : {};

  const docs = await config.model
    .find(filter)
    .sort({ [labelField]: 1 })
    .limit(REFERENCE_SEARCH_LIMIT)
    .lean<Record<string, unknown>[]>();

  return docs.map((doc) => toOption(doc, labelField));
}

/** Resolves already-selected `_id`s back to `{value, label}` — how a stored ObjectId displays as a human-readable label on load, mirroring `getMediaByIdsAction`'s identical job for the `image`/`imageArray` fields. */
export async function resolveReferenceOptions(
  resource: Resource,
  labelField: string,
  ids: string[],
): Promise<FieldOption[]> {
  const validIds = ids.filter((id) => Types.ObjectId.isValid(id));
  if (validIds.length === 0) return [];

  await requirePermission("view", resource);
  const config = getCollection(resource);
  if (!config) return [];

  await connectToDatabase();

  const docs = await config.model
    .find({ _id: { $in: validIds } })
    .lean<Record<string, unknown>[]>();
  const byId = new Map(docs.map((doc) => [String(doc._id), doc]));

  // Preserve the caller's order — a `referenceArray`'s ordering matters, the
  // same reasoning `getMediaByIds` documents for `imageArray`.
  return validIds
    .map((id) => byId.get(id))
    .filter((doc): doc is Record<string, unknown> => Boolean(doc))
    .map((doc) => toOption(doc, labelField));
}
