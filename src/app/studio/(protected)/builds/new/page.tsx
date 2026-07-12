import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { NewBuildForm } from "@/app/studio/(protected)/builds/new/new-build-form";
import { PageHeader } from "@/components/admin/page-header";
import { can } from "@/lib/cms/permissions";
import { requireSessionUser } from "@/lib/cms/session";

export const metadata: Metadata = {
  title: "New Build — HubZero Studio",
};

export default async function NewBuildPage() {
  const user = await requireSessionUser();
  if (!can(user, "create", "build")) redirect("/studio/builds");

  return (
    <>
      <PageHeader
        title="New Build"
        breadcrumb={[{ label: "Builds", href: "/studio/builds" }, { label: "New" }]}
      />
      <NewBuildForm />
    </>
  );
}
