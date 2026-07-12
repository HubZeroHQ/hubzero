"use server";

import { Types } from "mongoose";

import { createComment, listComments, type ClientComment } from "@/lib/cms/comments";
import { can, ForbiddenError } from "@/lib/cms/permissions";
import { connectToDatabase } from "@/lib/db";
import { requireSessionUser } from "@/lib/cms/session";
import { Comment } from "@/models/comment";
import { User } from "@/models/user";
import type { Resource } from "@/types/cms";

type SimpleResult = { status: "success" } | { status: "error"; message: string };

/**
 * Comments (Phase D) are gated on the same `"view"` grant as the document
 * itself — no second permission model, and consistent with this being an
 * internal collaboration feature (anyone who can see the document can weigh
 * in on it), not a publish-affecting action.
 */
export async function getComments(
  resource: Resource,
  documentId: string,
): Promise<ClientComment[]> {
  const user = await requireSessionUser();
  if (!can(user, "view", resource)) throw new ForbiddenError();
  return listComments(resource, documentId);
}

export async function addNoteComment(
  resource: Resource,
  documentId: string,
  body: string,
  parentId?: string,
  mentions?: string[],
): Promise<SimpleResult> {
  const user = await requireSessionUser();
  if (!can(user, "view", resource)) throw new ForbiddenError();

  const trimmed = body.trim();
  if (!trimmed) return { status: "error", message: "Write a comment before posting." };

  await createComment({
    resource,
    documentId,
    authorId: user.id,
    body: trimmed,
    type: "note",
    parentId,
    mentions,
  });
  return { status: "success" };
}

/** Toggles a single comment's resolved flag — any Studio user who can view the underlying document, mirroring `getComments`'s gate rather than restricting this to the comment's own author. */
export async function toggleCommentResolved(commentId: string): Promise<SimpleResult> {
  const user = await requireSessionUser();
  if (!Types.ObjectId.isValid(commentId)) return { status: "error", message: "Not found." };

  await connectToDatabase();
  const comment = await Comment.findById(commentId);
  if (!comment) return { status: "error", message: "Not found." };

  if (!can(user, "view", comment.collection as Resource)) throw new ForbiddenError();

  comment.resolved = !comment.resolved;
  await comment.save();
  return { status: "success" };
}

export interface MentionableUser {
  id: string;
  name: string;
}

/** The comment composer's "@mention" picker source — every account, not just Admin/Head Admin (`getAssignableUsers`'s narrower list in `actions/studio/leads.ts` is a different, publish-adjacent concern). */
export async function getMentionableUsers(): Promise<MentionableUser[]> {
  await requireSessionUser();
  await connectToDatabase();
  const users = await User.find()
    .select("name")
    .sort({ name: 1 })
    .lean<{ _id: Types.ObjectId; name: string }[]>();
  return users.map((entry) => ({ id: entry._id.toString(), name: entry.name }));
}
