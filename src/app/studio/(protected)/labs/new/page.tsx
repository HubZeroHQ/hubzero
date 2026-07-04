import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { NewLabsProjectForm } from "@/app/studio/(protected)/labs/new/new-labs-project-form";
import { PageHeader } from "@/components/admin/page-header";
import { can } from "@/lib/cms/permissions";
import { requireSessionUser } from "@/lib/cms/session";

export const metadata: Metadata = {
  title: "New Labs Project — HubZero Studio",
};

export default async function NewLabsProjectPage() {
  const user = await requireSessionUser();
  if (!can(user, "create", "labsProject")) redirect("/studio/labs");

  return (
    <>
      <PageHeader
        title="New Labs project"
        breadcrumb={[{ label: "Labs Projects", href: "/studio/labs" }, { label: "New" }]}
      />
      <NewLabsProjectForm />
    </>
  );
}
