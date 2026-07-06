import { describe, expect, it } from "vitest";

import "@/lib/cms/collections";

import {
  findOnePublished,
  findPublishedWithCardMeta,
  getHomepageContent,
  getPublicTeamMembers,
  getTeamMemberContributions,
} from "@/lib/cms/public-content";
import { withArrayDefault, withCardFieldDefaults } from "@/models/shared/card-fields";
import { Build } from "@/models/build";
import { CaseStudy, type CaseStudyDocument } from "@/models/case-study";
import { Note } from "@/models/note";
import { SiteSettings } from "@/models/site-settings";
import { TeamMember } from "@/models/team-member";
import { User } from "@/models/user";

/**
 * Regression coverage for the production build crash: prerendering
 * `/work/bhatkal-time-luxe` threw "Cannot read properties of undefined
 * (reading 'map')" because that document (written before this collection's
 * `content: Block[]`/`techTags` fields — or before `scripts/migrate-content-blocks.ts`
 * had run against it) came back from `.lean()` with those keys simply
 * absent, and `ContentRenderer`/the page's `doc.techTags.join(...)` assumed
 * they were always arrays. `withCardFieldDefaults`/`withArrayDefault`
 * (`models/shared/card-fields.ts`) close this at the read boundary so every
 * public page gets the guaranteed shape regardless of migration state.
 */
async function insertLegacyCaseStudy(overrides: Record<string, unknown> = {}) {
  const user = await User.create({
    email: "legacy-author@example.com",
    name: "Legacy Author",
    passwordHash: "unused-in-tests",
    role: "admin",
    sessionVersion: 0,
  });

  // Bypasses Mongoose entirely — no schema defaults applied — mirroring
  // exactly what a document written before `content`/`techTags`/
  // `contributors`/`featured` existed on this collection looks like in
  // MongoDB: those keys are simply absent, not `[]`/`false`.
  await CaseStudy.collection.insertOne({
    slug: "legacy-case-study",
    client: "Legacy Client",
    industry: "Legacy Industry",
    practiceArea: "software",
    summary: "A legacy case study document.",
    status: "published",
    publishedAt: new Date(),
    version: 0,
    createdBy: user._id,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  return user;
}

describe("findOnePublished on a legacy document — the raw hazard", () => {
  it("returns content/techTags/contributors undefined via .lean(), exactly reproducing the prerender crash's cause", async () => {
    await insertLegacyCaseStudy();

    const doc = await findOnePublished<CaseStudyDocument>(CaseStudy, {
      slug: "legacy-case-study",
    });

    expect(doc).not.toBeNull();
    expect(doc?.content).toBeUndefined();
    expect(doc?.techTags).toBeUndefined();
    expect(doc?.contributors).toBeUndefined();

    // This is exactly what `ContentRenderer`'s `blocks.map(...)` (and the
    // page's `doc.techTags.join(...)`) do with no guard — reproducing the
    // reported "Cannot read properties of undefined (reading 'map')".
    expect(() => (doc?.content as unknown[]).map((b) => b)).toThrow(/undefined/);
  });
});

describe("withCardFieldDefaults / withArrayDefault — the fix", () => {
  it("guarantees content/contributors/featured/readingTimeMinutes and the collection's tag field are always safe to read", async () => {
    await insertLegacyCaseStudy();

    const doc = await findOnePublished<CaseStudyDocument>(CaseStudy, {
      slug: "legacy-case-study",
    });
    expect(doc).not.toBeNull();

    const normalized = withArrayDefault(
      withCardFieldDefaults(doc as CaseStudyDocument),
      "techTags",
    );

    expect(normalized.content).toEqual([]);
    expect(normalized.contributors).toEqual([]);
    expect(normalized.featured).toBe(false);
    expect(normalized.readingTimeMinutes).toBe(1);
    expect(normalized.techTags).toEqual([]);

    expect(() => normalized.content.map((b) => b)).not.toThrow();
    expect(() => normalized.techTags.join(" · ")).not.toThrow();
    expect(() => normalized.contributors.map((id) => String(id))).not.toThrow();
  });

  it("never overwrites real, already-correct values", () => {
    const blocks = [{ id: "b1", type: "markdown" as const, data: { markdown: "hi" } }];
    const doc = {
      content: blocks,
      contributors: ["id1"],
      featured: true,
      readingTimeMinutes: 4,
    };
    expect(withCardFieldDefaults(doc)).toEqual(doc);
  });
});

describe("getHomepageContent — homepage read path", () => {
  it("returns a normalized hero even when the only published Case Study is a legacy one (legacy fallback)", async () => {
    await insertLegacyCaseStudy({ featured: true });

    const { hero } = await getHomepageContent();

    expect(hero).not.toBeNull();
    expect(hero?.techTags).toEqual([]);
  });

  it("returns an empty homepage gracefully when nothing is published yet — no hardcoded fallback", async () => {
    const { hero, items } = await getHomepageContent();
    expect(hero).toBeNull();
    expect(items).toEqual([]);
  });

  it("resolves the configured hero item generically, regardless of featured:true/most-recent on other documents", async () => {
    const user = await User.create({
      email: "settings-author@example.com",
      name: "Settings Author",
      passwordHash: "unused-in-tests",
      role: "admin",
      sessionVersion: 0,
    });

    const picked = await CaseStudy.create({
      slug: "explicitly-picked",
      client: "Explicitly Picked",
      industry: "Testing",
      practiceArea: "software",
      summary: "The founder's explicit pick.",
      content: [{ id: "b1", type: "markdown", data: { markdown: "Body." } }],
      status: "published",
      publishedAt: new Date("2026-01-01"),
      featured: false,
      createdBy: user._id,
    });

    await CaseStudy.create({
      slug: "more-recent-but-not-picked",
      client: "More Recent",
      industry: "Testing",
      practiceArea: "software",
      summary: "Published more recently but not the explicit pick.",
      content: [{ id: "b1", type: "markdown", data: { markdown: "Body." } }],
      status: "published",
      publishedAt: new Date("2026-06-01"),
      featured: true,
      createdBy: user._id,
    });

    await SiteSettings.create({
      singletonKey: "default",
      companyName: "Test Co",
      seo: { defaultTitle: "Test", defaultDescription: "Test" },
      homepageItems: [{ resource: "caseStudy", id: picked._id, visible: true, isHero: true }],
    });

    const { hero, items } = await getHomepageContent();
    expect(hero?.title).toBe("Explicitly Picked");
    expect(items).toEqual([]);
  });

  it("resolves a non-hero visible item into `items`, and skips an invisible one", async () => {
    const user = await User.create({
      email: "grid-author@example.com",
      name: "Grid Author",
      passwordHash: "unused-in-tests",
      role: "admin",
      sessionVersion: 0,
    });

    const hero = await CaseStudy.create({
      slug: "hero-pick",
      client: "Hero Pick",
      industry: "Testing",
      practiceArea: "software",
      summary: "The hero.",
      content: [{ id: "b1", type: "markdown", data: { markdown: "Body." } }],
      status: "published",
      createdBy: user._id,
    });

    const gridItem = await CaseStudy.create({
      slug: "grid-pick",
      client: "Grid Pick",
      industry: "Testing",
      practiceArea: "software",
      summary: "In the featured grid.",
      content: [{ id: "b1", type: "markdown", data: { markdown: "Body." } }],
      status: "published",
      createdBy: user._id,
    });

    const hiddenItem = await CaseStudy.create({
      slug: "hidden-pick",
      client: "Hidden Pick",
      industry: "Testing",
      practiceArea: "software",
      summary: "Configured but not visible.",
      content: [{ id: "b1", type: "markdown", data: { markdown: "Body." } }],
      status: "published",
      createdBy: user._id,
    });

    await SiteSettings.create({
      singletonKey: "default",
      companyName: "Test Co",
      seo: { defaultTitle: "Test", defaultDescription: "Test" },
      homepageItems: [
        { resource: "caseStudy", id: hero._id, visible: true, isHero: true },
        { resource: "caseStudy", id: gridItem._id, visible: true, isHero: false },
        { resource: "caseStudy", id: hiddenItem._id, visible: false, isHero: false },
      ],
    });

    const result = await getHomepageContent();
    expect(result.hero?.title).toBe("Hero Pick");
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.title).toBe("Grid Pick");
  });

  it("falls back to the deprecated featuredCaseStudyId when homepageItems is empty", async () => {
    const user = await User.create({
      email: "legacy-settings-author@example.com",
      name: "Legacy Settings Author",
      passwordHash: "unused-in-tests",
      role: "admin",
      sessionVersion: 0,
    });

    const picked = await CaseStudy.create({
      slug: "legacy-singular-pick",
      client: "Legacy Singular Pick",
      industry: "Testing",
      practiceArea: "software",
      summary: "Picked via the old singular field.",
      content: [{ id: "b1", type: "markdown", data: { markdown: "Body." } }],
      status: "published",
      publishedAt: new Date("2026-01-01"),
      createdBy: user._id,
    });

    // Bypasses Mongoose (no schema defaults) — a settings document saved
    // before `homepageItems` existed, still carrying the old singular field.
    await SiteSettings.collection.insertOne({
      singletonKey: "default",
      companyName: "Test Co",
      seo: { defaultTitle: "Test", defaultDescription: "Test" },
      featuredCaseStudyId: picked._id,
    });

    const { hero } = await getHomepageContent();
    expect(hero?.title).toBe("Legacy Singular Pick");
  });
});

describe("getPublicTeamMembers — already-guarded contributors read", () => {
  it("returns an empty list for an empty/undefined id list without throwing", async () => {
    await expect(getPublicTeamMembers([])).resolves.toEqual([]);
    await expect(getPublicTeamMembers([undefined, undefined])).resolves.toEqual([]);
  });
});

describe("findPublishedWithCardMeta — the shared list-page helper", () => {
  it("normalizes legacy documents and batch-resolves contributors in one call, not one per document", async () => {
    const user = await User.create({
      email: "card-meta-author@example.com",
      name: "Card Meta Author",
      passwordHash: "unused-in-tests",
      role: "admin",
      sessionVersion: 0,
    });

    const member = await TeamMember.create({
      username: "card-meta-member",
      name: "Card Meta Member",
      role: "Engineer",
      bio: "Bio.",
      socials: { email: "member@example.com" },
      linkedUserId: user._id,
      status: "published",
      profileVisible: true,
      createdBy: user._id,
    });

    await CaseStudy.create({
      slug: "normal-case-study",
      client: "Normal Client",
      industry: "Testing",
      practiceArea: "software",
      summary: "A normally-shaped document.",
      content: [{ id: "b1", type: "markdown", data: { markdown: "Body." } }],
      techTags: ["Go"],
      contributors: [member._id],
      status: "published",
      publishedAt: new Date("2026-01-01"),
      createdBy: user._id,
    });

    // Bypasses Mongoose — a legacy document missing content/techTags/
    // contributors entirely, exactly like `insertLegacyCaseStudy` above.
    await CaseStudy.collection.insertOne({
      slug: "legacy-for-card-meta",
      client: "Legacy For Card Meta",
      industry: "Testing",
      practiceArea: "software",
      summary: "A legacy document.",
      status: "published",
      publishedAt: new Date("2026-02-01"),
      version: 0,
      createdBy: user._id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const { docs, contributorsById } = await findPublishedWithCardMeta<CaseStudyDocument>(
      CaseStudy,
      "techTags",
    );

    expect(docs).toHaveLength(2);
    const legacy = docs.find((doc) => doc.slug === "legacy-for-card-meta");
    expect(legacy?.content).toEqual([]);
    expect(legacy?.techTags).toEqual([]);
    expect(legacy?.contributors).toEqual([]);

    const normal = docs.find((doc) => doc.slug === "normal-case-study");
    expect(normal?.techTags).toEqual(["Go"]);
    expect(contributorsById.get(member._id.toString())?.name).toBe("Card Meta Member");
  });
});

describe("getTeamMemberContributions — the reverse of contributors/authorId", () => {
  it("surfaces every published Case Study/Build/Note that credits this person, across collections, with no duplicated data", async () => {
    const user = await User.create({
      email: "linked-user@example.com",
      name: "Linked User",
      passwordHash: "unused-in-tests",
      role: "teammate",
      sessionVersion: 0,
    });

    const member = await TeamMember.create({
      username: "jane-doe",
      name: "Jane Doe",
      role: "Engineer",
      bio: "Bio text.",
      socials: { email: "jane@example.com" },
      linkedUserId: user._id,
      status: "published",
      profileVisible: true,
      createdBy: user._id,
    });
    const memberId = member._id.toString();

    await CaseStudy.create({
      slug: "credited-case-study",
      client: "Credited Client",
      industry: "Testing",
      practiceArea: "software",
      summary: "A case study crediting Jane.",
      content: [{ id: "b1", type: "markdown", data: { markdown: "Body." } }],
      contributors: [memberId],
      status: "published",
      publishedAt: new Date("2026-01-01"),
      createdBy: user._id,
    });

    // A Build has no public detail route yet — still surfaced, but with
    // `href: null` rather than a fabricated URL.
    await Build.create({
      slug: "credited-build",
      title: "Credited Build",
      tagline: "A build crediting Jane.",
      practiceArea: "software",
      content: [{ id: "b1", type: "markdown", data: { markdown: "Body." } }],
      contributors: [memberId],
      launchDate: "2026-01-01",
      status: "published",
      publishedAt: new Date("2026-02-01"),
      createdBy: user._id,
    });

    // Note credits via `authorId`, not `contributors` — both must surface.
    await Note.create({
      slug: "credited-note",
      title: "Credited Note",
      summary: "A note authored by Jane.",
      content: [{ id: "b1", type: "markdown", data: { markdown: "Body." } }],
      authorId: memberId,
      category: "Engineering",
      status: "published",
      publishedAt: new Date("2026-03-01"),
      createdBy: user._id,
    });

    const contributions = await getTeamMemberContributions(memberId);

    expect(contributions).toHaveLength(3);
    // Sorted most-recent-first.
    expect(contributions.map((c) => c.title)).toEqual([
      "Credited Note",
      "Credited Build",
      "Credited Client",
    ]);

    const build = contributions.find((c) => c.title === "Credited Build");
    expect(build?.href).toBeNull();
    const caseStudy = contributions.find((c) => c.title === "Credited Client");
    expect(caseStudy?.href).toBe("/work/credited-case-study");
  });

  it("returns an empty list for a Team Member with no credited work", async () => {
    await expect(getTeamMemberContributions("507f1f77bcf86cd799439011")).resolves.toEqual([]);
  });
});
