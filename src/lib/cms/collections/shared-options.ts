/**
 * Option lists shared across more than one collection's Zod schema, form
 * fields, and Mongoose enum — extracted the moment a second collection
 * needed one, per `ARCHITECTURE/19_CMS_FOUNDATION.md`'s own "avoid
 * copy-paste" discipline applied to collection config rather than the
 * engine. A collection-specific option list (e.g. Blueprint's `demoStatus`)
 * stays local to that collection's own `*-fields.tsx` — this file is only
 * for a list `ARCHITECTURE/11_DATABASE_ARCHITECTURE.md` itself documents as
 * shared.
 */

/**
 * `practiceArea` — "shared across CaseStudy/Build/LabsProject per
 * `00_FOUNDER_APPROVAL.md` §6's existing extensibility clause"
 * (`ARCHITECTURE/11_DATABASE_ARCHITECTURE.md` §1). Previously defined only in
 * `case-study-fields.tsx`; moved here once Build and LabsProject needed the
 * identical list, rather than duplicating it a second and third time.
 */
export const practiceAreaOptions = [
  { value: "software", label: "Software" },
  { value: "hardware", label: "Hardware" },
  { value: "both", label: "Both" },
  { value: "ai", label: "AI" },
] as const;

export type PracticeAreaValue = (typeof practiceAreaOptions)[number]["value"];

// Cast to a literal, non-empty tuple rather than a widened `string[]` — see
// `lead-schema.ts`'s note on why a widened array type would silently lose
// the literal-union type `z.enum()`/`InferSchemaType` otherwise derives.
export const practiceAreaValues = practiceAreaOptions.map((option) => option.value) as [
  PracticeAreaValue,
  ...PracticeAreaValue[],
];
