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
} from "@/actions/studio/career-listings";
import { EditCareerListingForm } from "@/app/studio/(protected)/careers/[id]/edit-career-listing-form";
import { PageHeader } from "@/components/admin/page-header";
import { WorkflowActions } from "@/components/admin/workflow-actions";
import { WorkflowStatusBadge } from "@/components/admin/workflow-status-badge";
import { Link, Text } from "@/components/ui";
import type { CareerListingInput } from "@/lib/cms/collections/career-listing-fields";
import { can } from "@/lib/cms/permissions";
import { requireSessionUser } from "@/lib/cms/session";

interface EditCareerListingPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Edit Career Listing — HubZero Studio",
};

export default async function EditCareerListingPage({ params }: EditCareerListingPageProps) {
  const { id } = await params;

  const user = await requireSessionUser();
  if (!can(user, "view", "careerListing")) redirect("/studio");

  const doc = await getOne(id);
  if (!doc) notFound();

  const target = { createdBy: doc.createdBy };
  const canEdit = can(user, "edit", "careerListing", target);
  const canPublish = can(user, "publish", "careerListing", target);
  const canDelete = can(user, "delete", "careerListing", target);

  const initialValues: Partial<CareerListingInput> = {
    title: doc.title,
    description: doc.description,
    requirements: doc.requirements,
    listingStatus: doc.listingStatus,
  };

  return (
    <>
      <PageHeader
        title={doc.title}
        breadcrumb={[{ label: "Careers", href: "/studio/careers" }, { label: doc.title }]}
        actions={
          <div className="flex items-center gap-3">
            <Link href={`/studio/history/careerListing/${id}`}>View history →</Link>
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
          listHref="/studio/careers"
          itemLabel="career listing"
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
        <EditCareerListingForm
          id={id}
          initialValues={initialValues}
          isDraft={doc.status === "draft"}
        />
      ) : (
        <Text tone="muted">You don&apos;t have permission to edit this listing.</Text>
      )}
    </>
  );
}
