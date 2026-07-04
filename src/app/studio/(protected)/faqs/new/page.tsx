import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { NewFaqForm } from "@/app/studio/(protected)/faqs/new/new-faq-form";
import { PageHeader } from "@/components/admin/page-header";
import { can } from "@/lib/cms/permissions";
import { requireSessionUser } from "@/lib/cms/session";

export const metadata: Metadata = {
  title: "New FAQ — HubZero Studio",
};

export default async function NewFaqPage() {
  const user = await requireSessionUser();
  if (!can(user, "create", "faq")) redirect("/studio/faqs");

  return (
    <>
      <PageHeader
        title="New FAQ"
        breadcrumb={[{ label: "FAQs", href: "/studio/faqs" }, { label: "New" }]}
      />
      <NewFaqForm />
    </>
  );
}
