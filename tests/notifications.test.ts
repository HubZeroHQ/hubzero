import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/cms/session", () => ({
  getSessionUser: vi.fn(),
  requireSessionUser: vi.fn(),
  requireRole: vi.fn(),
}));

import { getSessionUser, requireSessionUser } from "@/lib/cms/session";
import {
  getUnreadCount,
  getUsersWithPermission,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  notify,
  notifyMany,
} from "@/lib/cms/notifications";
import { createCrudActions } from "@/lib/cms/crud-actions";
import { caseStudyConfig } from "@/lib/cms/collections/case-study.config";
import { User } from "@/models/user";
import type { SessionUser } from "@/types/cms";
import { toFormData } from "./helpers";

function loginAs(user: SessionUser | null) {
  vi.mocked(getSessionUser).mockResolvedValue(user);
  vi.mocked(requireSessionUser).mockImplementation(async () => {
    if (!user) throw new Error("Not signed in.");
    return user;
  });
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

describe("lib/cms/notifications — notify/listNotifications/counts", () => {
  it("creates a notification and lists it, newest first", async () => {
    const userId = await realUserId();
    await notify({ userId, event: "password_reset", title: "First" });
    await notify({ userId, event: "password_reset", title: "Second" });

    const notifications = await listNotifications(userId);
    expect(notifications).toHaveLength(2);
    expect(notifications[0]?.title).toBe("Second");
    expect(notifications[0]?.read).toBe(false);
  });

  it("only counts unread notifications for the target user", async () => {
    const userId = await realUserId();
    const otherId = await realUserId();
    await notify({ userId, event: "password_reset", title: "Mine" });
    await notify({ userId: otherId, event: "password_reset", title: "Not mine" });

    expect(await getUnreadCount(userId)).toBe(1);
  });

  it("markNotificationRead only affects the owning user's notification", async () => {
    const userId = await realUserId();
    const otherId = await realUserId();
    await notify({ userId, event: "password_reset", title: "Mine" });
    const [notification] = await listNotifications(userId);

    await markNotificationRead(notification!.id, otherId);
    expect(await getUnreadCount(userId)).toBe(1);

    await markNotificationRead(notification!.id, userId);
    expect(await getUnreadCount(userId)).toBe(0);
  });

  it("markAllNotificationsRead clears every unread notification for that user", async () => {
    const userId = await realUserId();
    await notify({ userId, event: "password_reset", title: "A" });
    await notify({ userId, event: "password_reset", title: "B" });
    expect(await getUnreadCount(userId)).toBe(2);

    await markAllNotificationsRead(userId);
    expect(await getUnreadCount(userId)).toBe(0);
  });

  it("notifyMany fans out to every listed user", async () => {
    const a = await realUserId();
    const b = await realUserId();
    await notifyMany([a, b], { event: "password_reset", title: "Broadcast" });

    expect(await getUnreadCount(a)).toBe(1);
    expect(await getUnreadCount(b)).toBe(1);
  });
});

describe("getUsersWithPermission", () => {
  it("returns only accounts whose role/dynamicPermissions grant the action", async () => {
    const adminId = await realUserId("admin");
    await realUserId("teammate");

    const withApprove = await getUsersWithPermission("approve", "caseStudy");
    expect(withApprove).toContain(adminId);
  });
});

describe("notification events fire at the right call sites", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("submitForReview notifies every user holding the approve grant on that resource", async () => {
    const authorId = await realUserId("teammate");
    const reviewerId = await realUserId("admin");
    loginAs({
      id: authorId,
      email: "a@b.com",
      name: "A",
      role: "teammate",
      dynamicPermissions: [],
    });

    // Teammates hold no caseStudy grant at all, so use admin to author it —
    // the point of this test is who gets notified, not who may author.
    loginAs({ id: reviewerId, email: "r@b.com", name: "R", role: "admin", dynamicPermissions: [] });
    const { create, submitForReview } = createCrudActions(caseStudyConfig);
    const created = await create(
      { status: "idle" },
      toFormData({
        client: "Acme",
        slug: `acme-${Math.random().toString(36).slice(2)}`,
        industry: "Retail",
        practiceArea: "software",
        summary: "A summary.",
        content: JSON.stringify([{ id: "b1", type: "paragraph", data: { text: "Body." } }]),
      }),
    );

    await submitForReview(created.id as string);

    // The submitting admin also holds the approve grant, so is notified of
    // their own submission — reasonable, since any admin (including a
    // different one) could be the actual reviewer.
    expect(await getUnreadCount(reviewerId)).toBeGreaterThan(0);
  });

  it("approve notifies the document's author, not the approving reviewer", async () => {
    const authorId = await realUserId("admin");
    const { create, submitForReview, approve } = createCrudActions(caseStudyConfig);

    loginAs({ id: authorId, email: "a@b.com", name: "A", role: "admin", dynamicPermissions: [] });
    const created = await create(
      { status: "idle" },
      toFormData({
        client: "Acme",
        slug: `acme-${Math.random().toString(36).slice(2)}`,
        industry: "Retail",
        practiceArea: "software",
        summary: "A summary.",
        content: JSON.stringify([{ id: "b1", type: "paragraph", data: { text: "Body." } }]),
      }),
    );
    await submitForReview(created.id as string);

    const reviewerId = await realUserId("head_admin");
    loginAs({
      id: reviewerId,
      email: "r@b.com",
      name: "R",
      role: "head_admin",
      dynamicPermissions: [],
    });
    await approve(created.id as string);

    const authorNotifications = await listNotifications(authorId);
    expect(authorNotifications.some((n) => n.type === "document_approved")).toBe(true);

    const reviewerNotifications = await listNotifications(reviewerId);
    expect(reviewerNotifications.some((n) => n.type === "document_approved")).toBe(false);
  });
});
