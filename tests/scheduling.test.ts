import { beforeEach, describe, expect, it, vi } from "vitest";

// Same seam as `crud-actions.test.ts` — see that file's own comment.
vi.mock("@/lib/cms/session", () => ({
  getSessionUser: vi.fn(),
  requireSessionUser: vi.fn(),
  requireRole: vi.fn(),
}));

import { getSessionUser } from "@/lib/cms/session";
import { createCrudActions } from "@/lib/cms/crud-actions";
import { testimonialConfig } from "@/lib/cms/collections/testimonial.config";
import { ForbiddenError } from "@/lib/cms/permissions";
import { runDueSchedules } from "@/lib/cms/scheduler";
import { VersionHistory } from "@/models/version-history";
import { User } from "@/models/user";
import type { SessionUser } from "@/types/cms";
import { fakeObjectId, toFormData } from "./helpers";

function loginAs(user: SessionUser | null) {
  vi.mocked(getSessionUser).mockResolvedValue(user);
}

async function realUserId(role: SessionUser["role"] = "admin"): Promise<string> {
  const created = await User.create({
    email: `${Math.random().toString(36).slice(2)}@example.com`,
    name: "Test User",
    passwordHash: "unused-in-tests",
    role,
    sessionVersion: 0,
  });
  return created._id.toString();
}

describe("scheduling — schedulePublish/cancelSchedule/archive/restoreArchive", () => {
  const {
    create,
    publish,
    schedulePublish,
    scheduleUnpublish,
    cancelSchedule,
    archive,
    restoreArchive,
  } = createCrudActions(testimonialConfig);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("schedulePublish moves a draft to scheduled without publishing it", async () => {
    const adminId = await realUserId("admin");
    loginAs({ id: adminId, email: "a@b.com", name: "A", role: "admin", dynamicPermissions: [] });

    const created = await create(
      { status: "idle" },
      toFormData({ quote: "Q", name: "N", title: "T" }),
    );
    const futureDate = new Date(Date.now() + 60_000);
    const result = await schedulePublish(created.id as string, futureDate);
    expect(result.status).toBe("success");

    const doc = await testimonialConfig.model.findById(created.id).lean<{ status: string }>();
    expect(doc?.status).toBe("scheduled");

    // Nothing versioned yet — only an actual publish does that.
    expect(await VersionHistory.countDocuments({ documentId: created.id })).toBe(0);
  });

  it("cancelSchedule reverts a scheduled document back to draft", async () => {
    const adminId = await realUserId("admin");
    loginAs({ id: adminId, email: "a@b.com", name: "A", role: "admin", dynamicPermissions: [] });

    const created = await create(
      { status: "idle" },
      toFormData({ quote: "Q", name: "N", title: "T" }),
    );
    await schedulePublish(created.id as string, new Date(Date.now() + 60_000));
    const canceled = await cancelSchedule(created.id as string);
    expect(canceled.status).toBe("success");

    const doc = await testimonialConfig.model
      .findById(created.id)
      .lean<{ status: string; scheduledPublishAt: unknown }>();
    expect(doc?.status).toBe("draft");
    expect(doc?.scheduledPublishAt).toBeFalsy();
  });

  it("archive removes a published document from the live state, restoreArchive brings it back as a draft", async () => {
    const adminId = await realUserId("admin");
    loginAs({ id: adminId, email: "a@b.com", name: "A", role: "admin", dynamicPermissions: [] });

    const created = await create(
      { status: "idle" },
      toFormData({ quote: "Q", name: "N", title: "T" }),
    );
    await publish(created.id as string);

    const archived = await archive(created.id as string);
    expect(archived.status).toBe("success");
    let doc = await testimonialConfig.model.findById(created.id).lean<{ status: string }>();
    expect(doc?.status).toBe("archived");

    const restored = await restoreArchive(created.id as string);
    expect(restored.status).toBe("success");
    doc = await testimonialConfig.model.findById(created.id).lean<{ status: string }>();
    expect(doc?.status).toBe("draft");
  });

  it("restoreArchive refuses a document that isn't archived", async () => {
    const adminId = await realUserId("admin");
    loginAs({ id: adminId, email: "a@b.com", name: "A", role: "admin", dynamicPermissions: [] });

    const created = await create(
      { status: "idle" },
      toFormData({ quote: "Q", name: "N", title: "T" }),
    );
    const result = await restoreArchive(created.id as string);
    expect(result.status).toBe("error");
  });

  it("scheduleUnpublish keeps a document published until the scheduler archives it", async () => {
    const adminId = await realUserId("admin");
    loginAs({ id: adminId, email: "a@b.com", name: "A", role: "admin", dynamicPermissions: [] });

    const created = await create(
      { status: "idle" },
      toFormData({ quote: "Q", name: "N", title: "T" }),
    );
    await publish(created.id as string);
    await scheduleUnpublish(created.id as string, new Date(Date.now() + 60_000));

    const doc = await testimonialConfig.model
      .findById(created.id)
      .lean<{ status: string; scheduledUnpublishAt: unknown }>();
    expect(doc?.status).toBe("published");
    expect(doc?.scheduledUnpublishAt).toBeTruthy();
  });

  it("a teammate without a publish grant cannot schedule, cancel, archive, or restore", async () => {
    const adminId = await realUserId("admin");
    loginAs({ id: adminId, email: "a@b.com", name: "A", role: "admin", dynamicPermissions: [] });
    const created = await create(
      { status: "idle" },
      toFormData({ quote: "Q", name: "N", title: "T" }),
    );
    await publish(created.id as string);

    loginAs({
      id: fakeObjectId(),
      email: "t@example.com",
      name: "Teammate",
      role: "teammate",
      dynamicPermissions: [],
    });

    const futureDate = new Date(Date.now() + 60_000);
    await expect(schedulePublish(created.id as string, futureDate)).rejects.toThrow(ForbiddenError);
    await expect(scheduleUnpublish(created.id as string, futureDate)).rejects.toThrow(
      ForbiddenError,
    );
    await expect(cancelSchedule(created.id as string)).rejects.toThrow(ForbiddenError);
    await expect(archive(created.id as string)).rejects.toThrow(ForbiddenError);
    await expect(restoreArchive(created.id as string)).rejects.toThrow(ForbiddenError);
  });
});

describe("runDueSchedules", () => {
  const { create, schedulePublish, publish, scheduleUnpublish } =
    createCrudActions(testimonialConfig);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("publishes a due scheduled document and snapshots a version, attributed to its author", async () => {
    const adminId = await realUserId("admin");
    loginAs({ id: adminId, email: "a@b.com", name: "A", role: "admin", dynamicPermissions: [] });

    const created = await create(
      { status: "idle" },
      toFormData({ quote: "Q", name: "N", title: "T" }),
    );
    // A moment in the past — already due.
    await schedulePublish(created.id as string, new Date(Date.now() - 1000));

    const results = await runDueSchedules();
    const own = results.find((r) => r.documentId === created.id);
    expect(own?.status).toBe("success");
    expect(own?.action).toBe("publish");

    const doc = await testimonialConfig.model.findById(created.id).lean<{ status: string }>();
    expect(doc?.status).toBe("published");
    expect(await VersionHistory.countDocuments({ documentId: created.id })).toBe(1);
  });

  it("does not touch a document whose scheduled moment hasn't arrived yet", async () => {
    const adminId = await realUserId("admin");
    loginAs({ id: adminId, email: "a@b.com", name: "A", role: "admin", dynamicPermissions: [] });

    const created = await create(
      { status: "idle" },
      toFormData({ quote: "Q", name: "N", title: "T" }),
    );
    await schedulePublish(created.id as string, new Date(Date.now() + 60 * 60 * 1000));

    const results = await runDueSchedules();
    expect(results.find((r) => r.documentId === created.id)).toBeUndefined();

    const doc = await testimonialConfig.model.findById(created.id).lean<{ status: string }>();
    expect(doc?.status).toBe("scheduled");
  });

  it("archives a due scheduled-unpublish document", async () => {
    const adminId = await realUserId("admin");
    loginAs({ id: adminId, email: "a@b.com", name: "A", role: "admin", dynamicPermissions: [] });

    const created = await create(
      { status: "idle" },
      toFormData({ quote: "Q", name: "N", title: "T" }),
    );
    await publish(created.id as string);
    await scheduleUnpublish(created.id as string, new Date(Date.now() - 1000));

    const results = await runDueSchedules();
    const own = results.find((r) => r.documentId === created.id);
    expect(own?.status).toBe("success");
    expect(own?.action).toBe("archive");

    const doc = await testimonialConfig.model.findById(created.id).lean<{ status: string }>();
    expect(doc?.status).toBe("archived");
  });
});
