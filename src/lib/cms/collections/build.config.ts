import {
  buildEmptyStateMessage,
  buildFilters,
  buildFormFields,
  buildListColumns,
  buildSchema,
  type BuildInput,
} from "@/lib/cms/collections/build-fields";
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
    revalidatesPaths: () => [],
  }),
);
