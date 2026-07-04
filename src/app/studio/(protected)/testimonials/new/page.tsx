import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { NewTestimonialForm } from "@/app/studio/(protected)/testimonials/new/new-testimonial-form";
import { PageHeader } from "@/components/admin/page-header";
import { can } from "@/lib/cms/permissions";
import { requireSessionUser } from "@/lib/cms/session";

export const metadata: Metadata = {
  title: "New Testimonial — HubZero Studio",
};

export default async function NewTestimonialPage() {
  const user = await requireSessionUser();
  if (!can(user, "create", "testimonial")) redirect("/studio/testimonials");

  return (
    <>
      <PageHeader
        title="New testimonial"
        breadcrumb={[{ label: "Testimonials", href: "/studio/testimonials" }, { label: "New" }]}
      />
      <NewTestimonialForm />
    </>
  );
}
