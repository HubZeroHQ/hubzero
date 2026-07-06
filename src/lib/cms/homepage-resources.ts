/**
 * The fixed set of collections eligible to appear in the homepage's
 * featured-content configuration (`models/site-settings.ts`'s `homepage`
 * field, `lib/cms/public-content.ts`'s `getHomepageContent`) — every one of
 * them defines `publicCard` on its `CollectionConfig`
 * (`lib/cms/collection-config.ts`). A fixed, small list rather than derived
 * from the collection registry at call time: the registry only finishes
 * populating once `lib/cms/collections/index.ts` has run, which would make
 * this module's load order matter if it read the registry directly, and the
 * "which collections can be featured" set changes rarely enough that a
 * literal list (the same posture `shared-options.ts`'s `practiceAreaValues`
 * already takes) is the right amount of infrastructure.
 */
export const HOMEPAGE_RESOURCES = [
  "caseStudy",
  "build",
  "labsProject",
  "blueprint",
  "note",
] as const;

export type HomepageResource = (typeof HOMEPAGE_RESOURCES)[number];

export const HOMEPAGE_RESOURCE_LABELS: Record<HomepageResource, string> = {
  caseStudy: "Case Study",
  build: "Build",
  labsProject: "Labs Project",
  blueprint: "Blueprint",
  note: "Note",
};

/** The field each collection's `recordLabel`/searchable identity resolves to — what `<ReferencePickerModal>` displays per result. */
export const HOMEPAGE_RESOURCE_LABEL_FIELDS: Record<HomepageResource, string> = {
  caseStudy: "client",
  build: "title",
  labsProject: "title",
  blueprint: "name",
  note: "title",
};

export function isHomepageResource(value: string): value is HomepageResource {
  return (HOMEPAGE_RESOURCES as readonly string[]).includes(value);
}
