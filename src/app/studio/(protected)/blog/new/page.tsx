import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { NewBlogPostForm } from "@/app/studio/(protected)/blog/new/new-blog-post-form";
import { PageHeader } from "@/components/admin/page-header";
import { can } from "@/lib/cms/permissions";
import { requireSessionUser } from "@/lib/cms/session";

export const metadata: Metadata = {
  title: "New Blog Post — HubZero Studio",
};

export default async function NewBlogPostPage() {
  const user = await requireSessionUser();
  if (!can(user, "create", "blogPost")) redirect("/studio/blog");

  return (
    <>
      <PageHeader
        title="New blog post"
        breadcrumb={[{ label: "Blog", href: "/studio/blog" }, { label: "New" }]}
      />
      <NewBlogPostForm />
    </>
  );
}
