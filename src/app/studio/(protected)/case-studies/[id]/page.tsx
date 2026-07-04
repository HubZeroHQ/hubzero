import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { getOne } from "@/actions/studio/case-studies";
import { CaseStudyWorkflowActions } from "@/app/studio/(protected)/case-studies/[id]/case-study-workflow-actions";
import { EditCaseStudyForm } from "@/app/studio/(protected)/case-studies/[id]/edit-case-study-form";
import { PageHeader } from "@/components/admin/page-header";
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
    coverImage: doc.coverImage ?? undefined,
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
        <CaseStudyWorkflowActions
          id={id}
          status={doc.status}
          canSubmitForReview={canEdit}
          canPublish={canPublish}
          canDelete={canDelete}
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
