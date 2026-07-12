import { beforeEach, describe, expect, it, vi } from "vitest";

// Same seam as `crud-actions.test.ts` — see that file's own comment.
vi.mock("@/lib/cms/session", () => ({
  getSessionUser: vi.fn(),
  requireSessionUser: vi.fn(),
  requireRole: vi.fn(),
}));

import { getSessionUser } from "@/lib/cms/session";
import { ForbiddenError } from "@/lib/cms/permissions";
import { createCrudActions } from "@/lib/cms/crud-actions";
import { caseStudyConfig } from "@/lib/cms/collections/case-study.config";
import { listComments } from "@/lib/cms/comments";
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

async function makeCaseStudyInReview(create: ReturnType<typeof createCrudActions>["create"]) {
  const created = await create(
    { status: "idle" },
    toFormData({
      client: "Acme",
      slug: `acme-${Math.random().toString(36).slice(2)}`,
      industry: "Retail",
      practiceArea: "software",
      summary: "A summary.",
      content: JSON.stringify([{ id: "b1", type: "paragraph", data: { text: "Body text." } }]),
    }),
  );
  if (created.status !== "success") {
    throw new Error(`Failed to create test case study: ${JSON.stringify(created)}`);
  }
  return created.id as string;
}

describe("review pipeline — approve/requestChanges/reject", () => {
  const { create, submitForReview, approve, requestChanges, reject } =
    createCrudActions(caseStudyConfig);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("approve moves a document from review to approved", async () => {
    const adminId = await realUserId("admin");
    loginAs({ id: adminId, email: "a@b.com", name: "A", role: "admin", dynamicPermissions: [] });

    const id = await makeCaseStudyInReview(create);
    await submitForReview(id);

    const result = await approve(id);
    expect(result.status).toBe("success");

    const doc = await caseStudyConfig.model.findById(id).lean<{ status: string }>();
    expect(doc?.status).toBe("approved");
  });

  it("approve refuses a document that isn't in review", async () => {
    const adminId = await realUserId("admin");
    loginAs({ id: adminId, email: "a@b.com", name: "A", role: "admin", dynamicPermissions: [] });

    const id = await makeCaseStudyInReview(create);
    const result = await approve(id);
    expect(result.status).toBe("error");
  });

  it("requestChanges sends a document back to changes_requested and records a comment", async () => {
    const adminId = await realUserId("admin");
    loginAs({ id: adminId, email: "a@b.com", name: "A", role: "admin", dynamicPermissions: [] });

    const id = await makeCaseStudyInReview(create);
    await submitForReview(id);

    const result = await requestChanges(id, "Please add more detail to the summary.");
    expect(result.status).toBe("success");

    const doc = await caseStudyConfig.model.findById(id).lean<{ status: string }>();
    expect(doc?.status).toBe("changes_requested");

    const comments = await listComments("caseStudy", id);
    expect(comments).toHaveLength(1);
    expect(comments[0]?.type).toBe("review");
    expect(comments[0]?.body).toBe("Please add more detail to the summary.");
  });

  it("requestChanges requires a non-empty message", async () => {
    const adminId = await realUserId("admin");
    loginAs({ id: adminId, email: "a@b.com", name: "A", role: "admin", dynamicPermissions: [] });

    const id = await makeCaseStudyInReview(create);
    await submitForReview(id);

    const result = await requestChanges(id, "   ");
    expect(result.status).toBe("error");
  });

  it("a document sent back can be resubmitted for review", async () => {
    const adminId = await realUserId("admin");
    loginAs({ id: adminId, email: "a@b.com", name: "A", role: "admin", dynamicPermissions: [] });

    const id = await makeCaseStudyInReview(create);
    await submitForReview(id);
    await requestChanges(id, "Needs work.");

    const resubmitted = await submitForReview(id);
    expect(resubmitted.status).toBe("success");

    const doc = await caseStudyConfig.model.findById(id).lean<{ status: string }>();
    expect(doc?.status).toBe("review");
  });

  it("reject sends a document straight back to draft with a comment", async () => {
    const adminId = await realUserId("admin");
    loginAs({ id: adminId, email: "a@b.com", name: "A", role: "admin", dynamicPermissions: [] });

    const id = await makeCaseStudyInReview(create);
    await submitForReview(id);

    const result = await reject(id, "This needs a full rewrite.");
    expect(result.status).toBe("success");

    const doc = await caseStudyConfig.model.findById(id).lean<{ status: string }>();
    expect(doc?.status).toBe("draft");

    const comments = await listComments("caseStudy", id);
    expect(comments).toHaveLength(1);
  });

  it("a teammate without the approve grant cannot approve, request changes, or reject", async () => {
    const adminId = await realUserId("admin");
    loginAs({ id: adminId, email: "a@b.com", name: "A", role: "admin", dynamicPermissions: [] });
    const id = await makeCaseStudyInReview(create);
    await submitForReview(id);

    loginAs({
      id: fakeObjectId(),
      email: "t@example.com",
      name: "Teammate",
      role: "teammate",
      dynamicPermissions: [],
    });

    await expect(approve(id)).rejects.toThrow(ForbiddenError);
    await expect(requestChanges(id, "x")).rejects.toThrow(ForbiddenError);
    await expect(reject(id, "x")).rejects.toThrow(ForbiddenError);
  });
});
