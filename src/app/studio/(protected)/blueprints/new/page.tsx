import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { NewBlueprintForm } from "@/app/studio/(protected)/blueprints/new/new-blueprint-form";
import { PageHeader } from "@/components/admin/page-header";
import { can } from "@/lib/cms/permissions";
import { requireSessionUser } from "@/lib/cms/session";

export const metadata: Metadata = {
  title: "New Blueprint — HubZero Studio",
};

export default async function NewBlueprintPage() {
  const user = await requireSessionUser();
  if (!can(user, "create", "blueprint")) redirect("/studio/blueprints");

  return (
    <>
      <PageHeader
        title="New Blueprint"
        breadcrumb={[{ label: "Blueprints", href: "/studio/blueprints" }, { label: "New" }]}
      />
      <NewBlueprintForm />
    </>
  );
}
