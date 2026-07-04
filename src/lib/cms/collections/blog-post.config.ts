import {
  blogPostEmptyStateMessage,
  blogPostFilters,
  blogPostFormFields,
  blogPostListColumns,
  blogPostSchema,
  computeReadingTimeMinutes,
  type BlogPostInput,
} from "@/lib/cms/collections/blog-post-fields";
import { defineCollection, registerCollection } from "@/lib/cms/collection-config";
import { BlogPost, type BlogPostDocument } from "@/models/blog-post";

export const blogPostConfig = registerCollection(
  defineCollection<BlogPostDocument, BlogPostInput>({
    resource: "blogPost",
    label: "Blog Posts",
    model: BlogPost,
    zodSchema: blogPostSchema,
    workflow: "draft-review-publish",
    listColumns: blogPostListColumns,
    filters: blogPostFilters,
    formFields: blogPostFormFields,
    searchableFields: ["title", "slug", "category"],
    emptyStateMessage: blogPostEmptyStateMessage,
    studioBasePath: "blog",
    recordLabel: (doc) => doc.title,
    // "Computed on save, not author-entered" (`ARCHITECTURE/11_DATABASE_ARCHITECTURE.md`
    // §1) — the sanctioned `computedFields` hook, not a bespoke code path.
    computedFields: (input) => ({ readingTimeMinutes: computeReadingTimeMinutes(input.body) }),
    revalidatesPaths: () => [],
  }),
);
