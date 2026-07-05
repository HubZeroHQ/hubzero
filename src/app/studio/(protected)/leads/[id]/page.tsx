import type { Metadata } from "next";
import { Types } from "mongoose";
import { notFound, redirect } from "next/navigation";

import { addLeadNote, assignLead, getAssignableUsers, getOne, remove, updateLeadStatus } from "@/actions/studio/leads";
import { LeadAssignForm } from "@/app/studio/(protected)/leads/[id]/lead-assign-form";
import { LeadDeleteButton } from "@/app/studio/(protected)/leads/[id]/lead-delete-button";
import { LeadNoteForm } from "@/app/studio/(protected)/leads/[id]/lead-note-form";
import { LeadStatusForm } from "@/app/studio/(protected)/leads/[id]/lead-status-form";
import { LeadStatusBadge } from "@/components/admin/leads/lead-status-badge";
import { LeadTimeline } from "@/components/admin/leads/lead-timeline";
import { PageHeader } from "@/components/admin/page-header";
import { Card, Grid, Heading, Text } from "@/components/ui";
import { connectToDatabase } from "@/lib/db";
import { budgetRangeOptions, projectTypeOptions } from "@/lib/lead-schema";
import { can } from "@/lib/cms/permissions";
import { requireSessionUser } from "@/lib/cms/session";
import { User } from "@/models/user";

export const metadata: Metadata = {
  title: "Lead — HubZero Studio",
};

interface LeadDetailPageProps {
  params: Promise<{ id: string }>;
}

const projectTypeLabels = Object.fromEntries(
  projectTypeOptions.map((option) => [option.value, option.label]),
);
const budgetRangeLabels = Object.fromEntries(
  budgetRangeOptions.map((option) => [option.value, option.label]),
);

/**
 * The lead detail screen (`ARCHITECTURE/19_CMS_FOUNDATION.md` §4, §12) —
 * status changes, assignment, and notes each write to the one `timeline`
 * array (`models/lead.ts`), rendered here newest-first alongside the raw
 * submission. No draft/publish controls: `workflow: "none"` means there is
 * nothing to submit for review or publish.
 */
export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { id } = await params;

  const user = await requireSessionUser();
  if (!can(user, "view", "lead")) redirect("/studio");

  const doc = await getOne(id);
  if (!doc) notFound();

  const canEdit = can(user, "edit", "lead");
  const canDelete = can(user, "delete", "lead");

  const assignableUsers = canEdit ? await getAssignableUsers() : [];

  // `timeline.actorId`/`assignedTo` are bare `User` references the generic
  // `getOne()` doesn't populate — one batched lookup here (§13's "batch any
  // needed population once per page, never per-row," applied to a single
  // detail page instead of a list).
  await connectToDatabase();
  const actorIds = new Set<string>();
  for (const entry of doc.timeline ?? []) actorIds.add(String(entry.actorId));
  if (doc.assignedTo) actorIds.add(String(doc.assignedTo));
  const actors =
    actorIds.size > 0
      ? await User.find({ _id: { $in: [...actorIds] } })
          .select("name")
          .lean<{ _id: Types.ObjectId; name: string }[]>()
      : [];
  const actorNames = Object.fromEntries(actors.map((actor) => [actor._id.toString(), actor.name]));

  // `doc.timeline`'s static type still carries the storage-side
  // `actorId: ObjectId`/`at: Date` shape — `ClientDocument` (`types/cms.ts`)
  // only remaps the fixed workflow-field set, the same gap `team/[id]/page.tsx`
  // and `notes/[id]/page.tsx` document for their own reference fields.
  const timelineEntries = (doc.timeline ?? []).map((entry) => ({
    type: entry.type,
    message: entry.message,
    actorId: String(entry.actorId),
    at: String(entry.at),
  }));

  return (
    <>
      <PageHeader
        title={doc.name}
        description={doc.email}
        breadcrumb={[{ label: "Leads", href: "/studio/leads" }, { label: doc.name }]}
        actions={<LeadStatusBadge status={doc.status} />}
      />

      <Grid cols={1} colsMd={3} gap="lg">
        <div className="flex flex-col gap-6 md:col-span-2">
          <Card>
            <Heading level={3} className="mb-4">
              Submission
            </Heading>
            <dl className="space-y-3">
              <Row label="Company">{doc.company ?? "—"}</Row>
              <Row label="Project type">{projectTypeLabels[doc.projectType] ?? doc.projectType}</Row>
              <Row label="Budget range">
                {doc.budgetRange ? (budgetRangeLabels[doc.budgetRange] ?? doc.budgetRange) : "—"}
              </Row>
              <Row label="Source page">{doc.sourcePage}</Row>
              <Row label="Submitted">
                {doc.createdAt ? new Date(doc.createdAt).toLocaleString("en-US") : "—"}
              </Row>
            </dl>
            <Text className="mt-4 whitespace-pre-wrap">{doc.message}</Text>
          </Card>

          <Card>
            <Heading level={3} className="mb-4">
              Timeline
            </Heading>
            <LeadTimeline entries={timelineEntries} actorNames={actorNames} />
            {canEdit && (
              <div className="mt-6">
                <LeadNoteForm id={id} addNote={addLeadNote} />
              </div>
            )}
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          {canEdit && (
            <Card>
              <Heading level={3} className="mb-4">
                Status
              </Heading>
              <LeadStatusForm id={id} status={doc.status} updateStatus={updateLeadStatus} />
            </Card>
          )}

          {canEdit && (
            <Card>
              <Heading level={3} className="mb-4">
                Assignment
              </Heading>
              <LeadAssignForm
                id={id}
                assignedTo={doc.assignedTo ? String(doc.assignedTo) : null}
                assignableUsers={assignableUsers}
                assignLead={assignLead}
              />
            </Card>
          )}

          {canDelete && (
            <Card>
              <Heading level={3} className="mb-4">
                Danger zone
              </Heading>
              <LeadDeleteButton id={id} remove={remove} />
            </Card>
          )}
        </div>
      </Grid>
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-caption text-text-muted">{label}</dt>
      <dd className="text-body text-text text-right">{children}</dd>
    </div>
  );
}
