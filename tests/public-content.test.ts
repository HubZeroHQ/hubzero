import { describe, expect, it } from "vitest";

import {
  findOnePublished,
  getFeaturedCaseStudy,
  getPublicTeamMembers,
} from "@/lib/cms/public-content";
import { withArrayDefault, withCardFieldDefaults } from "@/models/shared/card-fields";
import { CaseStudy, type CaseStudyDocument } from "@/models/case-study";
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

describe("getFeaturedCaseStudy — homepage read path", () => {
  it("returns a normalized document even when the only published Case Study is a legacy one", async () => {
    await insertLegacyCaseStudy({ featured: true });

    const doc = await getFeaturedCaseStudy();

    expect(doc).not.toBeNull();
    expect(doc?.content).toEqual([]);
    expect(doc?.techTags).toEqual([]);
    expect(() => doc?.content.map((b) => b)).not.toThrow();
  });

  it("returns null gracefully when no Case Study is published yet — no hardcoded fallback", async () => {
    const doc = await getFeaturedCaseStudy();
    expect(doc).toBeNull();
  });
});

describe("getPublicTeamMembers — already-guarded contributors read", () => {
  it("returns an empty list for an empty/undefined id list without throwing", async () => {
    await expect(getPublicTeamMembers([])).resolves.toEqual([]);
    await expect(getPublicTeamMembers([undefined, undefined])).resolves.toEqual([]);
  });
});
