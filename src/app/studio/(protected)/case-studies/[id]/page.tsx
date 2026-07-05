import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { getOne, publish, remove, submitForReview } from "@/actions/studio/case-studies";
import { EditCaseStudyForm } from "@/app/studio/(protected)/case-studies/[id]/edit-case-study-form";
import { PageHeader } from "@/components/admin/page-header";
import { WorkflowActions } from "@/components/admin/workflow-actions";
import { WorkflowStatusBadge } from "@/components/admin/workflow-status-badge";
import { Link, Text } from "@/components/ui";
import type { CaseStudyInput } from "@/lib/cms/collections/case-study-fields";
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

  const initialValues: Partial<CaseStudyInput> = {
    slug: doc.slug,
    client: doc.client,
    industry: doc.industry,
    practiceArea: doc.practiceArea,
    problem: doc.problem,
    approach: doc.approach,
    result: doc.result,
    techTags: doc.techTags,
    // `coverImage` is now a `Media` reference, not in `ClientDocument`'s
    // date/ObjectId whitelist (`types/cms.ts`) — same treatment as
    // `team/[id]/page.tsx`'s `linkedUserId`.
    coverImage: doc.coverImage ? String(doc.coverImage) : undefined,
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
        />
      </div>

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
    </>
  );
}
