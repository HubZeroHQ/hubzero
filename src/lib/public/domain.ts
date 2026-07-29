import type { Block } from '@/lib/documents/blocks';

/** Compile-time view of the runtime-frozen objects returned by PublicRepository. */
export type ImmutablePublic<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends readonly (infer Item)[]
    ? readonly ImmutablePublic<Item>[]
    : T extends object
      ? { readonly [Key in keyof T]: ImmutablePublic<T[Key]> }
      : T;

export type PublicEntityType =
  | 'work'
  | 'build'
  | 'blueprint'
  | 'lab'
  | 'note'
  | 'engineeringProfile'
  | 'teamMember'
  | 'service'
  | 'career';

export type PublicDetailEntityType = Exclude<PublicEntityType, 'teamMember' | 'service'>;
export type PublicTaxonomyKind = 'technology' | 'category' | 'topic';
export type PublicMediaRole =
  'hero' | 'screenshot' | 'diagram' | 'portrait' | 'gallery' | 'inline' | 'social';

export interface PublicTaxonomyTerm {
  kind: PublicTaxonomyKind;
  label: string;
  slug: string;
  url?: string;
}

interface PublicResponsiveImage {
  srcSet: string;
  sizes: string;
}

export interface PublicMedia {
  url: string;
  width: number;
  height: number;
  alt: string;
  role: PublicMediaRole;
  caption?: string;
  credit?: string;
  crop?: string;
  responsive: PublicResponsiveImage;
  placeholder: { kind: 'color'; value: string };
}

export interface PublicExternalLink {
  kind: 'live' | 'repository' | 'documentation' | 'demo' | 'attachment';
  label: string;
  url: string;
  availability?: 'live' | 'retired';
}

export interface PublicEntityLink {
  type: PublicEntityType;
  title: string;
  url: string;
  referenceId?: string;
  summary?: string;
  state?: string;
  /** Only populated for an engineeringProfile link — the linked Profile's own real technologies (never fabricated). */
  technologies?: readonly PublicTaxonomyTerm[];
  /** Populated for an engineeringProfile link, or a teamMember link — the Team role, for contributor attribution. */
  role?: string;
  /** Only populated for a teamMember link where that person has a publicly visible Engineering Profile — the profile's own URL. `url` on a teamMember link always stays '/about'; this is how a contributor credit knows whether to link to a profile instead. */
  profileUrl?: string;
}

export type PublicRelationshipKind =
  | 'labGraduatedToBuild'
  | 'buildAppliedInWork'
  | 'workRelatedLab'
  | 'teamContributedToEntry'
  | 'artifactUsesBlueprint'
  | 'labRelatedBuild'
  | 'labRelatedBlueprint'
  | 'noteDiscussesArtifact'
  | 'serviceProvenBy'
  | 'profileFeaturesEvidence'
  | 'noteAuthoredBy'
  | 'teamHasProfile'
  | 'careerRelatesArtifact'
  | 'careerHiringManager';

export interface PublicRelationship {
  kind: PublicRelationshipKind;
  label: string;
  target: PublicEntityLink;
}

type PersonAuthor = {
  kind: 'person';
  name: string;
  role?: string;
  portrait?: PublicMedia;
  url: string;
  profileAvailable: boolean;
  /** Only populated when `profileAvailable` — the linked Profile's own real technologies, for cross-site founder identity (never fabricated). */
  technologies?: readonly PublicTaxonomyTerm[];
};

export type OrganizationAuthor = {
  kind: 'organization';
  name: 'HubZero';
  url: '/about';
};

export type PublicAuthor = PersonAuthor | OrganizationAuthor;

type ImageBlock = Extract<Block, { type: 'image' }>;
type ImageGalleryBlock = Extract<Block, { type: 'imageGallery' }>;
type TechnologyStackBlock = Extract<Block, { type: 'technologyStack' }>;
type PassThroughBlock = Exclude<Block, ImageBlock | ImageGalleryBlock | TechnologyStackBlock>;

export type PublicBlock =
  | PassThroughBlock
  | { id: string; type: 'image'; data: { media: PublicMedia } }
  | { id: string; type: 'imageGallery'; data: { images: PublicMedia[] } }
  | { id: string; type: 'technologyStack'; data: { technologies: PublicTaxonomyTerm[] } };

export type PublicDocumentRole =
  | 'caseStudy'
  | 'technical'
  | 'body'
  | 'overview'
  | 'engineeringJournal'
  | 'findings'
  | 'researchNotes'
  | 'introduction'
  | 'interview'
  | 'timeline'
  | 'quotes'
  | 'achievements';

export interface PublicDocument {
  role: PublicDocumentRole;
  blocks: PublicBlock[];
  outline?: Array<{ id: string; level: 2 | 3 | 4; text: string }>;
}

interface PublicSummaryBase {
  type: PublicEntityType;
  title: string;
  url: string;
  summary: string;
  referenceId?: string;
  hero?: PublicMedia;
  technologies: PublicTaxonomyTerm[];
  state?: string;
}

export interface PublicWorkSummary extends PublicSummaryBase {
  type: 'work';
  slug: string;
  referenceId: string;
  clientType: string;
  timeline: string;
  hubZeroRole: string;
  categories: PublicTaxonomyTerm[];
}

export interface PublicBuildSummary extends PublicSummaryBase {
  type: 'build';
  slug: string;
  referenceId: string;
  deploymentState: 'live' | 'retired';
  links: PublicExternalLink[];
}

export interface PublicBlueprintSummary extends PublicSummaryBase {
  type: 'blueprint';
  slug: string;
  referenceId: string;
  architecture: string;
  designLanguage: string;
  version: string;
  links: PublicExternalLink[];
  previewMedia: PublicMedia[];
}

export interface PublicLabSummary extends PublicSummaryBase {
  type: 'lab';
  slug: string;
  referenceId: string;
  stage: 'exploring' | 'building' | 'testing';
  researchDirection: string;
  currentMilestone: string;
  startDate: string;
  lastMajorUpdate?: string;
  links: PublicExternalLink[];
}

export interface PublicNoteSummary extends PublicSummaryBase {
  type: 'note';
  slug: string;
  referenceId: string;
  publicationDate: string;
  author: PublicAuthor;
}

export interface PublicNoteIndexEntry {
  note: PublicNoteSummary;
  relationships: PublicRelationship[];
}

export interface PublicEngineeringProfileSummary extends PublicSummaryBase {
  type: 'engineeringProfile';
  slug: string;
  referenceId: string;
  role: string;
  engineeringIdentity: string[];
  currentExploration: string;
  portrait?: PublicMedia;
}

export interface PublicEngineeringProfileIndexEntry {
  profile: PublicEngineeringProfileSummary;
  areasOfExpertise: string[];
  relationships: PublicRelationship[];
}

export interface PublicTeamMemberSummary extends PublicSummaryBase {
  type: 'teamMember';
  group: string;
  role: string;
  /** Which About-page section this person appears in — independent of `founder` (a permanent historical fact). */
  publicCategory: 'leadership' | 'team';
  founder: boolean;
  /** Optional — surfaced only on the compact Engineering Team card. */
  joinedAt?: string;
  profile?: PublicEntityLink;
  portrait?: PublicMedia;
}

export interface PublicServiceSummary extends PublicSummaryBase {
  type: 'service';
  evidence: PublicRelationship[];
}

export interface PublicCareerSummary extends PublicSummaryBase {
  type: 'career';
  slug: string;
  referenceId: string;
  location: string;
  employmentType: 'fullTime' | 'partTime' | 'contract' | 'internship';
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead';
  /** Deliberately optional — not every listing states a figure (matches `Career.compensation`'s own optionality). */
  compensation?: string;
}

export type PublicEntitySummary =
  | PublicWorkSummary
  | PublicBuildSummary
  | PublicBlueprintSummary
  | PublicLabSummary
  | PublicNoteSummary
  | PublicEngineeringProfileSummary
  | PublicTeamMemberSummary
  | PublicServiceSummary
  | PublicCareerSummary;

export type PublicEntityDetail =
  | (PublicWorkSummary & {
      documents: PublicDocument[];
      relationships: PublicRelationship[];
      links: PublicExternalLink[];
      /**
       * Trace (v2.5 Phase 6): the backward causal chain this Work item sits
       * at the end of — Work informed by a Build, that Build originated
       * from a Lab — from `projectTrace`, walked over the same evidence
       * graph `relationships` is resolved from. Empty when there's no
       * lineage to trace (no connected Build, or that Build has no Lab
       * origin), same convention as `gallery`/`documents` elsewhere in this
       * union: an always-present array, not an optional field.
       */
      trace: PublicRelationship[];
    })
  | (PublicBuildSummary & {
      documents: PublicDocument[];
      relationships: PublicRelationship[];
      gallery: PublicMedia[];
    })
  | (PublicBlueprintSummary & {
      documents: PublicDocument[];
      relationships: PublicRelationship[];
      features: string[];
    })
  | (PublicLabSummary & {
      documents: PublicDocument[];
      relationships: PublicRelationship[];
      graduationCriteria: string;
      gallery: PublicMedia[];
      milestones: Array<{ title: string; date: string; summary: string }>;
      /**
       * Trace (v2.5 Phase 8): the forward causal chain this Lab is the
       * origin of — this investigation graduated into a Build, that Build
       * applied in Work — the same `projectTrace` walk Work's backward
       * trace uses (Phase 6), just walked outbound instead of inbound.
       * Empty when the investigation hasn't graduated into anything yet,
       * or that Build hasn't been applied anywhere public. Same
       * always-present-array convention as `gallery`/`documents`.
       */
      trace: PublicRelationship[];
    })
  | (PublicNoteSummary & {
      documents: PublicDocument[];
      relationships: PublicRelationship[];
      gallery: PublicMedia[];
      readingTimeMinutes: number;
    })
  | (PublicEngineeringProfileSummary & {
      documents: PublicDocument[];
      relationships: PublicRelationship[];
      engineeringPhilosophy: string;
      currentInterests: string[];
      areasOfExpertise: string[];
      gallery: PublicMedia[];
    })
  | (PublicCareerSummary & {
      documents: PublicDocument[];
      relationships: PublicRelationship[];
      responsibilities: string[];
      requirements: string[];
      benefits: string[];
      /** Stated plainly and always present on the detail page — never folded into the Document body (Design Specification, Careers §3). */
      applicationProcess: string;
      /** Resolves `hiringManagerTeamId` to a real Team credit — absent when a role hasn't had one assigned yet. */
      hiringManager?: PublicEntityLink;
    });

export interface PublicDiscoveryEntry {
  type: PublicEntityType;
  title: string;
  url: string;
  summary: string;
  referenceId?: string;
  taxonomy: readonly string[];
  state?: string;
  lastModified?: string;
  author?: PublicAuthor;
  media?: PublicMedia;
  relationships: readonly PublicRelationship[];
}

export interface PublicHomepageFeature<Summary extends PublicEntitySummary = PublicEntitySummary> {
  entity: Summary;
  relationships: PublicRelationship[];
}

/** A purpose-shaped, bounded projection. Homepage consumers never receive Studio curation fields. */
export interface PublicHomepageProjection {
  work: PublicHomepageFeature<PublicWorkSummary>[];
  builds: PublicHomepageFeature<PublicBuildSummary>[];
  labs: PublicHomepageFeature<PublicLabSummary>[];
  notes: PublicHomepageFeature<PublicNoteSummary>[];
  blueprint?: PublicHomepageFeature<PublicBlueprintSummary>;
  profiles: PublicHomepageFeature<PublicEngineeringProfileSummary>[];
  /**
   * The true count of published records across Work, Builds, Blueprints,
   * Labs, Notes, and Engineering Profiles — not the length of the featured
   * arrays above, which are capped subsets (`.slice(0, 2)` and similar) for
   * homepage display. This is the homepage's one opening statistic, and it
   * is a literal count of what's published, not a curated or weighted
   * number. See `getHomepage`'s doc comment in `repository.ts`.
   */
  publishedRecordCount: number;
}
