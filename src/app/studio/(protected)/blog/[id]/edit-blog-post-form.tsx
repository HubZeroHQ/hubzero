"use client";

import { autosaveDraft, update } from "@/actions/studio/blog-posts";
import { CmsEditForm } from "@/components/admin/form/cms-edit-form";
import { blogPostFormFields, type BlogPostInput } from "@/lib/cms/collections/blog-post-fields";

export interface EditBlogPostFormProps {
  id: string;
  initialValues: Partial<BlogPostInput>;
  isDraft: boolean;
}

export function EditBlogPostForm({ id, initialValues, isDraft }: EditBlogPostFormProps) {
  return (
    <CmsEditForm<BlogPostInput>
      fields={blogPostFormFields}
      initialValues={initialValues}
      updateAction={update.bind(null, id)}
      autosaveAction={(values) => autosaveDraft(id, values)}
      isDraft={isDraft}
    />
  );
}
