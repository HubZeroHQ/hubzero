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
  'work' | 'build' | 'blueprint' | 'lab' | 'note' | 'engineeringProfile' | 'teamMember' | 'service';

export type PublicDetailEntityType = Exclude<PublicEntityType, 'teamMember' | 'service'>;
export type PublicPillarType = 'work' | 'build' | 'blueprint' | 'lab';
export type PublicTaxonomyKind = 'technology' | 'category' | 'topic';
export type PublicMediaRole =
  'hero' | 'screenshot' | 'diagram' | 'portrait' | 'gallery' | 'inline' | 'social';

export interface PublicTaxonomyTerm {
  kind: PublicTaxonomyKind;
  label: string;
  slug: string;
  url?: string;
}

export interface PublicResponsiveImage {
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
}

export type PublicRelationshipKind =
  | 'labGraduatedToBuild'
  | 'buildAppliedInWork'
  | 'workRelatedLab'
  | 'profileContributedToWork'
  | 'artifactUsesBlueprint'
  | 'labRelatedBuild'
  | 'labRelatedBlueprint'
  | 'noteDiscussesArtifact'
  | 'serviceProvenBy'
  | 'profileFeaturesEvidence'
  | 'noteAuthoredBy'
  | 'teamHasProfile';

export interface PublicRelationship {
  kind: PublicRelationshipKind;
  label: string;
  target: PublicEntityLink;
}

export type PersonAuthor = {
  kind: 'person';
  name: string;
  role?: string;
  portrait?: PublicMedia;
  url: string;
  profileAvailable: boolean;
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

export interface PublicEngineeringProfileSummary extends PublicSummaryBase {
  type: 'engineeringProfile';
  slug: string;
  referenceId: string;
  role: string;
  engineeringIdentity: string[];
  currentExploration: string;
  portrait?: PublicMedia;
}

export interface PublicTeamMemberSummary extends PublicSummaryBase {
  type: 'teamMember';
  group: string;
  role: string;
  profile?: PublicEntityLink;
  portrait?: PublicMedia;
}

export interface PublicServiceSummary extends PublicSummaryBase {
  type: 'service';
  evidence: PublicRelationship[];
}

export type PublicEntitySummary =
  | PublicWorkSummary
  | PublicBuildSummary
  | PublicBlueprintSummary
  | PublicLabSummary
  | PublicNoteSummary
  | PublicEngineeringProfileSummary
  | PublicTeamMemberSummary
  | PublicServiceSummary;

export type PublicEntityDetail =
  | (PublicWorkSummary & {
      documents: PublicDocument[];
      relationships: PublicRelationship[];
      links: PublicExternalLink[];
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
    })
  | (PublicNoteSummary & {
      documents: PublicDocument[];
      relationships: PublicRelationship[];
      gallery: PublicMedia[];
    })
  | (PublicEngineeringProfileSummary & {
      documents: PublicDocument[];
      relationships: PublicRelationship[];
      engineeringPhilosophy: string;
      currentInterests: string[];
      areasOfExpertise: string[];
      gallery: PublicMedia[];
    });

export interface PublicDiscoveryEntry {
  type: PublicEntityType;
  title: string;
  url: string;
  summary: string;
  referenceId?: string;
  taxonomy: string[];
  state?: string;
  author?: PublicAuthor;
  media?: PublicMedia;
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
}
