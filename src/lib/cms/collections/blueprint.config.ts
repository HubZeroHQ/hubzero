import {
  blueprintEmptyStateMessage,
  blueprintFilters,
  blueprintFormFields,
  blueprintListColumns,
  blueprintSchema,
  type BlueprintInput,
} from "@/lib/cms/collections/blueprint-fields";
import { computeReadingTimeMinutes } from "@/lib/cms/blocks/text";
import { defineCollection, registerCollection } from "@/lib/cms/collection-config";
import { Blueprint, type BlueprintDocument } from "@/models/blueprint";

export const blueprintConfig = registerCollection(
  defineCollection<BlueprintDocument, BlueprintInput>({
    resource: "blueprint",
    label: "Blueprints",
    model: Blueprint,
    zodSchema: blueprintSchema,
    workflow: "draft-review-publish",
    listColumns: blueprintListColumns,
    filters: blueprintFilters,
    formFields: blueprintFormFields,
    searchableFields: ["name", "slug", "blueprintId", "category"],
    emptyStateMessage: blueprintEmptyStateMessage,
    studioBasePath: "blueprints",
    quickCreateLabel: "New Blueprint",
    publicRoute: { prefix: "blueprints", slugField: "slug" },
    recordLabel: (doc) => doc.name,
    computedFields: (input) => ({ readingTimeMinutes: computeReadingTimeMinutes(input.content) }),
    // `09_CMS_ARCHITECTURE.md` §2 / `ARCHITECTURE/19_CMS_FOUNDATION.md` §11:
    // "publishing is gated on demoStatus: 'live' — a Blueprint with a stale
    // or nonexistent demo is not shown publicly." The sanctioned
    // `publishGuard` hook, not a Blueprint-specific fork of `publish()`.
    publishGuard: (doc) =>
      doc.demoStatus === "live"
        ? null
        : 'This Blueprint can only be published while its demo status is "Live".',
    // `/blueprints` and `/blueprints/[slug]` are real public pages as of this
    // change — same ISR-on-publish wiring as CaseStudy/LabsProject/Note. "/"
    // is included since a Blueprint can be a homepage-featured item
    // (`publicCard` below).
    revalidatesPaths: (doc) => ["/", "/blueprints", `/blueprints/${doc.slug}`],
    publicCard: (doc) => ({
      title: doc.name,
      summary: doc.summary,
      href: `/blueprints/${doc.slug}`,
      coverImageId: doc.coverImage ? String(doc.coverImage) : undefined,
      techTags: Array.isArray(doc.techStack) ? doc.techStack : [],
      featured: doc.featured,
      readingTimeMinutes: doc.readingTimeMinutes,
      contributorIds: (doc.contributors ?? []).map(String),
    }),
  }),
);
