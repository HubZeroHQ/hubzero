import {
  buildEmptyStateMessage,
  buildFilters,
  buildFormFields,
  buildListColumns,
  buildSchema,
  type BuildInput,
} from "@/lib/cms/collections/build-fields";
import { computeReadingTimeMinutes } from "@/lib/cms/blocks/text";
import { defineCollection, registerCollection } from "@/lib/cms/collection-config";
import { Build, type BuildDocument } from "@/models/build";

export const buildConfig = registerCollection(
  defineCollection<BuildDocument, BuildInput>({
    resource: "build",
    label: "Builds",
    model: Build,
    zodSchema: buildSchema,
    workflow: "draft-review-publish",
    listColumns: buildListColumns,
    filters: buildFilters,
    formFields: buildFormFields,
    searchableFields: ["title", "slug", "tagline"],
    emptyStateMessage: buildEmptyStateMessage,
    studioBasePath: "builds",
    recordLabel: (doc) => doc.title,
    computedFields: (input) => ({ readingTimeMinutes: computeReadingTimeMinutes(input.content) }),
    // No public detail route exists for Builds yet
    // (`ARCHITECTURE/18_ARCHITECTURE_CHANGELOG.md`'s Phase D entry) — "/" is
    // still included since a Build can be a homepage-featured item
    // (`publicCard` below, `href: null`), which does have a public page.
    revalidatesPaths: () => ["/"],
    publicCard: (doc) => ({
      title: doc.title,
      summary: doc.tagline,
      href: null,
      coverImageId: doc.coverImage ? String(doc.coverImage) : undefined,
      techTags: Array.isArray(doc.techTags) ? doc.techTags : [],
      featured: doc.featured,
      readingTimeMinutes: doc.readingTimeMinutes,
      contributorIds: (doc.contributors ?? []).map(String),
    }),
  }),
);
