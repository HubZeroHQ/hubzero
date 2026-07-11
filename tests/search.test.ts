import { describe, expect, it } from "vitest";

// Same seam as `crud-actions.test.ts`: `can()`/`requirePermission()` need a
// signed-in user, which in production comes from `getSessionUser()`'s
// cookie-backed session lookup — irrelevant here since `globalSearch`/
// `getQuickCreateActions` both take a `SessionUser` directly as a parameter,
// but importing the collection registry still pulls in every collection's
// config module transitively, so the same session-module mock keeps the
// import graph loadable under plain Vitest.
import { vi } from "vitest";
vi.mock("@/lib/cms/session", () => ({
  getSessionUser: vi.fn(),
  requireSessionUser: vi.fn(),
  requireRole: vi.fn(),
}));

import "@/lib/cms/collections";
import { getQuickCreateActions, globalSearch } from "@/lib/cms/search";
import { CaseStudy } from "@/models/case-study";
import type { SessionUser } from "@/types/cms";
import { fakeObjectId } from "./helpers";

function user(overrides: Partial<SessionUser> = {}): SessionUser {
  return {
    id: "user-1",
    email: "user@example.com",
    name: "Test User",
    role: "admin",
    dynamicPermissions: [],
    ...overrides,
  };
}

async function makeCaseStudy(client: string) {
  return CaseStudy.create({
    client,
    slug: client.toLowerCase().replace(/\s+/g, "-"),
    industry: "Retail",
    practiceArea: "software",
    summary: "A summary.",
    content: [],
    status: "draft",
    version: 0,
    createdBy: fakeObjectId(),
  });
}

describe("globalSearch", () => {
  it("finds a matching document across a registered collection", async () => {
    await makeCaseStudy("Acme Rockets");
    const results = await globalSearch(user({ role: "admin" }), "rocket");
    const group = results.find((entry) => entry.resource === "caseStudy");
    expect(group).toBeDefined();
    expect(group!.items[0]!.label).toBe("Acme Rockets");
  });

  it("returns nothing for a query with no matches", async () => {
    await makeCaseStudy("Acme Rockets");
    const results = await globalSearch(user({ role: "admin" }), "no-such-thing-xyz");
    expect(results).toEqual([]);
  });

  it("returns nothing for an empty query", async () => {
    const results = await globalSearch(user({ role: "admin" }), "   ");
    expect(results).toEqual([]);
  });

  it("never returns a collection the signed-in user cannot view (teammate has no caseStudy grant)", async () => {
    await makeCaseStudy("Acme Rockets");
    const results = await globalSearch(user({ role: "teammate" }), "rocket");
    expect(results.find((entry) => entry.resource === "caseStudy")).toBeUndefined();
  });
});

describe("getQuickCreateActions", () => {
  it("includes a quick-create action only for collections the user can create", () => {
    const adminActions = getQuickCreateActions(user({ role: "admin" }));
    expect(adminActions.some((action) => action.label === "New Case Study")).toBe(true);

    const teammateActions = getQuickCreateActions(user({ role: "teammate" }));
    expect(teammateActions.some((action) => action.label === "New Case Study")).toBe(false);
  });

  it("always points a quick-create action at that collection's own /new route", () => {
    const actions = getQuickCreateActions(user({ role: "admin" }));
    const caseStudyAction = actions.find((action) => action.label === "New Case Study");
    expect(caseStudyAction?.href).toBe("/studio/case-studies/new");
  });
});
