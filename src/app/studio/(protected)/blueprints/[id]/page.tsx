import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { getOne, publish, remove, submitForReview } from "@/actions/studio/blueprints";
import { EditBlueprintForm } from "@/app/studio/(protected)/blueprints/[id]/edit-blueprint-form";
import { PageHeader } from "@/components/admin/page-header";
import { WorkflowActions } from "@/components/admin/workflow-actions";
import { WorkflowStatusBadge } from "@/components/admin/workflow-status-badge";
import { Link, Text } from "@/components/ui";
import type { BlueprintInput } from "@/lib/cms/collections/blueprint-fields";
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

  const initialValues: Partial<BlueprintInput> = {
    blueprintId: doc.blueprintId,
    slug: doc.slug,
    name: doc.name,
    category: doc.category,
    description: doc.description,
    techStack: doc.techStack,
    coverImage: doc.coverImage ? String(doc.coverImage) : undefined,
    previewUrl: doc.previewUrl ?? undefined,
    demoDeploymentUrl: doc.demoDeploymentUrl ?? undefined,
    customizationNotes: doc.customizationNotes ?? undefined,
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
        />
      </div>

      {canEdit ? (
        <EditBlueprintForm id={id} initialValues={initialValues} isDraft={doc.status === "draft"} />
      ) : (
        <Text tone="muted">You don&apos;t have permission to edit this Blueprint.</Text>
      )}
    </>
  );
}
