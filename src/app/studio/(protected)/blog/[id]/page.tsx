import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { getOne, publish, remove, submitForReview } from "@/actions/studio/blog-posts";
import { EditBlogPostForm } from "@/app/studio/(protected)/blog/[id]/edit-blog-post-form";
import { PageHeader } from "@/components/admin/page-header";
import { WorkflowActions } from "@/components/admin/workflow-actions";
import { WorkflowStatusBadge } from "@/components/admin/workflow-status-badge";
import { Link, Text } from "@/components/ui";
import type { BlogPostInput } from "@/lib/cms/collections/blog-post-fields";
import { can } from "@/lib/cms/permissions";
import { requireSessionUser } from "@/lib/cms/session";

interface EditBlogPostPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Edit Blog Post — HubZero Studio",
};

export default async function EditBlogPostPage({ params }: EditBlogPostPageProps) {
  const { id } = await params;

  const user = await requireSessionUser();
  if (!can(user, "view", "blogPost")) redirect("/studio");

  const doc = await getOne(id);
  if (!doc) notFound();

  const target = { createdBy: doc.createdBy };
  const canEdit = can(user, "edit", "blogPost", target);
  const canPublish = can(user, "publish", "blogPost", target);
  const canDelete = can(user, "delete", "blogPost", target);

  const initialValues: Partial<BlogPostInput> = {
    slug: doc.slug,
    title: doc.title,
    summary: doc.summary,
    body: doc.body,
    // `authorId` isn't in `ClientDocument`'s date/ObjectId whitelist
    // (`types/cms.ts`) — same treatment as `team/[id]/page.tsx`'s
    // `linkedUserId`.
    authorId: String(doc.authorId),
    category: doc.category,
    tags: doc.tags,
    coverImage: doc.coverImage ?? undefined,
  };

  return (
    <>
      <PageHeader
        title={doc.title}
        description={`${doc.category} · ${doc.readingTimeMinutes} min read`}
        breadcrumb={[{ label: "Blog", href: "/studio/blog" }, { label: doc.title }]}
        actions={
          <div className="flex items-center gap-3">
            <Link href={`/studio/history/blogPost/${id}`}>View history →</Link>
            <WorkflowStatusBadge status={doc.status} />
          </div>
        }
      />

      <div className="mb-6">
        <WorkflowActions
          id={id}
          status={doc.status}
          workflow="draft-review-publish"
          canSubmitForReview={canEdit}
          canPublish={canPublish}
          canDelete={canDelete}
          submitForReview={submitForReview}
          publish={publish}
          remove={remove}
          listHref="/studio/blog"
          itemLabel="blog post"
        />
      </div>

      {canEdit ? (
        <EditBlogPostForm id={id} initialValues={initialValues} isDraft={doc.status === "draft"} />
      ) : (
        <Text tone="muted">You don&apos;t have permission to edit this post.</Text>
      )}
    </>
  );
}
