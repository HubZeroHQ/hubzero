"use server";

import { testimonialConfig } from "@/lib/cms/collections/testimonial.config";
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
} = createCrudActions(testimonialConfig);
