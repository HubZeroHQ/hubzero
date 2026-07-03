# 11 — Database Architecture

> **Status: Founder Approved — 2026-07-01; amended 2026-07-04.** `User.role` enum and the `LabsProject` collection below reflect the responsibility-based RBAC and Labs/R&D decisions in `00_FOUNDER_APPROVAL.md` §2-3, superseding the department-based roles originally listed here. §1 gained the `Build` and `Blueprint` collections and `LabsProject`'s graduation fields on 2026-07-04 — see `00_FOUNDER_APPROVAL.md` §8 and `17_COMPANY_STRUCTURE.md` §4.

> Decision convention: see `01_PRODUCT_VISION.md` §0. Database choice (MongoDB) and the hybrid storage interpretation are decided in `08_TECHNICAL_ARCHITECTURE.md` §2-3 — this document specifies the resulting schema.

## 1. Collections and shape

```ts
// CaseStudy
{
  _id, slug, client, industry,
  practiceArea: 'software' | 'hardware' | 'both' | 'ai',   // 'ai' added 2026-07-04 — Labs now
                                                             // explicitly covers AI exploration
                                                             // (17_COMPANY_STRUCTURE.md §2), and this
                                                             // enum is shared across CaseStudy/Build/
                                                             // LabsProject per 00_FOUNDER_APPROVAL.md §6's
                                                             // existing extensibility clause
  problem: RichText, approach: RichText, result: RichText,
  quote?: { text, name, title, company? },
  techTags: string[], coverImage, relatedTeamMembers: ObjectId[],
  status: 'draft' | 'review' | 'published',
  publishedAt?, createdAt, updatedAt, createdBy: ObjectId, version: number
}

// Build   (new, 2026-07-04 — completed first-party HubZero products, 17_COMPANY_STRUCTURE.md §2)
{
  _id, slug, title, tagline, practiceArea: 'software' | 'hardware' | 'both' | 'ai',
  description: RichText, techTags: string[], coverImage, launchDate,
  liveUrl?, repoUrl?,
  graduatedFromLabsId?: ObjectId,   // provenance, if this Build started as a LabsProject —
                                     // the inverse of LabsProject.graduatedToBuildId below
  status: 'draft' | 'review' | 'published',
  publishedAt?, createdAt, updatedAt, createdBy: ObjectId, version: number
  // deliberately no `client` field — the structural difference from CaseStudy;
  // a Build with a client belongs in CaseStudy instead (17_COMPANY_STRUCTURE.md §2)
}

// Blueprint   (new, 2026-07-04 — reusable, customizable production-ready foundations, not templates)
{
  _id, blueprintId,   // stable, unique — exposed in metadata, never in the URL (mirrors the
                       // existing CaseStudy._id vs. CaseStudy.slug split, 03_INFORMATION_ARCHITECTURE.md §5)
  slug, name, category, description: RichText, techStack: string[], coverImage,
  previewUrl, demoDeploymentUrl, customizationNotes: RichText,
  demoStatus: 'live' | 'stale' | 'retired',   // gates public visibility — a Blueprint is not shown
                                                // unless demoStatus is 'live' (05_CONTENT_STRATEGY.md §2b)
  status: 'draft' | 'review' | 'published',
  publishedAt?, createdAt, updatedAt, createdBy: ObjectId, version: number
}

// TeamMember
{
  _id, username, name, role, bio: RichText, photo,
  skills: { category: string, items: string[] }[],
  socials: { github?, linkedin?, email },
  isCoreMember: boolean,        // gates visibility on /team — Consensus decision, see 06
  profileVisible: boolean,      // gates whether /team/[username] exists at all
  experience?: ExperienceItem[], education?: EducationItem[],   // optional, fixes legacy's
                                                                  // undeclared-but-used fields
                                                                  // (ARCHIVED_PROJECT_ANALYSIS.md §16 #13)
  status: 'draft' | 'published'
}

// Testimonial
{
  _id, quote, name, title, company?, linkedCaseStudy?: ObjectId,
  status: 'draft' | 'published'
  // schema-level constraint: name and title are required, non-empty —
  // structurally prevents the legacy placeholder-testimonial problem (05_CONTENT_STRATEGY.md §3)
}

// Service
{ _id, slug, title, practiceArea: string,   // extensible beyond 'software' | 'hardware' — new verticals
                                              // (AI/ML, Cloud & DevOps, Cybersecurity, Robotics, Product
                                              // Design, etc.) can be added without a schema migration,
                                              // per 00_FOUNDER_APPROVAL.md §6
  description: RichText, capabilities: string[], status: 'draft' | 'published' }

// LabsProject   (new, 2026-07-01 — originally interim hardware-capability proof, see
//                00_FOUNDER_APPROVAL.md §2; generalized 2026-07-04 into the permanent Labs pillar,
//                covering hardware, software, and AI exploration, 00_FOUNDER_APPROVAL.md §8)
{ _id, slug, title, practiceArea: 'software' | 'hardware' | 'both' | 'ai',
  description: RichText, techTags: string[],
  coverImage, isClientWork: false,   // always false — structurally prevents this collection
                                      // from ever being confused with a real client CaseStudy
  stage: 'active' | 'archived' | 'graduated',   // new, 2026-07-04 — lets the /labs index show
                                                  // ongoing vs. concluded work honestly
  graduatedToBuildId?: ObjectId,   // new, 2026-07-04 — inverse of Build.graduatedFromLabsId;
                                    // set when stage is 'graduated', so the lifecycle in
                                    // 17_COMPANY_STRUCTURE.md §3 is a real, queryable relationship
  status: 'draft' | 'published' }

// BlogPost
{ _id, slug, title, summary, body: RichText, authorId: ObjectId,
  category, tags: string[], coverImage?, readingTimeMinutes: number, // computed on save, not author-entered
  status: 'draft' | 'review' | 'published', publishedAt?, version: number }

// FAQ
{ _id, question, answer: RichText, category, order: number, status: 'draft' | 'published' }

// CareerListing
{ _id, title, description: RichText, requirements: string[], status: 'open' | 'closed' }

// Lead   (contact form submissions — system-generated, not authored)
{ _id, name, email, company?, projectType: 'software' | 'hardware' | 'both',
  budgetRange?, message, sourcePage, status: 'new' | 'contacted' | 'closed',
  createdAt }

// SiteSettings   (single document)
{ foundingYear, currentStats: { caseStudyCount, ... } /* real, computed where possible, not manually inflated */,
  socials, footerContent }

// User   (admin panel accounts — distinct from TeamMember; not every TeamMember has a login)
// role reflects the responsibility-based RBAC in 09_CMS_ARCHITECTURE.md §4 (amended 2026-07-01) —
// department (design/dev/marketing/etc.) is metadata on TeamMember, not a permission source here.
{ _id, email, name, role: 'head_admin' | 'admin' | 'teammate',
  dynamicPermissions: string[],   // e.g. ['team_lead'] — assignable/removable, additive to role,
                                    // extensible without a schema migration (future: blog_reviewer,
                                    // recruiter, hr, finance, sales, client_manager, moderator, etc.)
  passwordHash | authProviderId, linkedTeamMemberId?: ObjectId }

// VersionHistory   (generic, applies to any versioned collection)
{ _id, collection: string, documentId: ObjectId, snapshot: object, editedBy: ObjectId, editedAt }
```

## 2. Relationships and integrity

MongoDB does not enforce foreign keys — per the honest tradeoff note in `08_TECHNICAL_ARCHITECTURE.md` §6, integrity is enforced at the application/ODM layer:
- `CaseStudy.relatedTeamMembers`, `BlogPost.authorId`, `Testimonial.linkedCaseStudy` are validated to reference existing documents on write.
- **[New, 2026-07-04]** `LabsProject.graduatedToBuildId` and `Build.graduatedFromLabsId` are validated as a consistent pair on write — setting one without the other, or pointing either at a non-existent document, is rejected. This keeps the Labs → Builds lifecycle (`17_COMPANY_STRUCTURE.md` §3) a real, bidirectionally-correct relationship rather than a link that can silently drift.
- Deleting a `TeamMember` who is referenced as a `BlogPost.authorId` is blocked or requires explicit reassignment — never a silent dangling reference (this is exactly the kind of bug class the legacy site's two-contradictory-team-files problem foreshadows, `ARCHIVED_PROJECT_ANALYSIS.md` §10).

## 3. Why username/profile data finally gets a single source of truth

Directly fixes a confirmed legacy bug: `src/data/team.json` and `public/data/team.json` held different, contradictory data (different bios, different titles for the same person — `ARCHIVED_PROJECT_ANALYSIS.md` §10, §16 problem #11). In v2, `TeamMember` is the only place this data exists; both the public Team page and any future internal use read the same collection.

## 4. Status / workflow fields

Every content collection that participates in the CMS workflow (`09_CMS_ARCHITECTURE.md` §3) carries a `status` field with the same enum shape (`draft` / `review` / `published`, or a simpler `draft`/`published` for lower-risk collections per the role table in `09` §4) and a `version` counter incremented on every published change, with snapshots written to `VersionHistory` — this is the schema-level implementation of the team's consensus request for drafts, approval, and version history (CSV Q19).

## 5. Indexing

- `slug` fields (CaseStudy, BlogPost, Service, **Build, LabsProject, Blueprint** — added 2026-07-04): unique index, used for route resolution.
- `blueprintId` (Blueprint): unique index, separate from `slug` — the stable ID exposed in metadata (§1 above).
- `status` + `publishedAt`: compound index on CaseStudy, BlogPost, **Build, and Blueprint** for each pillar's "published, newest first" index-page query.
- `username` (TeamMember): unique index.
- `Lead.status` + `createdAt`: index for the admin panel's lead inbox view.

## 6. Seed data

At launch, `SiteSettings.currentStats` and any "since [year]" claim are seeded with **2024** as the founding year (`06_PAGE_SPECIFICATIONS.md` About — **[Founder decision, confirmed 2026-07-01]**, resolves the legacy 2023-vs-2024 inconsistency) — never seeded with placeholder/example values that might accidentally ship to production, given the legacy site's demonstrated pattern of placeholder content leaking into the live site (testimonials, stats).

## 7. Backup and retention **[New, 2026-07-01, see `00_FOUNDER_APPROVAL.md` §4]**

All collections in this schema are covered by the backup/retention policy specified in `08_TECHNICAL_ARCHITECTURE.md` §9 (daily incremental + periodic full backups, tested restoration, retention limited to legitimate business purposes, deletion on request for `Lead` data). Media referenced by any collection (cover images, photos) is included in the same backup scope.
