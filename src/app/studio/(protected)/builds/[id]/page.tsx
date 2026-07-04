import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { getOne, publish, remove, submitForReview } from "@/actions/studio/builds";
import { EditBuildForm } from "@/app/studio/(protected)/builds/[id]/edit-build-form";
import { PageHeader } from "@/components/admin/page-header";
import { WorkflowActions } from "@/components/admin/workflow-actions";
import { WorkflowStatusBadge } from "@/components/admin/workflow-status-badge";
import { Link, Text } from "@/components/ui";
import type { BuildInput } from "@/lib/cms/collections/build-fields";
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

  const initialValues: Partial<BuildInput> = {
    slug: doc.slug,
    title: doc.title,
    tagline: doc.tagline,
    practiceArea: doc.practiceArea,
    description: doc.description,
    techTags: doc.techTags,
    coverImage: doc.coverImage ?? undefined,
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
        />
        {doc.graduatedFromLabsId && (
          <Text size="caption" tone="muted">
            Graduated from Labs project{" "}
            <Link href={`/studio/labs/${doc.graduatedFromLabsId}`}>view →</Link>
          </Text>
        )}
      </div>

      {canEdit ? (
        <EditBuildForm id={id} initialValues={initialValues} isDraft={doc.status === "draft"} />
      ) : (
        <Text tone="muted">You don&apos;t have permission to edit this Build.</Text>
      )}
    </>
  );
}
