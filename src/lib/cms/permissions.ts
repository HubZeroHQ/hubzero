import { getSessionUser } from "@/lib/cms/session";
import type { Action, Resource, SessionUser, UserRole } from "@/types/cms";

/**
 * The single declarative permission table — `ARCHITECTURE/19_CMS_FOUNDATION.md`
 * §3. Adding a role, a resource, or a dynamic permission is a data change
 * here, never a new code path anywhere else in the app.
 */

const allActions: Action[] = [
  "view",
  "create",
  "edit",
  "editOwn",
  "publish",
  "approve",
  "delete",
  "manageUsers",
];

const allResources: Resource[] = [
  "caseStudy",
  "build",
  "labsProject",
  "blueprint",
  "teamMember",
  "testimonial",
  "service",
  "blogPost",
  "faq",
  "careerListing",
  "lead",
  "siteSettings",
  "user",
];

/** Head Admin's "everything, every resource" grant, expressed once rather than repeated per resource. */
const wildcardGrants: Partial<Record<Resource, Action[]>> = Object.fromEntries(
  allResources.map((resource) => [resource, allActions]),
);

const roleGrants: Record<UserRole, Partial<Record<Resource, Action[]>>> = {
  head_admin: wildcardGrants,

  admin: {
    // Company-wide content — Admin can publish directly (09_CMS_ARCHITECTURE §3, §4).
    caseStudy: ["view", "create", "edit", "publish", "approve", "delete"],
    build: ["view", "create", "edit", "publish", "approve", "delete"],
    blueprint: ["view", "create", "edit", "publish", "approve", "delete"],
    labsProject: ["view", "create", "edit", "publish", "delete"],
    testimonial: ["view", "create", "edit", "publish", "delete"],
    service: ["view", "create", "edit", "publish", "delete"],
    faq: ["view", "create", "edit", "publish", "delete"],
    careerListing: ["view", "create", "edit", "publish", "delete"],
    // Personal content — Admin can author their own posts and approve/publish
    // Teammate submissions, but does not gain a blanket "edit" over every post.
    blogPost: ["view", "create", "editOwn", "approve", "publish"],
    // "Can edit only their own individual portfolio, not another user's" (09 §4).
    teamMember: ["view", "editOwn"],
    lead: ["view", "edit", "delete"],
    // Admin explicitly cannot manage users, roles, permissions, or site settings (09 §4).
  },

  teammate: {
    teamMember: ["view", "editOwn"],
    // Personal content — create/edit own drafts, submit for review; no direct publish.
    blogPost: ["view", "create", "editOwn"],
    // Deliberately no grants on company-content resources (caseStudy, build,
    // blueprint, labsProject, testimonial, service, faq, careerListing) or
    // lead/siteSettings/user — 09_CMS_ARCHITECTURE §4 scopes a Teammate to
    // "own profile, own portfolio, own blog drafts," nothing broader. A
    // Teammate reads company content on the public site, not through
    // `/studio` — they have no reason to hold a `view` grant there.
  },
};

/**
 * Dynamic permissions are additive grants layered on top of a role's base
 * grants (09_CMS_ARCHITECTURE §4) — a data change here when a new one is
 * needed, never a redesign of `can()` or any collection.
 */
const dynamicPermissionGrants: Record<string, Partial<Record<Resource, Action[]>>> = {
  team_lead: {
    // Project-tracking-specific grants, once that collection exists.
  },
  // future: blog_reviewer, recruiter, hr, finance, sales, client_manager, moderator, ...
};

export class ForbiddenError extends Error {
  constructor(message = "You do not have permission to perform this action.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/**
 * The one function every enforcement point in the system calls
 * (`ARCHITECTURE/19_CMS_FOUNDATION.md` §3): the Server Action performing a
 * mutation, the page/layout deciding whether to render a screen, and
 * (optionally, never as the actual security boundary) the UI deciding
 * whether to show a control.
 */
export function can(
  user: SessionUser,
  action: Action,
  resource: Resource,
  target?: { createdBy?: string },
): boolean {
  const grants = [
    ...(roleGrants[user.role][resource] ?? []),
    ...user.dynamicPermissions.flatMap(
      (permission) => dynamicPermissionGrants[permission]?.[resource] ?? [],
    ),
  ];

  if (grants.includes(action)) return true;
  if (action === "edit" && grants.includes("editOwn")) {
    return target?.createdBy !== undefined && target.createdBy === user.id;
  }

  return false;
}

/**
 * The enforcement point every Server Action must call before mutating
 * anything. Throws rather than redirects — a Server Action is a mutation,
 * not a page render, so a `next/navigation` redirect is the wrong response
 * to "not allowed"; the caller's `useActionState` error path is.
 */
export async function requirePermission(
  action: Action,
  resource: Resource,
  target?: { createdBy?: string },
): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new ForbiddenError("You must be signed in to perform this action.");
  if (!can(user, action, resource, target)) throw new ForbiddenError();
  return user;
}
