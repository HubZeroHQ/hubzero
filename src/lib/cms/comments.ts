import { Types } from "mongoose";

import { connectToDatabase } from "@/lib/db";
import { Comment } from "@/models/comment";
import type { Resource } from "@/types/cms";

export interface ClientComment {
  id: string;
  authorId: string;
  authorName: string;
  body: string;
  type: "review" | "note";
  parentId?: string;
  resolved: boolean;
  mentions: string[];
  createdAt: string;
}

export interface CreateCommentInput {
  resource: Resource;
  documentId: string;
  authorId: string;
  body: string;
  type: "review" | "note";
  parentId?: string;
  mentions?: string[];
}

/**
 * The one write path for both Phase C's review comments (`requestChanges`/
 * `reject` in `crud-actions.ts`) and Phase D's threaded internal comments —
 * `type` is the only thing that varies per caller.
 */
export async function createComment(input: CreateCommentInput): Promise<void> {
  await connectToDatabase();
  await Comment.create({
    collection: input.resource,
    documentId: new Types.ObjectId(input.documentId),
    author: new Types.ObjectId(input.authorId),
    body: input.body,
    type: input.type,
    parentId: input.parentId ? new Types.ObjectId(input.parentId) : undefined,
    mentions: (input.mentions ?? []).map((id) => new Types.ObjectId(id)),
  });
}

/**
 * Every comment on one document, oldest first, author names resolved —
 * shared by Phase C's review-history display and Phase D's full thread
 * (which additionally groups by `parentId`/filters `resolved` client-side;
 * this stays a flat, generic read).
 */
export async function listComments(
  resource: Resource,
  documentId: string,
): Promise<ClientComment[]> {
  await connectToDatabase();
  const docs = await Comment.find({ collection: resource, documentId })
    .sort({ createdAt: 1 })
    .populate<{ author: { _id: Types.ObjectId; name: string } }>("author", "name")
    .lean();

  return docs.map((doc) => ({
    id: String(doc._id),
    authorId: String(doc.author._id),
    authorName: doc.author.name,
    body: doc.body,
    type: doc.type as "review" | "note",
    parentId: doc.parentId ? String(doc.parentId) : undefined,
    resolved: doc.resolved,
    mentions: (doc.mentions ?? []).map(String),
    createdAt: new Date(doc.createdAt).toISOString(),
  }));
}
