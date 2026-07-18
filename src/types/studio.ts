import type { ObjectId } from 'mongodb';
import type { DocumentRole } from '@/lib/documents/schema';

/**
 * Shared type vocabulary for every Studio collection (PLANNING.md §24, §26).
 * Relationships are modeled as ObjectId references, never embedding — most
 * are queried independently (e.g. "all Notes referencing this Build").
 */

export type PublishStatus = 'draft' | 'inReview' | 'approved' | 'published' | 'archived';

/** Services carries a deliberately lighter two-state workflow (§26.7). */
export type ServicePublishStatus = 'draft' | 'published';

export type ReferenceIdPrefix = 'WK' | 'BL' | 'BP' | 'LB' | 'NT' | 'TM' | 'EP';

/** Permanent Studio identifier. Existing content uses `HZ-{PREFIX}-{NNN}`; Engineering Profiles use `EP-{NNN}`. */
export type ReferenceId<Prefix extends ReferenceIdPrefix = ReferenceIdPrefix> = Prefix extends 'EP'
  ? `EP-${string}`
  : `HZ-${Prefix}-${string}`;

export type UserRole = 'headAdmin' | 'admin' | 'teamMember';

export type TaxonomyKind = 'technology' | 'category' | 'topic';

/**
 * One-level grouping only, matching "avoid unnecessary nesting"
 * (CMS_PRODUCT_DESIGN.md §6) — a lightweight tag for where an asset is
 * mainly used, not a folder hierarchy. `general` is the default for
 * anything that doesn't obviously belong to one collection.
 */
export type MediaFolder =
  'work' | 'builds' | 'blueprints' | 'labs' | 'notes' | 'team' | 'engineeringProfiles' | 'general';

export type LeadStatus = 'new' | 'contacted' | 'closed';

export type LabStage = 'exploring' | 'building' | 'testing';

export type BuildDeploymentState = 'live' | 'retired';

export interface WithId {
  _id: ObjectId;
}

export interface WithTimestamps {
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Shared by every collection that runs through the full publishing workflow
 * (§28). `createdByUserId` is permanent provenance metadata — assigned once
 * at create time, never editable afterward (§29) — not an authorization
 * mechanism itself; permissions are still decided by `config/permissions.ts`'s
 * role/capability table (`lib/auth/permissions.ts`'s `requireEntryCapability`
 * reads this field only to scope which entries a Team Member's
 * `editOwnEntry` capability applies to). Extending this later with e.g. a
 * `contributorUserIds` or `maintainerUserId` field is additive to this one
 * base interface, not a change to Work/Build/Blueprint/Lab/Note individually.
 */
interface PublishableEntity extends WithId, WithTimestamps {
  status: PublishStatus;
  slug: string;
  createdByUserId: ObjectId;
}

/**
 * The collections evidence-style cross-references are allowed to point at
 * (§13, §24: Service → {Work, Build, Blueprint, Lab}; Note → the same four).
 * Deliberately narrower than the Document Engine's `OwnerType` (§25), which
 * also includes Team and Note — an evidence link and a Document owner are
 * different concepts that happen to overlap, not the same type.
 */
export type EvidenceOwnerType = 'Work' | 'Build' | 'Blueprint' | 'Lab';
export type ServiceEvidenceOwnerType = EvidenceOwnerType | 'Note';

/** A reference into a Work/Build/Blueprint/Lab entry — evidence links (§13) and Note cross-references (§24). */
export interface EntryReference {
  ownerType: EvidenceOwnerType;
  ownerId: ObjectId;
}

/** Services may also use a published Note when the writing itself is material evidence. */
export interface ServiceEvidenceReference {
  ownerType: ServiceEvidenceOwnerType;
  ownerId: ObjectId;
}

export interface TaxonomyEntry extends WithId, WithTimestamps {
  kind: TaxonomyKind;
  label: string;
  slug: string;
}

/** Every uploaded asset is a Cloudinary reference — never binary data in the database (§26.10, §33). */
export interface MediaAsset extends WithId, WithTimestamps {
  cloudinaryPublicId: string;
  url: string;
  altText: string;
  caption?: string;
  credit?: string;
  width?: number;
  height?: number;
  /** Read from Cloudinary's upload response, never entered by hand (CMS_PRODUCT_DESIGN.md §6). */
  fileSizeBytes?: number;
  mimeType?: string;
  originalFilename?: string;
  folder: MediaFolder;
  reuseTags: string[];
  /** Provenance only, like every other collection's `createdByUserId` — not itself an authorization mechanism. */
  createdByUserId?: ObjectId;
}

/** System identity for Studio access (§26.9) — never rendered publicly by itself; see Team for public presentation. */
export interface User extends WithId, WithTimestamps {
  name: string;
  email: string;
  role: UserRole;
  passwordHash?: string;
  image?: string;
}

/** A user's public-facing profile, if they have one — optional and separate from system identity (§24, §26.6). */
export interface Team extends WithId, WithTimestamps {
  referenceId: ReferenceId<'TM'>;
  name: string;
  role: string;
  bio: string;
  /** e.g. "Founders" | "Operating Team" | "Engineering Team" today — adjustable, never hardcoded. */
  group: string;
  portraitId?: ObjectId;
  publicProfile: boolean;
  userId?: ObjectId;
}

export interface Work extends PublishableEntity {
  referenceId: ReferenceId<'WK'>;
  title: string;
  /** Concise public/editorial summary for indexes, metadata, search, and relationship context. */
  summary: string;
  clientType: string;
  categoryTagIds: ObjectId[];
  timeline: string;
  role: string;
  technologyIds: ObjectId[];
  relatedBuildIds: ObjectId[];
  relatedBlueprintIds: ObjectId[];
  relatedLabIds: ObjectId[];
  /** Explicit public credit only; `createdByUserId` remains internal provenance. */
  contributorProfileIds: ObjectId[];
  heroImageId?: ObjectId;
  /** Additive beyond §26.1 — mirrors Build's `repoUrl` (§26.2). */
  repoUrl?: string;
}

export interface Build extends PublishableEntity {
  referenceId: ReferenceId<'BL'>;
  title: string;
  deploymentState: BuildDeploymentState;
  liveUrl?: string;
  repoUrl?: string;
  technologyIds: ObjectId[];
  originatingLabId?: ObjectId;
  relatedWorkIds: ObjectId[];
  /** Additive beyond PLANNING.md §26.2 — the product hero image and supporting gallery (§10's "screenshots"). */
  heroImageId?: ObjectId;
  galleryImageIds: ObjectId[];
  /** Additive beyond §26.2 — surfaces a Build on the homepage's "Featured Build" slot (PLANNING.md §8). */
  featured: boolean;
}

export interface Blueprint extends PublishableEntity {
  referenceId: ReferenceId<'BP'>;
  /** Enforced `Blueprint-X-Y` format at the schema level (§11, §26.3). */
  name: `Blueprint-${string}-${string}`;
  architecture: string;
  designLanguage: string;
  /** Card/list-view summary — the long-form narrative lives in the owned `caseStudy` Document (§25) instead. */
  shortDescription: string;
  features: string[];
  technologyIds: ObjectId[];
  liveDeploymentUrl: string;
  /** Additive beyond §26.3 — mirrors Work/Build's `repoUrl` for a public or internal repository link. */
  repoUrl?: string;
  /** Additive beyond §26.3 — optional standalone documentation site, distinct from the in-CMS case study Document. */
  docsUrl?: string;
  /** Additive beyond §26.3 — mirrors Build's `heroImageId`/`galleryImageIds` split between a lead image and supporting gallery. */
  heroImageId?: ObjectId;
  previewAssetIds: ObjectId[];
  /** Additive beyond §26.3 — mirrors Build's homepage "Featured" slot (PLANNING.md §8). */
  featured: boolean;
  /** Additive beyond §26.3 — a foundation evolves after its first release; free-form so `1.2.0` and `2024.1` both fit. */
  version: string;
}

/**
 * A single entry in a collection entry's progress timeline — generic and
 * reusable (`lib/validation/shared.ts`'s `progressMilestoneSchema`), not
 * modeled as Lab-specific. `relatedDocumentRole` optionally names one of the
 * owning entry's own Documents (§25) that backs the milestone up.
 */
export interface ProgressMilestone {
  title: string;
  date: Date;
  summary: string;
  relatedDocumentRole?: DocumentRole;
}

export interface Lab extends PublishableEntity {
  referenceId: ReferenceId<'LB'>;
  title: string;
  /** Where the research currently sits — distinct from `status` (§28's publishing workflow). */
  stage: LabStage;
  objective: string;
  /** Additive beyond §26.4 — current technical approach/direction, separate from `objective`'s "what/why." */
  researchDirection: string;
  /** Renamed from §26.4's `nextMilestone` — the milestone actively being worked toward right now. */
  currentMilestone: string;
  graduationCriteria: string;
  graduatedToBuildId?: ObjectId;
  /** Additive beyond §26.4 — when this exploration began. */
  startDate: Date;
  /** Additive beyond §26.4 — deliberately curated, distinct from the record's own `updatedAt` (which changes on every trivial edit). */
  lastMajorUpdateAt?: Date;
  /** Additive beyond §26.4 — mirrors Build/Blueprint's `repoUrl`, split into internal vs. optionally-public. */
  internalRepoUrl: string;
  publicRepoUrl?: string;
  /** Additive beyond §26.4 — mirrors Blueprint's `liveDeploymentUrl`, optional since not every Lab has a running demo. */
  liveDemoUrl?: string;
  technologyIds: ObjectId[];
  /** Additive beyond §26.4 — mirrors Work's forward relation shape (§24), distinct from `graduatedToBuildId`'s graduation-specific link. */
  relatedBuildIds: ObjectId[];
  relatedBlueprintIds: ObjectId[];
  /** Additive beyond §26.4 — mirrors Build/Blueprint's hero + gallery split. */
  heroImageId?: ObjectId;
  galleryImageIds: ObjectId[];
  /** Additive beyond §26.4 — mirrors Build/Blueprint's homepage "Featured" slot. */
  featured: boolean;
  /** The Progress Timeline (Phase 10). */
  milestones: ProgressMilestone[];
}

export interface Note extends PublishableEntity {
  referenceId: ReferenceId<'NT'>;
  title: string;
  /** System identity, not a Team public profile (§24) — set at creation, reassignable by anyone who can edit the entry. */
  authorId: ObjectId;
  /** Card/list-view summary — mirrors Blueprint's `shortDescription`; the long-form write-up lives in the owned `body` Document (§25) instead. */
  summary: string;
  /** Renamed from §26.5's combined "tags/technologies" facet — consistent with every other collection's `technologyIds`, referencing the shared Taxonomy's `technology` kind (§26.11). */
  technologyIds: ObjectId[];
  relatedEntries: EntryReference[];
  /** Additive beyond §26.5 — an editorial date distinct from `createdAt` and the workflow's `published` transition, for backdating or scheduling a write-up. */
  publicationDate: Date;
  /** Additive beyond §26.5 — mirrors every other Content collection's homepage "Featured" slot. */
  featured: boolean;
  /** Additive beyond §26.5 — mirrors Build/Blueprint/Lab's optional hero + gallery split. */
  heroImageId?: ObjectId;
  galleryImageIds: ObjectId[];
}

/** An earned, evidence-led record of how one Team Member thinks and works. */
export interface EngineeringProfile extends PublishableEntity {
  referenceId: ReferenceId<'EP'>;
  teamMemberId: ObjectId;
  overview: string;
  engineeringPhilosophy: string;
  currentExploration: string;
  areasOfExpertise: string[];
  currentInterests: string[];
  engineeringIdentity: string[];
  technologyIds: ObjectId[];
  featuredWorkIds: ObjectId[];
  featuredBuildIds: ObjectId[];
  featuredBlueprintIds: ObjectId[];
  featuredLabIds: ObjectId[];
  featuredNoteIds: ObjectId[];
  portraitId?: ObjectId;
  heroMediaId?: ObjectId;
  galleryImageIds: ObjectId[];
}

/** Small, low-volume — no reference ID, simplified status (§26.7). */
export interface Service extends WithId, WithTimestamps {
  title: string;
  description: string;
  status: ServicePublishStatus;
  evidenceLinks: ServiceEvidenceReference[];
}

/** Deliberately minimal — not a CRM (§26.8). No reference ID: internal-only, no citation purpose. */
export interface Lead extends WithId, WithTimestamps {
  name: string;
  email: string;
  message: string;
  source: string;
  status: LeadStatus;
  assignedToUserId?: ObjectId;
  internalNotes?: string;
}
