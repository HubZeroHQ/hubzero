"use server";

import { caseStudyConfig } from "@/lib/cms/collections/case-study.config";
import { createCrudActions } from "@/lib/cms/crud-actions";

/**
 * Thin by design (`ARCHITECTURE/19_CMS_FOUNDATION.md` §4/§5) — the generic
 * engine (`createCrudActions`) does the actual work; this file exists so
 * Next.js's `"use server"` file-boundary convention is respected per
 * collection, not so Case Studies reimplements CRUD.
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
  schedulePublish,
  scheduleUnpublish,
  cancelSchedule,
  archive,
  restoreArchive,
} = createCrudActions(caseStudyConfig);
