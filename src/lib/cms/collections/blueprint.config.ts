import {
  blueprintEmptyStateMessage,
  blueprintFilters,
  blueprintFormFields,
  blueprintListColumns,
  blueprintSchema,
  type BlueprintInput,
} from "@/lib/cms/collections/blueprint-fields";
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
    recordLabel: (doc) => doc.name,
    // `09_CMS_ARCHITECTURE.md` §2 / `ARCHITECTURE/19_CMS_FOUNDATION.md` §11:
    // "publishing is gated on demoStatus: 'live' — a Blueprint with a stale
    // or nonexistent demo is not shown publicly." The sanctioned
    // `publishGuard` hook, not a Blueprint-specific fork of `publish()`.
    publishGuard: (doc) =>
      doc.demoStatus === "live"
        ? null
        : 'This Blueprint can only be published while its demo status is "Live".',
    revalidatesPaths: () => [],
  }),
);
