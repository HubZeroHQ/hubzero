"use server";

import { blueprintConfig } from "@/lib/cms/collections/blueprint.config";
import { createCrudActions } from "@/lib/cms/crud-actions";

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
  approve,
  requestChanges,
  reject,
} = createCrudActions(blueprintConfig);
