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
} from "@/actions/studio/builds";
import { EditBuildForm } from "@/app/studio/(protected)/builds/[id]/edit-build-form";
import { CommentList } from "@/components/admin/comment-list";
import { CommentThread } from "@/components/admin/comment-thread";
import { PageHeader } from "@/components/admin/page-header";
import { ReviewActions } from "@/components/admin/review-actions";
import { WorkflowActions } from "@/components/admin/workflow-actions";
import { WorkflowStatusBadge } from "@/components/admin/workflow-status-badge";
import { Heading, Link, Text } from "@/components/ui";
import type { BuildInput } from "@/lib/cms/collections/build-fields";
import { listComments } from "@/lib/cms/comments";
import { can } from "@/lib/cms/permissions";
import { requireSessionUser } from "@/lib/cms/session";

interface EditBuildPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Edit Build — HubZero Studio",
};

export default async function EditBuildPage({ params }: EditBuildPageProps) {
  const { id } = await params;

  const user = await requireSessionUser();
  if (!can(user, "view", "build")) redirect("/studio");

  const doc = await getOne(id);
  if (!doc) notFound();

  const target = { createdBy: doc.createdBy };
  const canEdit = can(user, "edit", "build", target);
  const canPublish = can(user, "publish", "build", target);
  const canDelete = can(user, "delete", "build", target);
  const canReview = can(user, "approve", "build", target);
  const reviewComments = (await listComments("build", id)).filter(
    (comment) => comment.type === "review",
  );

  const initialValues: Partial<BuildInput> = {
    slug: doc.slug,
    title: doc.title,
    tagline: doc.tagline,
    practiceArea: doc.practiceArea,
    content: doc.content,
    techTags: doc.techTags,
    coverImage: doc.coverImage ? String(doc.coverImage) : undefined,
    contributors: (doc.contributors ?? []).map((memberId) => String(memberId)),
    featured: doc.featured,
    // `launchDate` isn't in `ClientDocument`'s fixed date-field whitelist
    // (`types/cms.ts`), so it keeps its storage-side `Date` type even though
    // it's a serialized ISO string at runtime — the same treatment
    // `team/[id]/page.tsx` documents for its own reference/subdocument
    // fields. Sliced to `YYYY-MM-DD` for the `date`-type input.
    launchDate: String(doc.launchDate).slice(0, 10),
    liveUrl: doc.liveUrl ?? undefined,
    repoUrl: doc.repoUrl ?? undefined,
  };

  return (
    <>
      <PageHeader
        title={doc.title}
        description={doc.tagline}
        breadcrumb={[{ label: "Builds", href: "/studio/builds" }, { label: doc.title }]}
        actions={
          <div className="flex items-center gap-3">
            <Link href={`/studio/history/build/${id}`}>View history →</Link>
            <WorkflowStatusBadge status={doc.status} />
          </div>
        }
      />

      <div className="mb-6 flex flex-col gap-3">
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
          listHref="/studio/builds"
          itemLabel="Build"
          scheduledPublishAt={doc.scheduledPublishAt}
          scheduledUnpublishAt={doc.scheduledUnpublishAt}
          schedulePublish={schedulePublish}
          scheduleUnpublish={scheduleUnpublish}
          cancelSchedule={cancelSchedule}
          archive={archive}
          restoreArchive={restoreArchive}
        />
        {doc.graduatedFromLabsId && (
          <Text size="caption" tone="muted">
            Graduated from Labs project{" "}
            <Link href={`/studio/labs/${doc.graduatedFromLabsId}`}>view →</Link>
          </Text>
        )}
      </div>

      <div className="mb-6">
        <ReviewActions
          id={id}
          status={doc.status}
          canReview={canReview}
          approve={approve}
          requestChanges={requestChanges}
          reject={reject}
          itemLabel="Build"
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
        <EditBuildForm id={id} initialValues={initialValues} isDraft={doc.status === "draft"} />
      ) : (
        <Text tone="muted">You don&apos;t have permission to edit this Build.</Text>
      )}

      <div className="mt-8">
        <Heading level={3} className="mb-3">
          Comments
        </Heading>
        <CommentThread resource="build" documentId={id} />
      </div>
    </>
  );
}
