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
} from "@/actions/studio/labs-projects";
import { EditLabsProjectForm } from "@/app/studio/(protected)/labs/[id]/edit-labs-project-form";
import { GraduateToBuildForm } from "@/app/studio/(protected)/labs/[id]/graduate-to-build-form";
import { PageHeader } from "@/components/admin/page-header";
import { WorkflowActions } from "@/components/admin/workflow-actions";
import { WorkflowStatusBadge } from "@/components/admin/workflow-status-badge";
import { Link, Text } from "@/components/ui";
import type { LabsProjectInput } from "@/lib/cms/collections/labs-project-fields";
import { can } from "@/lib/cms/permissions";
import { requireSessionUser } from "@/lib/cms/session";

interface EditLabsProjectPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Edit Labs Project — HubZero Studio",
};

export default async function EditLabsProjectPage({ params }: EditLabsProjectPageProps) {
  const { id } = await params;

  const user = await requireSessionUser();
  if (!can(user, "view", "labsProject")) redirect("/studio");

  const doc = await getOne(id);
  if (!doc) notFound();

  const target = { createdBy: doc.createdBy };
  const canEdit = can(user, "edit", "labsProject", target);
  const canPublish = can(user, "publish", "labsProject", target);
  const canDelete = can(user, "delete", "labsProject", target);

  const initialValues: Partial<LabsProjectInput> = {
    slug: doc.slug,
    title: doc.title,
    practiceArea: doc.practiceArea,
    summary: doc.summary,
    content: doc.content,
    techTags: doc.techTags,
    coverImage: doc.coverImage ? String(doc.coverImage) : undefined,
    contributors: (doc.contributors ?? []).map((memberId) => String(memberId)),
    featured: doc.featured,
    stage: doc.stage === "graduated" ? undefined : doc.stage,
  };

  return (
    <>
      <PageHeader
        title={doc.title}
        description={doc.practiceArea}
        breadcrumb={[{ label: "Labs Projects", href: "/studio/labs" }, { label: doc.title }]}
        actions={
          <div className="flex items-center gap-3">
            <Link href={`/studio/history/labsProject/${id}`}>View history →</Link>
            <WorkflowStatusBadge status={doc.status} />
          </div>
        }
      />

      <div className="mb-6 flex flex-col gap-4">
        <WorkflowActions
          id={id}
          status={doc.status}
          workflow="draft-publish"
          canSubmitForReview={false}
          canPublish={canPublish}
          canDelete={canDelete}
          publish={publish}
          remove={remove}
          listHref="/studio/labs"
          itemLabel="Labs project"
          scheduledPublishAt={doc.scheduledPublishAt}
          scheduledUnpublishAt={doc.scheduledUnpublishAt}
          schedulePublish={schedulePublish}
          scheduleUnpublish={scheduleUnpublish}
          cancelSchedule={cancelSchedule}
          archive={archive}
          restoreArchive={restoreArchive}
        />
        {canEdit && doc.stage !== "graduated" && <GraduateToBuildForm labsProjectId={id} />}
        {doc.stage === "graduated" && (
          <Text size="caption" tone="muted">
            Graduated to Build{" "}
            {doc.graduatedToBuildId ? (
              <Link href={`/studio/builds/${doc.graduatedToBuildId}`}>view →</Link>
            ) : null}
          </Text>
        )}
      </div>

      {canEdit ? (
        <EditLabsProjectForm
          id={id}
          initialValues={initialValues}
          isDraft={doc.status === "draft"}
        />
      ) : (
        <Text tone="muted">You don&apos;t have permission to edit this project.</Text>
      )}
    </>
  );
}
