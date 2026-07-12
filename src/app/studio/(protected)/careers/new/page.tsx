import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { NewCareerListingForm } from "@/app/studio/(protected)/careers/new/new-career-listing-form";
import { PageHeader } from "@/components/admin/page-header";
import { can } from "@/lib/cms/permissions";
import { requireSessionUser } from "@/lib/cms/session";

export const metadata: Metadata = {
  title: "New Career Listing — HubZero Studio",
};

export default async function NewCareerListingPage() {
  const user = await requireSessionUser();
  if (!can(user, "create", "careerListing")) redirect("/studio/careers");

  return (
    <>
      <PageHeader
        title="New career listing"
        breadcrumb={[{ label: "Careers", href: "/studio/careers" }, { label: "New" }]}
      />
      <NewCareerListingForm />
    </>
  );
}
