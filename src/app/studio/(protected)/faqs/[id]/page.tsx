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
} from "@/actions/studio/faqs";
import { EditFaqForm } from "@/app/studio/(protected)/faqs/[id]/edit-faq-form";
import { CommentThread } from "@/components/admin/comment-thread";
import { PageHeader } from "@/components/admin/page-header";
import { WorkflowActions } from "@/components/admin/workflow-actions";
import { WorkflowStatusBadge } from "@/components/admin/workflow-status-badge";
import { Heading, Link, Text } from "@/components/ui";
import type { FaqInput } from "@/lib/cms/collections/faq-fields";
import { can } from "@/lib/cms/permissions";
import { requireSessionUser } from "@/lib/cms/session";

interface EditFaqPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Edit FAQ — HubZero Studio",
};

export default async function EditFaqPage({ params }: EditFaqPageProps) {
  const { id } = await params;

  const user = await requireSessionUser();
  if (!can(user, "view", "faq")) redirect("/studio");

  const doc = await getOne(id);
  if (!doc) notFound();

  const target = { createdBy: doc.createdBy };
  const canEdit = can(user, "edit", "faq", target);
  const canPublish = can(user, "publish", "faq", target);
  const canDelete = can(user, "delete", "faq", target);

  const initialValues: Partial<FaqInput> = {
    question: doc.question,
    answer: doc.answer,
    category: doc.category,
    order: doc.order,
  };

  return (
    <>
      <PageHeader
        title={doc.question}
        description={doc.category}
        breadcrumb={[{ label: "FAQs", href: "/studio/faqs" }, { label: doc.question }]}
        actions={
          <div className="flex items-center gap-3">
            <Link href={`/studio/history/faq/${id}`}>View history →</Link>
            <WorkflowStatusBadge status={doc.status} />
          </div>
        }
      />

      <div className="mb-6">
        <WorkflowActions
          id={id}
          status={doc.status}
          workflow="draft-publish"
          canSubmitForReview={false}
          canPublish={canPublish}
          canDelete={canDelete}
          publish={publish}
          remove={remove}
          listHref="/studio/faqs"
          itemLabel="FAQ"
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
        <EditFaqForm id={id} initialValues={initialValues} isDraft={doc.status === "draft"} />
      ) : (
        <Text tone="muted">You don&apos;t have permission to edit this FAQ.</Text>
      )}

      <div className="mt-8">
        <Heading level={3} className="mb-3">
          Comments
        </Heading>
        <CommentThread resource="faq" documentId={id} />
      </div>
    </>
  );
}
