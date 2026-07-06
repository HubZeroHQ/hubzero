import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import {
  archive,
  cancelSchedule,
  getOne,
  publish,
  remove,
  restoreArchive,
  schedulePublish,
  scheduleUnpublish,
  submitForReview,
} from "@/actions/studio/notes";
import { EditNoteForm } from "@/app/studio/(protected)/notes/[id]/edit-note-form";
import { PageHeader } from "@/components/admin/page-header";
import { WorkflowActions } from "@/components/admin/workflow-actions";
import { WorkflowStatusBadge } from "@/components/admin/workflow-status-badge";
import { Link, Text } from "@/components/ui";
import type { NoteInput } from "@/lib/cms/collections/note-fields";
import { can } from "@/lib/cms/permissions";
import { requireSessionUser } from "@/lib/cms/session";

interface EditNotePageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Edit Note — HubZero Studio",
};

export default async function EditNotePage({ params }: EditNotePageProps) {
  const { id } = await params;

  const user = await requireSessionUser();
  if (!can(user, "view", "note")) redirect("/studio");

  const doc = await getOne(id);
  if (!doc) notFound();

  const target = { createdBy: doc.createdBy };
  const canEdit = can(user, "edit", "note", target);
  const canPublish = can(user, "publish", "note", target);
  const canDelete = can(user, "delete", "note", target);

  const initialValues: Partial<NoteInput> = {
    slug: doc.slug,
    title: doc.title,
    summary: doc.summary,
    content: doc.content,
    // `authorId` isn't in `ClientDocument`'s date/ObjectId whitelist
    // (`types/cms.ts`) — same treatment as `team/[id]/page.tsx`'s
    // `linkedUserId`.
    authorId: String(doc.authorId),
    contributors: (doc.contributors ?? []).map((memberId) => String(memberId)),
    category: doc.category,
    tags: doc.tags,
    coverImage: doc.coverImage ? String(doc.coverImage) : undefined,
    featured: doc.featured,
  };

  return (
    <>
      <PageHeader
        title={doc.title}
        description={`${doc.category} · ${doc.readingTimeMinutes} min read`}
        breadcrumb={[{ label: "Notes", href: "/studio/notes" }, { label: doc.title }]}
        actions={
          <div className="flex items-center gap-3">
            <Link href={`/studio/history/note/${id}`}>View history →</Link>
            <WorkflowStatusBadge status={doc.status} />
          </div>
        }
      />

      <div className="mb-6">
        <WorkflowActions
          id={id}
          status={doc.status}
          workflow="draft-review-publish"
          canSubmitForReview={canEdit}
          canPublish={canPublish}
          canDelete={canDelete}
          submitForReview={submitForReview}
          publish={publish}
          remove={remove}
          listHref="/studio/notes"
          itemLabel="note"
          scheduledPublishAt={doc.scheduledPublishAt}
          scheduledUnpublishAt={doc.scheduledUnpublishAt}
          schedulePublish={schedulePublish}
          scheduleUnpublish={scheduleUnpublish}
          cancelSchedule={cancelSchedule}
          archive={archive}
          restoreArchive={restoreArchive}
        />
      </div>

      {canEdit ? (
        <EditNoteForm id={id} initialValues={initialValues} isDraft={doc.status === "draft"} />
      ) : (
        <Text tone="muted">You don&apos;t have permission to edit this note.</Text>
      )}
    </>
  );
}
