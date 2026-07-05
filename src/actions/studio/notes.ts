"use server";

import { noteConfig } from "@/lib/cms/collections/note.config";
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
} = createCrudActions(noteConfig);
