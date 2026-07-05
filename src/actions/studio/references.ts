"use server";

import { resolveReferenceOptions, searchReferenceOptions } from "@/lib/cms/reference-search";
import type { FieldOption, Resource } from "@/types/cms";

/**
 * Thin by design, same as every other `actions/studio/*.ts` file
 * (`ARCHITECTURE/19_CMS_FOUNDATION.md` §4) — `lib/cms/reference-search.ts`
 * does the actual work and its own permission check; this file exists so
 * Next.js's `"use server"` boundary is respected. One pair of actions for
 * every `reference`/`referenceArray` field across every collection, not one
 * per collection.
 */

export async function searchReferenceOptionsAction(
  resource: Resource,
  labelField: string,
  q?: string,
): Promise<FieldOption[]> {
  return searchReferenceOptions(resource, labelField, q);
}

export async function resolveReferenceOptionsAction(
  resource: Resource,
  labelField: string,
  ids: string[],
): Promise<FieldOption[]> {
  return resolveReferenceOptions(resource, labelField, ids);
}
