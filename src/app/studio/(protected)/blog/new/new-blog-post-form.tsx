"use client";

import { create } from "@/actions/studio/blog-posts";
import { CmsCreateForm } from "@/components/admin/form/cms-create-form";
import { blogPostFormFields, type BlogPostInput } from "@/lib/cms/collections/blog-post-fields";

export function NewBlogPostForm() {
  return (
    <CmsCreateForm<BlogPostInput>
      fields={blogPostFormFields}
      action={create}
      redirectTo={(id) => `/studio/blog/${id}`}
    />
  );
}
