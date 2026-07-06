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
} from "@/actions/studio/testimonials";
import { EditTestimonialForm } from "@/app/studio/(protected)/testimonials/[id]/edit-testimonial-form";
import { CommentThread } from "@/components/admin/comment-thread";
import { PageHeader } from "@/components/admin/page-header";
import { WorkflowActions } from "@/components/admin/workflow-actions";
import { WorkflowStatusBadge } from "@/components/admin/workflow-status-badge";
import { Heading, Link, Text } from "@/components/ui";
import type { TestimonialInput } from "@/lib/cms/collections/testimonial-fields";
import { can } from "@/lib/cms/permissions";
import { requireSessionUser } from "@/lib/cms/session";

interface EditTestimonialPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Edit Testimonial — HubZero Studio",
};

export default async function EditTestimonialPage({ params }: EditTestimonialPageProps) {
  const { id } = await params;

  const user = await requireSessionUser();
  if (!can(user, "view", "testimonial")) redirect("/studio");

  const doc = await getOne(id);
  if (!doc) notFound();

  const target = { createdBy: doc.createdBy };
  const canEdit = can(user, "edit", "testimonial", target);
  const canPublish = can(user, "publish", "testimonial", target);
  const canDelete = can(user, "delete", "testimonial", target);

  const initialValues: Partial<TestimonialInput> = {
    quote: doc.quote,
    name: doc.name,
    title: doc.title,
    company: doc.company ?? undefined,
    linkedCaseStudy: doc.linkedCaseStudy ? String(doc.linkedCaseStudy) : undefined,
  };

  return (
    <>
      <PageHeader
        title={doc.name}
        description={doc.title}
        breadcrumb={[{ label: "Testimonials", href: "/studio/testimonials" }, { label: doc.name }]}
        actions={
          <div className="flex items-center gap-3">
            <Link href={`/studio/history/testimonial/${id}`}>View history →</Link>
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
          listHref="/studio/testimonials"
          itemLabel="testimonial"
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
        <EditTestimonialForm
          id={id}
          initialValues={initialValues}
          isDraft={doc.status === "draft"}
        />
      ) : (
        <Text tone="muted">You don&apos;t have permission to edit this testimonial.</Text>
      )}

      <div className="mt-8">
        <Heading level={3} className="mb-3">
          Comments
        </Heading>
        <CommentThread resource="testimonial" documentId={id} />
      </div>
    </>
  );
}
