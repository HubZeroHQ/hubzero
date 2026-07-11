"use server";

import { careerListingConfig } from "@/lib/cms/collections/career-listing.config";
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
} = createCrudActions(careerListingConfig);
