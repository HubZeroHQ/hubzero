import { describe, expect, it, vi } from "vitest";

// `permissions.ts` also exports `requirePermission`, which imports
// `getSessionUser` from `session.ts` — and `session.ts` imports `auth.ts`,
// which constructs the full NextAuth config at module load (pulling in
// `next/server`, unavailable outside Next's own runtime). `can()` itself
// is pure and never touches any of that, but mocking the one module at the
// root of that chain is what lets this file import `permissions.ts` at all
// in a plain Vitest/Node environment.
vi.mock("@/lib/cms/session", () => ({
  getSessionUser: vi.fn(),
  requireSessionUser: vi.fn(),
  requireRole: vi.fn(),
}));

import { can } from "@/lib/cms/permissions";
import type { SessionUser } from "@/types/cms";

/**
 * `can()` (`lib/cms/permissions.ts`) is the single enforcement function every
 * Server Action, page, and UI control is supposed to route through
 * (`ARCHITECTURE/19_CMS_FOUNDATION.md` §3) — a pure function, no database or
 * session dependency, so it's tested directly against the declarative
 * `roleGrants`/`dynamicPermissionGrants` tables rather than through an
 * end-to-end request.
 */

function user(overrides: Partial<SessionUser> = {}): SessionUser {
  return {
    id: "user-1",
    email: "user@example.com",
    name: "Test User",
    role: "teammate",
    dynamicPermissions: [],
    ...overrides,
  };
}

describe("can() — role grants", () => {
  it("head_admin can do anything on any resource (wildcard grant)", () => {
    const headAdmin = user({ role: "head_admin" });
    expect(can(headAdmin, "manageUsers", "user")).toBe(true);
    expect(can(headAdmin, "delete", "siteSettings")).toBe(true);
    expect(can(headAdmin, "publish", "blueprint")).toBe(true);
  });

  it("admin can view/create/edit/publish/delete company-wide content", () => {
    const admin = user({ role: "admin" });
    expect(can(admin, "view", "caseStudy")).toBe(true);
    expect(can(admin, "create", "caseStudy")).toBe(true);
    expect(can(admin, "publish", "caseStudy")).toBe(true);
    expect(can(admin, "delete", "caseStudy")).toBe(true);
  });

  it("admin explicitly cannot manage users or site settings (09_CMS_ARCHITECTURE §4)", () => {
    const admin = user({ role: "admin" });
    expect(can(admin, "manageUsers", "user")).toBe(false);
    expect(can(admin, "edit", "siteSettings")).toBe(false);
    expect(can(admin, "view", "siteSettings")).toBe(false);
  });

  it("teammate has no grant at all on company-wide content resources", () => {
    const teammate = user({ role: "teammate" });
    for (const resource of ["caseStudy", "build", "blueprint", "testimonial", "faq"] as const) {
      expect(can(teammate, "view", resource)).toBe(false);
      expect(can(teammate, "create", resource)).toBe(false);
    }
  });

  it("teammate can create/editOwn notes but never publish directly", () => {
    const teammate = user({ role: "teammate" });
    expect(can(teammate, "create", "note")).toBe(true);
    expect(can(teammate, "publish", "note")).toBe(false);
  });
});

describe("can() — editOwn fallback", () => {
  it("grants edit when the target's owner matches the acting user", () => {
    const teammate = user({ role: "teammate", id: "owner-1" });
    expect(can(teammate, "edit", "teamMember", { createdBy: "owner-1" })).toBe(true);
  });

  it("denies edit when the target's owner does not match", () => {
    const teammate = user({ role: "teammate", id: "owner-1" });
    expect(can(teammate, "edit", "teamMember", { createdBy: "someone-else" })).toBe(false);
  });

  it("denies edit when editOwn is the only grant and no target is supplied at all", () => {
    const teammate = user({ role: "teammate", id: "owner-1" });
    expect(can(teammate, "edit", "teamMember")).toBe(false);
  });

  it("editOwn never implies delete — a separate, undeclared grant", () => {
    const teammate = user({ role: "teammate", id: "owner-1" });
    expect(can(teammate, "delete", "teamMember", { createdBy: "owner-1" })).toBe(false);
  });
});

describe("can() — dynamic permissions", () => {
  it("an unrecognized dynamic permission grants nothing (fails safe)", () => {
    const teammate = user({ role: "teammate", dynamicPermissions: ["not_a_real_permission"] });
    expect(can(teammate, "publish", "note")).toBe(false);
  });

  it("dynamicPermissions are additive on top of the role's own base grants", () => {
    // team_lead is currently an empty grant set (`permissions.ts`'s own
    // documented placeholder) — holding it shouldn't grant anything beyond
    // what the base role already has, and shouldn't take anything away.
    const teammate = user({ role: "teammate", dynamicPermissions: ["team_lead"] });
    expect(can(teammate, "create", "note")).toBe(true);
    expect(can(teammate, "publish", "caseStudy")).toBe(false);
  });
});
