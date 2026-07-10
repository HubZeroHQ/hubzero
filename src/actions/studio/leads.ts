"use server";

import { Types } from "mongoose";

import { leadConfig } from "@/lib/cms/collections/lead.config";
import { createCrudActions } from "@/lib/cms/crud-actions";
import { notify } from "@/lib/cms/notifications";
import { requirePermission } from "@/lib/cms/permissions";
import { connectToDatabase } from "@/lib/db";
import { Lead } from "@/models/lead";
import { User } from "@/models/user";

/**
 * Leads' Server Actions — `list`/`getOne`/`remove`/`bulkRemove` are the
 * generic engine's, re-exported (`ARCHITECTURE/19_CMS_FOUNDATION.md` §12: the
 * inbox's `<DataTable>` reuse is "legitimate and free"). `create`/`update`/
 * `submitForReview`/`publish`/`autosaveDraft` are deliberately **not**
 * re-exported: `workflow: "none"` makes the workflow ones throw if called,
 * and Leads are never authored/edited as a whole document through a generic
 * form, only triaged via the bespoke actions below.
 */
const { list, getOne, remove, bulkRemove } = createCrudActions(leadConfig);
export { list, getOne, remove, bulkRemove };

const leadStatusValues = ["new", "contacted", "closed"] as const;
type LeadStatus = (typeof leadStatusValues)[number];

export type SimpleResult = { status: "success" } | { status: "error"; message: string };

export async function updateLeadStatus(id: string, newStatus: LeadStatus): Promise<SimpleResult> {
  const user = await requirePermission("edit", "lead");
  if (!leadStatusValues.includes(newStatus)) {
    return { status: "error", message: "That isn't a valid status." };
  }

  await connectToDatabase();
  if (!Types.ObjectId.isValid(id)) return { status: "error", message: "Not found." };

  const doc = await Lead.findById(id);
  if (!doc) return { status: "error", message: "Not found." };
  if (doc.status === newStatus) return { status: "success" };

  const previousStatus = doc.status;
  doc.status = newStatus;
  doc.timeline.push({
    type: "status_change",
    message: `Status changed from "${previousStatus}" to "${newStatus}".`,
    actorId: new Types.ObjectId(user.id),
    at: new Date(),
  });

  try {
    await doc.save();
    return { status: "success" };
  } catch (error) {
    console.error(`Failed to update status for lead ${id}:`, error);
    return { status: "error", message: "Something went wrong. Please try again." };
  }
}

export async function assignLead(id: string, assigneeId: string | null): Promise<SimpleResult> {
  const user = await requirePermission("edit", "lead");

  await connectToDatabase();
  if (!Types.ObjectId.isValid(id)) return { status: "error", message: "Not found." };

  const doc = await Lead.findById(id);
  if (!doc) return { status: "error", message: "Not found." };

  let assigneeName = "Unassigned";
  if (assigneeId) {
    if (!Types.ObjectId.isValid(assigneeId)) {
      return { status: "error", message: "That isn't a valid assignee." };
    }
    const assignee = await User.findById(assigneeId).select("name");
    if (!assignee) return { status: "error", message: "That user could not be found." };
    assigneeName = assignee.name;
    doc.assignedTo = assignee._id;
  } else {
    doc.assignedTo = null;
  }

  doc.timeline.push({
    type: "assignment",
    message: assigneeId ? `Assigned to ${assigneeName}.` : "Unassigned.",
    actorId: new Types.ObjectId(user.id),
    at: new Date(),
  });

  try {
    await doc.save();
    if (assigneeId && assigneeId !== user.id) {
      await notify({
        userId: assigneeId,
        event: "lead_assigned",
        title: `You were assigned the lead from ${doc.name}`,
        link: `/studio/leads/${id}`,
        sourceCollection: "lead",
        sourceDocumentId: id,
      });
    }
    return { status: "success" };
  } catch (error) {
    console.error(`Failed to assign lead ${id}:`, error);
    return { status: "error", message: "Something went wrong. Please try again." };
  }
}

export async function addLeadNote(id: string, message: string): Promise<SimpleResult> {
  const user = await requirePermission("edit", "lead");

  const trimmed = message.trim();
  if (!trimmed) return { status: "error", message: "Write a note before saving." };
  if (trimmed.length > 2000)
    return { status: "error", message: "Keep notes under 2,000 characters." };

  await connectToDatabase();
  if (!Types.ObjectId.isValid(id)) return { status: "error", message: "Not found." };

  const doc = await Lead.findById(id);
  if (!doc) return { status: "error", message: "Not found." };

  doc.timeline.push({
    type: "note",
    message: trimmed,
    actorId: new Types.ObjectId(user.id),
    at: new Date(),
  });

  try {
    await doc.save();
    return { status: "success" };
  } catch (error) {
    console.error(`Failed to add note to lead ${id}:`, error);
    return { status: "error", message: "Something went wrong. Please try again." };
  }
}

export interface AssignableUser {
  id: string;
  name: string;
  email: string;
}

/**
 * The `assignLead` dropdown's source list — Admin/Head Admin accounts only,
 * since only those roles hold the `lead: edit` grant that makes an
 * assignment actionable (`permissions.ts`).
 */
export async function getAssignableUsers(): Promise<AssignableUser[]> {
  await requirePermission("view", "lead");
  await connectToDatabase();

  const users = await User.find({ role: { $in: ["admin", "head_admin"] } })
    .select("name email")
    .sort({ name: 1 })
    .lean<{ _id: Types.ObjectId; name: string; email: string }[]>();

  return users.map((entry) => ({ id: entry._id.toString(), name: entry.name, email: entry.email }));
}
