import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { NewCaseStudyForm } from "@/app/studio/(protected)/case-studies/new/new-case-study-form";
import { PageHeader } from "@/components/admin/page-header";
import { can } from "@/lib/cms/permissions";
import { requireSessionUser } from "@/lib/cms/session";

export const metadata: Metadata = {
  title: "New Case Study — HubZero Studio",
};

export default async function NewCaseStudyPage() {
  const user = await requireSessionUser();
  if (!can(user, "create", "caseStudy")) redirect("/studio/case-studies");

  return (
    <>
      <PageHeader
        title="New case study"
        breadcrumb={[{ label: "Case Studies", href: "/studio/case-studies" }, { label: "New" }]}
      />
      <NewCaseStudyForm />
    </>
  );
}
