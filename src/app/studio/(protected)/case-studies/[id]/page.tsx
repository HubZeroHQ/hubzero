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
} from "@/actions/studio/case-studies";
import { EditCaseStudyForm } from "@/app/studio/(protected)/case-studies/[id]/edit-case-study-form";
import { CommentList } from "@/components/admin/comment-list";
import { CommentThread } from "@/components/admin/comment-thread";
import { PageHeader } from "@/components/admin/page-header";
import { ReviewActions } from "@/components/admin/review-actions";
import { WorkflowActions } from "@/components/admin/workflow-actions";
import { WorkflowStatusBadge } from "@/components/admin/workflow-status-badge";
import { Heading, Link, Text } from "@/components/ui";
import type { CaseStudyInput } from "@/lib/cms/collections/case-study-fields";
import { listComments } from "@/lib/cms/comments";
import { can } from "@/lib/cms/permissions";
import { requireSessionUser } from "@/lib/cms/session";

interface EditCaseStudyPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Edit Case Study — HubZero Studio",
};

export default async function EditCaseStudyPage({ params }: EditCaseStudyPageProps) {
  const { id } = await params;

  const user = await requireSessionUser();
  if (!can(user, "view", "caseStudy")) redirect("/studio");

  const doc = await getOne(id);
  if (!doc) notFound();

  const target = { createdBy: doc.createdBy };
  const canEdit = can(user, "edit", "caseStudy", target);
  const canPublish = can(user, "publish", "caseStudy", target);
  const canDelete = can(user, "delete", "caseStudy", target);
  const canReview = can(user, "approve", "caseStudy", target);
  const reviewComments = (await listComments("caseStudy", id)).filter(
    (comment) => comment.type === "review",
  );

  const initialValues: Partial<CaseStudyInput> = {
    slug: doc.slug,
    client: doc.client,
    industry: doc.industry,
    practiceArea: doc.practiceArea,
    summary: doc.summary,
    content: doc.content,
    techTags: doc.techTags,
    // `coverImage` is now a `Media` reference, not in `ClientDocument`'s
    // date/ObjectId whitelist (`types/cms.ts`) — same treatment as
    // `team/[id]/page.tsx`'s `linkedUserId`.
    coverImage: doc.coverImage ? String(doc.coverImage) : undefined,
    contributors: (doc.contributors ?? []).map((memberId) => String(memberId)),
    featured: doc.featured,
  };

  return (
    <>
      <PageHeader
        title={doc.client}
        description={doc.industry}
        breadcrumb={[
          { label: "Case Studies", href: "/studio/case-studies" },
          { label: doc.client },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <Link href={`/studio/history/caseStudy/${id}`}>View history →</Link>
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
          listHref="/studio/case-studies"
          itemLabel="case study"
          publishDescription="It goes live at /work immediately."
          republishDescription="This records the current live content as a new version, then updates /work immediately."
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
          itemLabel="case study"
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
        <EditCaseStudyForm
          key={doc.updatedAt}
          id={id}
          initialValues={initialValues}
          isDraft={doc.status === "draft"}
        />
      ) : (
        <Text tone="muted">You don&apos;t have permission to edit this case study.</Text>
      )}

      <div className="mt-8">
        <Heading level={3} className="mb-3">
          Comments
        </Heading>
        <CommentThread resource="caseStudy" documentId={id} />
      </div>
    </>
  );
}
