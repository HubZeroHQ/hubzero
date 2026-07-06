import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/cms/session", () => ({
  getSessionUser: vi.fn(),
  requireSessionUser: vi.fn(),
  requireRole: vi.fn(),
}));

import { getSessionUser, requireSessionUser } from "@/lib/cms/session";
import { createComment, listComments } from "@/lib/cms/comments";
import {
  addNoteComment,
  getMentionableUsers,
  toggleCommentResolved,
} from "@/actions/studio/comments";
import { ForbiddenError } from "@/lib/cms/permissions";
import { User } from "@/models/user";
import type { SessionUser } from "@/types/cms";
import { fakeObjectId } from "./helpers";

function loginAs(user: SessionUser | null) {
  vi.mocked(getSessionUser).mockResolvedValue(user);
  vi.mocked(requireSessionUser).mockImplementation(async () => {
    if (!user) throw new Error("Not signed in.");
    return user;
  });
}

async function realUserId(role: SessionUser["role"] = "teammate"): Promise<string> {
  const created = await User.create({
    email: `${Math.random().toString(36).slice(2)}@example.com`,
    name: "Test User",
    passwordHash: "unused-in-tests",
    role,
    sessionVersion: 0,
  });
  return created._id.toString();
}

describe("lib/cms/comments — createComment/listComments", () => {
  it("creates and lists a comment, oldest first, with the author's name resolved", async () => {
    const authorId = await realUserId("admin");
    const documentId = fakeObjectId();

    await createComment({
      resource: "note",
      documentId,
      authorId,
      body: "First.",
      type: "note",
    });
    await createComment({
      resource: "note",
      documentId,
      authorId,
      body: "Second.",
      type: "note",
    });

    const comments = await listComments("note", documentId);
    expect(comments).toHaveLength(2);
    expect(comments[0]?.body).toBe("First.");
    expect(comments[1]?.body).toBe("Second.");
    expect(comments[0]?.authorName).toBe("Test User");
    expect(comments[0]?.resolved).toBe(false);
  });

  it("only returns comments for the exact {collection, documentId} pair", async () => {
    const authorId = await realUserId();
    const documentId = fakeObjectId();
    const otherDocumentId = fakeObjectId();

    await createComment({ resource: "note", documentId, authorId, body: "Mine.", type: "note" });
    await createComment({
      resource: "note",
      documentId: otherDocumentId,
      authorId,
      body: "Not mine.",
      type: "note",
    });
    await createComment({
      resource: "caseStudy",
      documentId,
      authorId,
      body: "Wrong collection.",
      type: "note",
    });

    const comments = await listComments("note", documentId);
    expect(comments).toHaveLength(1);
    expect(comments[0]?.body).toBe("Mine.");
  });
});

describe("actions/studio/comments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("addNoteComment rejects an empty body without creating anything", async () => {
    const userId = await realUserId();
    loginAs({ id: userId, email: "a@b.com", name: "A", role: "teammate", dynamicPermissions: [] });

    const result = await addNoteComment("note", fakeObjectId(), "   ");
    expect(result.status).toBe("error");
  });

  it("addNoteComment creates a top-level or threaded reply comment", async () => {
    const userId = await realUserId();
    loginAs({ id: userId, email: "a@b.com", name: "A", role: "teammate", dynamicPermissions: [] });
    const documentId = fakeObjectId();

    const top = await addNoteComment("note", documentId, "Top-level comment.");
    expect(top.status).toBe("success");

    const comments = await listComments("note", documentId);
    expect(comments).toHaveLength(1);

    const reply = await addNoteComment("note", documentId, "A reply.", comments[0]?.id);
    expect(reply.status).toBe("success");

    const afterReply = await listComments("note", documentId);
    expect(afterReply).toHaveLength(2);
    expect(afterReply[1]?.parentId).toBe(comments[0]?.id);
  });

  it("toggleCommentResolved flips resolved back and forth", async () => {
    const userId = await realUserId();
    loginAs({ id: userId, email: "a@b.com", name: "A", role: "teammate", dynamicPermissions: [] });
    const documentId = fakeObjectId();

    await addNoteComment("note", documentId, "Needs a look.");
    const [comment] = await listComments("note", documentId);
    expect(comment?.resolved).toBe(false);

    await toggleCommentResolved(comment!.id);
    expect((await listComments("note", documentId))[0]?.resolved).toBe(true);

    await toggleCommentResolved(comment!.id);
    expect((await listComments("note", documentId))[0]?.resolved).toBe(false);
  });

  it("a signed-out caller cannot comment", async () => {
    loginAs(null);
    await expect(addNoteComment("note", fakeObjectId(), "Hi")).rejects.toThrow();
  });

  it("a teammate with no view grant on the resource cannot comment on it", async () => {
    const userId = await realUserId("teammate");
    loginAs({ id: userId, email: "a@b.com", name: "A", role: "teammate", dynamicPermissions: [] });

    // Teammates hold no grant at all on caseStudy (`permissions.ts`).
    await expect(addNoteComment("caseStudy", fakeObjectId(), "Hi")).rejects.toThrow(ForbiddenError);
  });

  it("getMentionableUsers returns every account, sorted by name", async () => {
    await User.deleteMany({});
    await User.create([
      {
        email: "b@example.com",
        name: "Bob",
        passwordHash: "x",
        role: "teammate",
        sessionVersion: 0,
      },
      {
        email: "a@example.com",
        name: "Alice",
        passwordHash: "x",
        role: "admin",
        sessionVersion: 0,
      },
    ]);
    loginAs({
      id: fakeObjectId(),
      email: "x@example.com",
      name: "X",
      role: "teammate",
      dynamicPermissions: [],
    });

    const mentionable = await getMentionableUsers();
    expect(mentionable.map((u) => u.name)).toEqual(["Alice", "Bob"]);
  });
});
