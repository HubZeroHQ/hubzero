"use server";

import "@/lib/cms/collections";

import { getQuickCreateActions, globalSearch } from "@/lib/cms/search";
import { requireSessionUser } from "@/lib/cms/session";
import type { QuickCreateAction, SearchResultGroup } from "@/lib/cms/search";

/** The command palette's per-keystroke query — requires a signed-in Studio user, same as every other cross-collection screen (review queue, dashboard). */
export async function searchStudio(query: string): Promise<SearchResultGroup[]> {
  const user = await requireSessionUser();
  return globalSearch(user, query);
}

/** Fetched once when the palette opens — the "New …" / "Upload Media" command list. */
export async function getCommandActions(): Promise<QuickCreateAction[]> {
  const user = await requireSessionUser();
  return getQuickCreateActions(user);
}
