import { describe, expect, it, vi } from "vitest";

// Same seam as `search.test.ts` — see that file's own comment.
vi.mock("@/lib/cms/session", () => ({
  getSessionUser: vi.fn(),
  requireSessionUser: vi.fn(),
  requireRole: vi.fn(),
}));

import "@/lib/cms/collections";
import { publicSearch } from "@/lib/cms/search";
import { CaseStudy } from "@/models/case-study";
import { Build } from "@/models/build";
import { fakeObjectId } from "./helpers";

async function makeCaseStudy(client: string, status: "draft" | "published") {
  return CaseStudy.create({
    client,
    slug: client.toLowerCase().replace(/\s+/g, "-"),
    industry: "Retail",
    practiceArea: "software",
    summary: "A summary.",
    content: [],
    status,
    version: status === "published" ? 1 : 0,
    createdBy: fakeObjectId(),
  });
}

describe("publicSearch", () => {
  it("finds a published document and links to its real public route", async () => {
    await makeCaseStudy("Acme Rockets", "published");
    const results = await publicSearch("rocket");
    const group = results.find((entry) => entry.resource === "caseStudy");
    expect(group).toBeDefined();
    expect(group!.items[0]!.label).toBe("Acme Rockets");
    expect(group!.items[0]!.href).toBe("/work/acme-rockets");
  });

  it("never returns an unpublished (draft) document", async () => {
    await makeCaseStudy("Secret Draft Rockets", "draft");
    const results = await publicSearch("rocket");
    expect(results.find((entry) => entry.resource === "caseStudy")).toBeUndefined();
  });

  it("excludes Build — it's registered but has no publicRoute (no public detail page yet)", async () => {
    await Build.create({
      title: "Rocket Builder",
      slug: "rocket-builder",
      tagline: "A tagline.",
      practiceArea: "software",
      content: [],
      status: "published",
      version: 1,
      launchDate: new Date(),
      createdBy: fakeObjectId(),
    });
    const results = await publicSearch("rocket");
    expect(results.find((entry) => entry.resource === "build")).toBeUndefined();
  });

  it("returns nothing for an empty query", async () => {
    const results = await publicSearch("   ");
    expect(results).toEqual([]);
  });

  it("returns nothing for a query with no matches", async () => {
    await makeCaseStudy("Acme Rockets", "published");
    const results = await publicSearch("no-such-thing-xyz");
    expect(results).toEqual([]);
  });
});
