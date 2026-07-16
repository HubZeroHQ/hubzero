import type { ObjectId } from 'mongodb';

/**
 * Shared type vocabulary for every Studio collection (PLANNING.md §24, §26).
 * Relationships are modeled as ObjectId references, never embedding — most
 * are queried independently (e.g. "all Notes referencing this Build").
 */

export type PublishStatus = 'draft' | 'inReview' | 'approved' | 'published' | 'archived';

/** Services carries a deliberately lighter two-state workflow (§26.7). */
export type ServicePublishStatus = 'draft' | 'published';

export type ReferenceIdPrefix = 'WK' | 'BL' | 'BP' | 'LB' | 'NT' | 'TM';

/** Permanent, Studio-assigned identifier — `HZ-{PREFIX}-{NNN}` (§27). Leads and Users never receive one. */
export type ReferenceId<Prefix extends ReferenceIdPrefix = ReferenceIdPrefix> =
  `HZ-${Prefix}-${string}`;

export type UserRole = 'headAdmin' | 'admin' | 'teamMember';

export type TaxonomyKind = 'technology' | 'category' | 'topic';

/**
 * One-level grouping only, matching "avoid unnecessary nesting"
 * (CMS_PRODUCT_DESIGN.md §6) — a lightweight tag for where an asset is
 * mainly used, not a folder hierarchy. `general` is the default for
 * anything that doesn't obviously belong to one collection.
 */
export type MediaFolder = 'work' | 'builds' | 'blueprints' | 'labs' | 'notes' | 'team' | 'general';

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

/** A reference into a Work/Build/Blueprint/Lab entry — evidence links (§13) and Note cross-references (§24). */
export interface EntryReference {
  ownerType: EvidenceOwnerType;
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
  clientType: string;
  categoryTagIds: ObjectId[];
  timeline: string;
  role: string;
  technologyIds: ObjectId[];
  relatedBuildIds: ObjectId[];
  relatedBlueprintIds: ObjectId[];
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
  description: string;
  features: string[];
  technologyIds: ObjectId[];
  liveDeploymentUrl: string;
  previewAssetIds: ObjectId[];
}

export interface Lab extends PublishableEntity {
  referenceId: ReferenceId<'LB'>;
  title: string;
  stage: LabStage;
  objective: string;
  nextMilestone: string;
  graduationCriteria: string;
  graduatedToBuildId?: ObjectId;
}

export interface Note extends PublishableEntity {
  referenceId: ReferenceId<'NT'>;
  title: string;
  authorId: ObjectId;
  tagIds: ObjectId[];
  relatedEntries: EntryReference[];
}

/** Small, low-volume — no reference ID, simplified status (§26.7). */
export interface Service extends WithId, WithTimestamps {
  title: string;
  description: string;
  status: ServicePublishStatus;
  evidenceLinks: EntryReference[];
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
