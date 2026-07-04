import {
  caseStudyEmptyStateMessage,
  caseStudyFilters,
  caseStudyFormFields,
  caseStudyListColumns,
  caseStudySchema,
  type CaseStudyInput,
} from "@/lib/cms/collections/case-study-fields";
import { defineCollection, registerCollection } from "@/lib/cms/collection-config";
import { CaseStudy, type CaseStudyDocument } from "@/models/case-study";

/**
 * The Mongoose-touching half of the Case Study collection — deliberately
 * separate from `case-study-fields.tsx` (see that file's header comment) so
 * only Server Actions and Server Components import this one. Import this
 * from a Client Component and the build breaks the same way importing
 * `@/models/case-study` directly would.
 */
export const caseStudyConfig = registerCollection(
  defineCollection<CaseStudyDocument, CaseStudyInput>({
    resource: "caseStudy",
    label: "Case Studies",
    model: CaseStudy,
    zodSchema: caseStudySchema,
    workflow: "draft-review-publish",
    listColumns: caseStudyListColumns,
    filters: caseStudyFilters,
    formFields: caseStudyFormFields,
    searchableFields: ["client", "industry", "slug"],
    emptyStateMessage: caseStudyEmptyStateMessage,
    studioBasePath: "case-studies",
    recordLabel: (doc) => doc.client,
    revalidatesPaths: (doc) => ["/work", `/work/${doc.slug}`],
  }),
);
