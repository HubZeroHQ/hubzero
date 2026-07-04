import {
  careerListingEmptyStateMessage,
  careerListingFilters,
  careerListingFormFields,
  careerListingListColumns,
  careerListingSchema,
  type CareerListingInput,
} from "@/lib/cms/collections/career-listing-fields";
import { defineCollection, registerCollection } from "@/lib/cms/collection-config";
import { CareerListing, type CareerListingDocument } from "@/models/career-listing";

export const careerListingConfig = registerCollection(
  defineCollection<CareerListingDocument, CareerListingInput>({
    resource: "careerListing",
    label: "Careers",
    model: CareerListing,
    zodSchema: careerListingSchema,
    workflow: "draft-publish",
    listColumns: careerListingListColumns,
    filters: careerListingFilters,
    formFields: careerListingFormFields,
    searchableFields: ["title"],
    emptyStateMessage: careerListingEmptyStateMessage,
    studioBasePath: "careers",
    recordLabel: (doc) => doc.title,
    revalidatesPaths: () => [],
  }),
);
