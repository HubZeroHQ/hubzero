"use server";

import { teamMemberConfig } from "@/lib/cms/collections/team-member.config";
import { createCrudActions } from "@/lib/cms/crud-actions";

/**
 * Thin by design (`ARCHITECTURE/19_CMS_FOUNDATION.md` §4/§5) — the generic
 * engine (`createCrudActions`) does the actual work; this file exists so
 * Next.js's `"use server"` file-boundary convention is respected per
 * collection, not so Team reimplements CRUD.
 */
export const {
  list,
  getOne,
  create,
  update,
  submitForReview,
  publish,
  remove,
  autosaveDraft,
  bulkRemove,
  bulkPublish,
  restoreVersion,
} = createCrudActions(teamMemberConfig);
