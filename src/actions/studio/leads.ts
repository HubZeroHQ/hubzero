"use server";

import { Types } from "mongoose";

import { leadConfig } from "@/lib/cms/collections/lead.config";
import { createCrudActions } from "@/lib/cms/crud-actions";
import { notify } from "@/lib/cms/notifications";
import { requirePermission } from "@/lib/cms/permissions";
import { connectToDatabase } from "@/lib/db";
import { budgetRangeOptions, projectTypeOptions } from "@/lib/lead-schema";
import { Lead } from "@/models/lead";
import { User } from "@/models/user";
import type { BulkActionResult } from "@/types/cms";

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

// "archived" (Phase F) reuses this same status field — see `models/lead.ts`'s
// own comment on why this isn't a parallel `archivedAt` flag.
const leadStatusValues = ["new", "contacted", "closed", "archived"] as const;
type LeadStatus = (typeof leadStatusValues)[number];
const leadPriorityValues = ["low", "medium", "high"] as const;
type LeadPriority = (typeof leadPriorityValues)[number];

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

export interface LeadDetailsInput {
  priority: LeadPriority;
  internalLabels: string[];
  reminderAt: string | null;
  estimatedValue: number | null;
}

/**
 * Priority/labels/reminder/estimated value (Phase F) — one form, one save,
 * unlike status/assignment/notes, none of these produce a `timeline` entry:
 * they're triage metadata an editor tunes freely, not a meaningful lifecycle
 * event worth an audit-trail line (`models/lead.ts`'s own "one embedded
 * array for status/assignment/notes" scope).
 */
export async function updateLeadDetails(
  id: string,
  input: LeadDetailsInput,
): Promise<SimpleResult> {
  await requirePermission("edit", "lead");

  if (!leadPriorityValues.includes(input.priority)) {
    return { status: "error", message: "That isn't a valid priority." };
  }
  if (input.internalLabels.length > 20) {
    return { status: "error", message: "Keep it to 20 labels or fewer." };
  }
  if (
    input.estimatedValue !== null &&
    (!Number.isFinite(input.estimatedValue) || input.estimatedValue < 0)
  ) {
    return { status: "error", message: "Estimated value must be a positive number." };
  }

  await connectToDatabase();
  if (!Types.ObjectId.isValid(id)) return { status: "error", message: "Not found." };

  const doc = await Lead.findById(id);
  if (!doc) return { status: "error", message: "Not found." };

  doc.priority = input.priority;
  doc.internalLabels = input.internalLabels
    .map((label) => label.trim())
    .filter((label) => label.length > 0)
    .slice(0, 20);
  doc.reminderAt = input.reminderAt ? new Date(input.reminderAt) : null;
  doc.estimatedValue = input.estimatedValue;

  try {
    await doc.save();
    return { status: "success" };
  } catch (error) {
    console.error(`Failed to update details for lead ${id}:`, error);
    return { status: "error", message: "Something went wrong. Please try again." };
  }
}

/** Bulk assignment — routed through the same single-lead `assignLead` above, so notifications and the timeline entry apply identically to a bulk call (`data-table.tsx`'s bulk-action framework). */
export async function bulkAssignLeads(
  ids: string[],
  assigneeId: string | null,
): Promise<BulkActionResult> {
  let succeeded = 0;
  for (const id of ids) {
    if ((await assignLead(id, assigneeId)).status === "success") succeeded += 1;
  }
  return { status: "success", succeeded, failed: ids.length - succeeded };
}

/** Bulk archive — routed through the same single-lead `updateLeadStatus` above. */
export async function bulkArchiveLeads(ids: string[]): Promise<BulkActionResult> {
  let succeeded = 0;
  for (const id of ids) {
    if ((await updateLeadStatus(id, "archived")).status === "success") succeeded += 1;
  }
  return { status: "success", succeeded, failed: ids.length - succeeded };
}

const projectTypeLabels = Object.fromEntries(
  projectTypeOptions.map((option) => [option.value, option.label]),
);
const budgetRangeLabels = Object.fromEntries(
  budgetRangeOptions.map((option) => [option.value, option.label]),
);

function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

/**
 * Every lead as CSV (Phase F) — a plain server-computed string, returned to
 * the client to save as a file (no dedicated download route: this app's
 * Server-Action-first convention already covers "compute this, hand it to
 * the client," and a CSV export is small enough at this app's scale,
 * `ARCHITECTURE/19_CMS_FOUNDATION.md` §10's own "five-person team" framing,
 * to not need a streamed response).
 */
export async function exportLeadsCsv(): Promise<string> {
  await requirePermission("view", "lead");
  await connectToDatabase();

  const leads = await Lead.find()
    .sort({ createdAt: -1 })
    .populate<{ assignedTo: { name: string } | null }>("assignedTo", "name")
    .lean();

  const header = [
    "Name",
    "Email",
    "Company",
    "Project type",
    "Budget range",
    "Status",
    "Priority",
    "Estimated value",
    "Assigned to",
    "Labels",
    "Reminder",
    "Submitted",
    "Message",
  ];

  const rows = leads.map((lead) =>
    [
      lead.name,
      lead.email,
      lead.company ?? "",
      projectTypeLabels[lead.projectType] ?? lead.projectType,
      lead.budgetRange ? (budgetRangeLabels[lead.budgetRange] ?? lead.budgetRange) : "",
      lead.status,
      lead.priority ?? "",
      lead.estimatedValue != null ? String(lead.estimatedValue) : "",
      lead.assignedTo?.name ?? "",
      (lead.internalLabels ?? []).join("; "),
      lead.reminderAt ? new Date(lead.reminderAt).toISOString() : "",
      lead.createdAt ? new Date(lead.createdAt).toISOString() : "",
      lead.message,
    ]
      .map((value) => csvCell(String(value)))
      .join(","),
  );

  return [header.map(csvCell).join(","), ...rows].join("\n");
}
