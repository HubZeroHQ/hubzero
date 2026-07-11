import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import {
  approve,
  archive,
  cancelSchedule,
  getOne,
  publish,
  reject,
  remove,
  requestChanges,
  restoreArchive,
  schedulePublish,
  scheduleUnpublish,
  submitForReview,
} from "@/actions/studio/blueprints";
import { EditBlueprintForm } from "@/app/studio/(protected)/blueprints/[id]/edit-blueprint-form";
import { CommentList } from "@/components/admin/comment-list";
import { CommentThread } from "@/components/admin/comment-thread";
import { PageHeader } from "@/components/admin/page-header";
import { ReviewActions } from "@/components/admin/review-actions";
import { WorkflowActions } from "@/components/admin/workflow-actions";
import { WorkflowStatusBadge } from "@/components/admin/workflow-status-badge";
import { Heading, Link, Text } from "@/components/ui";
import type { BlueprintInput } from "@/lib/cms/collections/blueprint-fields";
import { listComments } from "@/lib/cms/comments";
import { can } from "@/lib/cms/permissions";
import { requireSessionUser } from "@/lib/cms/session";

interface EditBlueprintPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Edit Blueprint — HubZero Studio",
};

export default async function EditBlueprintPage({ params }: EditBlueprintPageProps) {
  const { id } = await params;

  const user = await requireSessionUser();
  if (!can(user, "view", "blueprint")) redirect("/studio");

  const doc = await getOne(id);
  if (!doc) notFound();

  const target = { createdBy: doc.createdBy };
  const canEdit = can(user, "edit", "blueprint", target);
  const canPublish = can(user, "publish", "blueprint", target);
  const canDelete = can(user, "delete", "blueprint", target);
  const canReview = can(user, "approve", "blueprint", target);
  const reviewComments = (await listComments("blueprint", id)).filter(
    (comment) => comment.type === "review",
  );

  const initialValues: Partial<BlueprintInput> = {
    blueprintId: doc.blueprintId,
    slug: doc.slug,
    name: doc.name,
    category: doc.category,
    summary: doc.summary,
    content: doc.content,
    techStack: doc.techStack,
    coverImage: doc.coverImage ? String(doc.coverImage) : undefined,
    contributors: (doc.contributors ?? []).map((memberId) => String(memberId)),
    featured: doc.featured,
    previewUrl: doc.previewUrl ?? undefined,
    demoDeploymentUrl: doc.demoDeploymentUrl ?? undefined,
    demoStatus: doc.demoStatus,
  };

  return (
    <>
      <PageHeader
        title={doc.name}
        description={doc.category}
        breadcrumb={[{ label: "Blueprints", href: "/studio/blueprints" }, { label: doc.name }]}
        actions={
          <div className="flex items-center gap-3">
            <Link href={`/studio/history/blueprint/${id}`}>View history →</Link>
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
          listHref="/studio/blueprints"
          itemLabel="Blueprint"
          publishDescription='Blocked unless demo status is "Live" — see below.'
          republishDescription="This records the current content as a new version."
          scheduledPublishAt={doc.scheduledPublishAt}
          scheduledUnpublishAt={doc.scheduledUnpublishAt}
          schedulePublish={schedulePublish}
          scheduleUnpublish={scheduleUnpublish}
          cancelSchedule={cancelSchedule}
          archive={archive}
          restoreArchive={restoreArchive}
        />
      </div>

      <div className="mb-6">
        <ReviewActions
          id={id}
          status={doc.status}
          canReview={canReview}
          approve={approve}
          requestChanges={requestChanges}
          reject={reject}
          itemLabel="Blueprint"
        />
      </div>

      {reviewComments.length > 0 && (
        <div className="mb-6">
          <Heading level={3} className="mb-3">
            Review comments
          </Heading>
          <CommentList comments={reviewComments} emptyMessage="No review comments yet." />
        </div>
      )}

      {canEdit ? (
        <EditBlueprintForm id={id} initialValues={initialValues} isDraft={doc.status === "draft"} />
      ) : (
        <Text tone="muted">You don&apos;t have permission to edit this Blueprint.</Text>
      )}

      <div className="mt-8">
        <Heading level={3} className="mb-3">
          Comments
        </Heading>
        <CommentThread resource="blueprint" documentId={id} />
      </div>
    </>
  );
}
