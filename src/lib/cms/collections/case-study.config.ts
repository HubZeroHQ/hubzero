import {
  caseStudyEmptyStateMessage,
  caseStudyFilters,
  caseStudyFormFields,
  caseStudyListColumns,
  caseStudySchema,
  type CaseStudyInput,
} from "@/lib/cms/collections/case-study-fields";
import { computeReadingTimeMinutes } from "@/lib/cms/blocks/text";
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
    computedFields: (input) => ({ readingTimeMinutes: computeReadingTimeMinutes(input.content) }),
    // "/" is included because this case study may be one of the homepage's
    // featured items (`lib/cms/public-content.ts`'s `getHomepageContent`) —
    // cheap and safe to always revalidate, since a stale homepage would
    // otherwise only self-correct on the next ISR tick.
    revalidatesPaths: (doc) => ["/", "/work", `/work/${doc.slug}`],
    publicCard: (doc) => ({
      title: doc.client,
      summary: doc.summary,
      href: `/work/${doc.slug}`,
      coverImageId: doc.coverImage ? String(doc.coverImage) : undefined,
      techTags: Array.isArray(doc.techTags) ? doc.techTags : [],
      featured: doc.featured,
      readingTimeMinutes: doc.readingTimeMinutes,
      contributorIds: (doc.contributors ?? []).map(String),
    }),
  }),
);
