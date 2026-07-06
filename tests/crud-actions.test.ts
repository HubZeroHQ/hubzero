import { beforeEach, describe, expect, it, vi } from "vitest";

// `requirePermission` (`lib/cms/permissions.ts`) reads the signed-in user via
// `getSessionUser` (`lib/cms/session.ts`), which in production reads an
// Auth.js JWT from the request's cookies — there is no HTTP request in a
// Vitest run. Mocking this one boundary (the identity lookup) is the
// standard seam: everything behind it — Zod validation, Mongoose writes,
// workflow transitions, version snapshots — runs for real against the
// in-memory MongoDB (`tests/setup.ts`), exactly the app's real code path.
vi.mock("@/lib/cms/session", () => ({
  getSessionUser: vi.fn(),
  requireSessionUser: vi.fn(),
  requireRole: vi.fn(),
}));

import { getSessionUser } from "@/lib/cms/session";
import { ForbiddenError } from "@/lib/cms/permissions";
import { createCrudActions } from "@/lib/cms/crud-actions";
import { blueprintConfig } from "@/lib/cms/collections/blueprint.config";
import { caseStudyConfig } from "@/lib/cms/collections/case-study.config";
import { teamMemberConfig } from "@/lib/cms/collections/team-member.config";
import { testimonialConfig } from "@/lib/cms/collections/testimonial.config";
import { VersionHistory } from "@/models/version-history";
import { User } from "@/models/user";
import type { SessionUser } from "@/types/cms";
import { fakeObjectId, toFormData } from "./helpers";

function loginAs(user: SessionUser | null) {
  vi.mocked(getSessionUser).mockResolvedValue(user);
}

async function realUserId(role: SessionUser["role"] = "admin"): Promise<string> {
  const created = await User.create({
    email: `${fakeObjectId()}@example.com`,
    name: "Test User",
    passwordHash: "unused-in-tests",
    role,
    sessionVersion: 0,
  });
  return created._id.toString();
}

describe("createCrudActions — basic draft-publish lifecycle (Testimonial)", () => {
  const { create, list, update, publish, remove } = createCrudActions(testimonialConfig);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("denies create to a role with no grant on the resource", async () => {
    loginAs({ id: "u1", email: "a@b.com", name: "A", role: "teammate", dynamicPermissions: [] });
    await expect(
      create({ status: "idle" }, toFormData({ quote: "Great work.", name: "A", title: "CEO" })),
    ).rejects.toThrow(ForbiddenError);
  });

  it("creates a draft, lists it, updates it, publishes it, then deletes it", async () => {
    const adminId = await realUserId("admin");
    loginAs({
      id: adminId,
      email: "admin@example.com",
      name: "Admin",
      role: "admin",
      dynamicPermissions: [],
    });

    const created = await create(
      { status: "idle" },
      toFormData({ quote: "Great work.", name: "Jane Doe", title: "CEO", company: "Acme" }),
    );
    expect(created.status).toBe("success");
    expect(created.id).toBeTruthy();

    const listed = await list({});
    expect(listed.items).toHaveLength(1);
    expect(listed.items[0]?.status).toBe("draft");

    const updated = await update(
      created.id as string,
      { status: "idle" },
      toFormData({ quote: "Truly great work.", name: "Jane Doe", title: "CEO", company: "Acme" }),
    );
    expect(updated.status).toBe("success");

    const published = await publish(created.id as string);
    expect(published.status).toBe("success");

    const afterPublish = await list({});
    expect(afterPublish.items[0]?.status).toBe("published");
    expect(afterPublish.items[0]?.version).toBe(1);

    // Publishing snapshots a version (`ARCHITECTURE/19_CMS_FOUNDATION.md` §9).
    const versions = await VersionHistory.find({ documentId: created.id }).lean();
    expect(versions).toHaveLength(1);

    const removed = await remove(created.id as string);
    expect(removed.status).toBe("success");
    expect((await list({})).items).toHaveLength(0);
  });

  it("draft-publish collections have no review step", async () => {
    const adminId = await realUserId("admin");
    loginAs({
      id: adminId,
      email: "admin@example.com",
      name: "Admin",
      role: "admin",
      dynamicPermissions: [],
    });
    const created = await create(
      { status: "idle" },
      toFormData({ quote: "Q", name: "N", title: "T" }),
    );
    await expect(
      createCrudActions(testimonialConfig).submitForReview(created.id as string),
    ).rejects.toThrow();
  });
});

describe("createCrudActions — publishGuard (Blueprint)", () => {
  const { create, publish } = createCrudActions(blueprintConfig);

  it('blocks publish while demoStatus isn\'t "live", then allows it once it is', async () => {
    const adminId = await realUserId("admin");
    loginAs({
      id: adminId,
      email: "admin@example.com",
      name: "Admin",
      role: "admin",
      dynamicPermissions: [],
    });

    const content = JSON.stringify([
      { id: "b1", type: "markdown", data: { markdown: "A reusable starter." } },
    ]);

    const created = await create(
      { status: "idle" },
      toFormData({
        name: "Starter Kit",
        blueprintId: "bp-001",
        slug: "starter-kit",
        category: "Web",
        summary: "A reusable starter kit.",
        content,
        demoStatus: "stale",
      }),
    );
    expect(created.status).toBe("success");

    const blocked = await publish(created.id as string);
    if (blocked.status !== "error") throw new Error("Expected publish to be blocked.");
    expect(blocked.message).toMatch(/live/i);

    await createCrudActions(blueprintConfig).update(
      created.id as string,
      { status: "idle" },
      toFormData({
        name: "Starter Kit",
        blueprintId: "bp-001",
        slug: "starter-kit",
        category: "Web",
        summary: "A reusable starter kit.",
        content,
        demoStatus: "live",
      }),
    );

    const allowed = await publish(created.id as string);
    expect(allowed.status).toBe("success");
  });
});

describe("createCrudActions — ownerField / editOwn (TeamMember)", () => {
  const { create, update } = createCrudActions(teamMemberConfig);

  it("lets the linked profile owner edit, and denies every other teammate", async () => {
    const headAdminId = await realUserId("head_admin");
    const ownerId = await realUserId("teammate");
    const otherTeammateId = await realUserId("teammate");

    // A Head Admin onboards the profile — `createdBy` is the admin, not the
    // teammate the profile belongs to (`ARCHITECTURE/19_CMS_FOUNDATION.md` §11).
    loginAs({
      id: headAdminId,
      email: "ha@example.com",
      name: "HA",
      role: "head_admin",
      dynamicPermissions: [],
    });
    const created = await create(
      { status: "idle" },
      toFormData({
        username: `owner-${fakeObjectId().slice(0, 8)}`,
        name: "Owner Person",
        role: "Engineer",
        bio: "Bio text.",
        socialsEmail: "owner@example.com",
        linkedUserId: ownerId,
        skills: "[]",
        experience: "[]",
        education: "[]",
      }),
    );
    expect(created.status).toBe("success");

    // The profile owner (linkedUserId) can edit their own profile via editOwn.
    loginAs({
      id: ownerId,
      email: "owner@example.com",
      name: "Owner",
      role: "teammate",
      dynamicPermissions: [],
    });
    const ownerEdit = await update(
      created.id as string,
      { status: "idle" },
      toFormData({
        username: `owner-${fakeObjectId().slice(0, 8)}`,
        name: "Owner Person",
        role: "Senior Engineer",
        bio: "Updated bio.",
        socialsEmail: "owner@example.com",
        linkedUserId: ownerId,
        skills: "[]",
        experience: "[]",
        education: "[]",
      }),
    );
    expect(ownerEdit.status).toBe("success");

    // A different teammate — not the profile owner, not the row's creator
    // either — must be denied.
    loginAs({
      id: otherTeammateId,
      email: "other@example.com",
      name: "Other",
      role: "teammate",
      dynamicPermissions: [],
    });
    await expect(
      update(
        created.id as string,
        { status: "idle" },
        toFormData({
          username: "hijacked",
          name: "Hijacked",
          role: "Engineer",
          bio: "Bio.",
          socialsEmail: "owner@example.com",
          linkedUserId: ownerId,
          skills: "[]",
          experience: "[]",
          education: "[]",
        }),
      ),
    ).rejects.toThrow(ForbiddenError);
  });
});

describe("createCrudActions — draft-review-publish workflow and restore (Case Study)", () => {
  const { create, submitForReview, publish, update, restoreVersion } =
    createCrudActions(caseStudyConfig);

  function contentField(markdown: string): string {
    return JSON.stringify([{ id: "b1", type: "markdown", data: { markdown } }]);
  }

  it("moves draft → review → published, then restoring an old version returns it to draft with the old content", async () => {
    const adminId = await realUserId("admin");
    loginAs({
      id: adminId,
      email: "admin@example.com",
      name: "Admin",
      role: "admin",
      dynamicPermissions: [],
    });

    const created = await create(
      { status: "idle" },
      toFormData({
        slug: "acme-widgets",
        client: "Acme Widgets",
        industry: "Manufacturing",
        practiceArea: "software",
        summary: "A manufacturing case study.",
        content: contentField("Version one content."),
      }),
    );
    expect(created.status).toBe("success");
    const id = created.id as string;

    const submitted = await submitForReview(id);
    expect(submitted.status).toBe("success");

    const firstPublish = await publish(id);
    expect(firstPublish.status).toBe("success");

    // Edit and publish again — a second version now exists.
    await update(
      id,
      { status: "idle" },
      toFormData({
        slug: "acme-widgets",
        client: "Acme Widgets",
        industry: "Manufacturing",
        practiceArea: "software",
        summary: "A manufacturing case study.",
        content: contentField("Version two content — completely rewritten."),
      }),
    );
    const secondPublish = await publish(id);
    expect(secondPublish.status).toBe("success");

    const versions = await VersionHistory.find({ documentId: id }).sort({ editedAt: 1 }).lean();
    expect(versions).toHaveLength(2);
    const firstVersionId = versions[0]?._id.toString() as string;

    // Restoring the first version doesn't overwrite-and-republish — it
    // creates a draft with that snapshot's content
    // (`ARCHITECTURE/19_CMS_FOUNDATION.md` §9).
    const restored = await restoreVersion(id, firstVersionId);
    expect(restored.status).toBe("success");

    const restoredDoc = await caseStudyConfig.model.findById(id).lean();
    expect(restoredDoc?.status).toBe("draft");
    expect((restoredDoc?.content as { data: { markdown: string } }[])?.[0]?.data.markdown).toBe(
      "Version one content.",
    );
    // Restoring never bumps `version` itself — only `publish()` does.
    expect(restoredDoc?.version).toBe(2);
  });

  it("blocks publishing while a Raw HTML block is present unless the publisher is Admin/Head Admin", async () => {
    const adminId = await realUserId("admin");
    loginAs({
      id: adminId,
      email: "admin2@example.com",
      name: "Admin",
      role: "admin",
      dynamicPermissions: [],
    });

    const created = await create(
      { status: "idle" },
      toFormData({
        slug: "html-block-case",
        client: "HTML Block Co",
        industry: "Testing",
        practiceArea: "software",
        summary: "Has a raw HTML block.",
        content: JSON.stringify([{ id: "b1", type: "html", data: { html: "<div>raw</div>" } }]),
      }),
    );
    expect(created.status).toBe("success");

    // Publish is admin-only for this collection's role grants, so this
    // exercises the "allowed" arm end-to-end; the "blocked for a
    // non-admin/head-admin role" arm is unit-tested directly against
    // `checkHtmlBlockPublishGuard` in `tests/blocks.test.ts`, since Case
    // Study grants no teammate a `publish` permission to attempt the call
    // with in the first place.
    const published = await publish(created.id as string);
    expect(published.status).toBe("success");
  });
});

describe("createCrudActions — getOne/list normalize a legacy document (Case Study)", () => {
  const { getOne, list } = createCrudActions(caseStudyConfig);

  it("getOne never returns content/techTags/contributors/featured as anything but the schema-declared shape, even for a document written before those fields existed", async () => {
    const adminId = await realUserId("admin");
    loginAs({
      id: adminId,
      email: "admin3@example.com",
      name: "Admin",
      role: "admin",
      dynamicPermissions: [],
    });

    // Bypasses Mongoose entirely (no schema defaults applied) — the same
    // "document written before this field existed" shape `tests/blocks.test.ts`
    // and `tests/public-content.test.ts` reproduce for the public read path;
    // this is the Studio (`getOne`/`list`) counterpart of that hazard.
    await caseStudyConfig.model.collection.insertOne({
      slug: "legacy-studio-case",
      client: "Legacy Studio Client",
      industry: "Legacy",
      practiceArea: "software",
      summary: "A legacy document opened in the Studio editor.",
      status: "draft",
      version: 0,
      createdBy: adminId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const inserted = await caseStudyConfig.model.findOne({ slug: "legacy-studio-case" }).lean();
    const id = (inserted?._id as { toString(): string }).toString();

    const doc = await getOne(id);
    expect(doc).not.toBeNull();
    expect(Array.isArray((doc as unknown as { content: unknown }).content)).toBe(true);
    expect(Array.isArray((doc as unknown as { techTags: unknown }).techTags)).toBe(true);
    expect(Array.isArray((doc as unknown as { contributors: unknown }).contributors)).toBe(true);
    expect(typeof (doc as unknown as { featured: unknown }).featured).toBe("boolean");
    // `readingTimeMinutes` is computed, not a form field, so it rides along
    // with the "blocks" field's normalization rather than having its own
    // `FieldConfig` entry — without that, the Studio's list column/edit
    // header would literally render "undefined min read" for this document.
    expect(typeof (doc as unknown as { readingTimeMinutes: unknown }).readingTimeMinutes).toBe(
      "number",
    );

    const { items } = await list({ sort: "createdAt", dir: "desc" });
    const listed = items.find(
      (item) => (item as unknown as { slug: string }).slug === "legacy-studio-case",
    );
    expect(Array.isArray((listed as unknown as { content: unknown }).content)).toBe(true);
  });
});
