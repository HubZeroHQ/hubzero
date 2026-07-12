"use server";

import { Types } from "mongoose";

import { buildConfig } from "@/lib/cms/collections/build.config";
import { labsProjectConfig } from "@/lib/cms/collections/labs-project.config";
import { createCrudActions } from "@/lib/cms/crud-actions";
import { connectToDatabase } from "@/lib/db";
import { requirePermission } from "@/lib/cms/permissions";

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
} = createCrudActions(labsProjectConfig);

type SimpleResult = { status: "success" } | { status: "error"; message: string };

/**
 * The one genuinely bespoke piece of business logic this collection needs
 * (`ARCHITECTURE/19_CMS_FOUNDATION.md` §11) — writes `LabsProject.stage`/
 * `graduatedToBuildId` and `Build.graduatedFromLabsId` together, so the pair
 * is never set on only one side (`ARCHITECTURE/11_DATABASE_ARCHITECTURE.md`
 * §2's bidirectional-validation requirement). Lives beside the generic
 * `createCrudActions()` set above, not folded into it — the generic engine
 * has no reason to know about Labs/Build's specific relationship.
 */
export async function graduateToBuild(
  labsProjectId: string,
  buildId: string,
): Promise<SimpleResult> {
  await connectToDatabase();
  if (!Types.ObjectId.isValid(labsProjectId) || !Types.ObjectId.isValid(buildId)) {
    return { status: "error", message: "Not found." };
  }

  const labsProject = await labsProjectConfig.model.findById(labsProjectId);
  if (!labsProject) return { status: "error", message: "Labs project not found." };
  const build = await buildConfig.model.findById(buildId);
  if (!build) return { status: "error", message: "Build not found." };

  await requirePermission("edit", "labsProject", {
    createdBy: labsProject.createdBy?.toString(),
  });
  await requirePermission("edit", "build", { createdBy: build.createdBy?.toString() });

  if (labsProject.stage === "graduated") {
    return { status: "error", message: "This project has already graduated." };
  }

  // Not wrapped in a MongoDB transaction — this codebase uses no Mongoose
  // sessions anywhere (`lib/db.ts`), the same accepted tradeoff
  // `snapshotVersion` documents (`lib/cms/version-history.ts`). Writing the
  // `Build` side first means the one failure mode left open is a `Build`
  // pointing back to a project that hasn't yet flipped to "graduated" —
  // recoverable by re-running this action — never a `LabsProject` claiming
  // "graduated" with no real `Build` on the other end.
  try {
    build.graduatedFromLabsId = labsProject._id;
    await build.save();

    labsProject.stage = "graduated";
    labsProject.graduatedToBuildId = build._id;
    await labsProject.save();

    return { status: "success" };
  } catch (error) {
    console.error(`Failed to graduate LabsProject ${labsProjectId} to Build ${buildId}:`, error);
    return {
      status: "error",
      message: "Something went wrong recording the graduation. Please check both records.",
    };
  }
}
