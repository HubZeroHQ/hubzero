import {
  labsProjectEmptyStateMessage,
  labsProjectFilters,
  labsProjectFormFields,
  labsProjectListColumns,
  labsProjectSchema,
  type LabsProjectInput,
} from "@/lib/cms/collections/labs-project-fields";
import { computeReadingTimeMinutes } from "@/lib/cms/blocks/text";
import { defineCollection, registerCollection } from "@/lib/cms/collection-config";
import { LabsProject, type LabsProjectDocument } from "@/models/labs-project";

export const labsProjectConfig = registerCollection(
  defineCollection<LabsProjectDocument, LabsProjectInput>({
    resource: "labsProject",
    label: "Labs Projects",
    model: LabsProject,
    zodSchema: labsProjectSchema,
    workflow: "draft-publish",
    listColumns: labsProjectListColumns,
    filters: labsProjectFilters,
    formFields: labsProjectFormFields,
    searchableFields: ["title", "slug"],
    emptyStateMessage: labsProjectEmptyStateMessage,
    studioBasePath: "labs",
    recordLabel: (doc) => doc.title,
    // `isClientWork` is always `false` (`models/labs-project.ts`) — not a
    // form field, injected on every create/update, alongside the same
    // block-derived `readingTimeMinutes` computation every narrative
    // collection now shares.
    computedFields: (input) => ({
      isClientWork: false,
      readingTimeMinutes: computeReadingTimeMinutes(input.content),
    }),
    revalidatesPaths: (doc) => ["/labs", `/labs/${doc.slug}`],
  }),
);
