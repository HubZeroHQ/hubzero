import { Types } from "mongoose";

import { connectToDatabase } from "@/lib/db";
import { serializeDocument } from "@/lib/cms/serialize";
import { VersionHistory } from "@/models/version-history";
import type { Resource } from "@/types/cms";

/** Fields the engine itself manages — never part of a restored/diffed "content" payload. See `diff.ts`'s identical list, kept separate since one operates on live writes and the other on read-only comparison. */
const MANAGED_FIELDS = [
  "_id",
  "__v",
  "status",
  "version",
  "publishedAt",
  "createdAt",
  "updatedAt",
  "createdBy",
];

/** Strips the fields `restoreVersion` must never overwrite (identity, audit trail, and the live workflow state it's about to set deliberately) from a snapshot before merging it back onto a document. */
export function omitManagedFields(snapshot: Record<string, unknown>): Record<string, unknown> {
  const content = { ...snapshot };
  for (const field of MANAGED_FIELDS) delete content[field];
  return content;
}

interface EditedByRef {
  id: string;
  name: string;
  email: string;
}

/** The client-safe shape of one `VersionHistory` entry — used by the version list, the diff view, the review queue, and the dashboard's recent-activity feed alike. */
export interface ClientVersionEntry {
  id: string;
  collection: Resource;
  documentId: string;
  /** Pulled from the snapshot itself (every snapshot already carries the `workflowFields()` mixin's `version`/`status`) rather than stored a second time on `VersionHistory` — one source of truth per `ARCHITECTURE/19_CMS_FOUNDATION.md`'s own recurring principle. */
  version: number | null;
  status: string | null;
  editedBy: EditedByRef | null;
  editedAt: string;
  snapshot: Record<string, unknown>;
}

interface LeanVersionHistoryEntry {
  _id: Types.ObjectId;
  collection: string;
  documentId: Types.ObjectId;
  snapshot: unknown;
  editedBy: Types.ObjectId | { _id: Types.ObjectId; name: string; email: string } | null;
  editedAt: Date;
}

function toClientVersionEntry(entry: LeanVersionHistoryEntry): ClientVersionEntry {
  const snapshot = serializeDocument(entry.snapshot) as Record<string, unknown>;
  const editedBy =
    entry.editedBy && typeof entry.editedBy === "object" && "name" in entry.editedBy
      ? {
          id: entry.editedBy._id.toString(),
          name: entry.editedBy.name,
          email: entry.editedBy.email,
        }
      : null;

  return {
    id: entry._id.toString(),
    collection: entry.collection as Resource,
    documentId: entry.documentId.toString(),
    version: typeof snapshot.version === "number" ? snapshot.version : null,
    status: typeof snapshot.status === "string" ? snapshot.status : null,
    editedBy,
    editedAt: new Date(entry.editedAt).toISOString(),
    snapshot,
  };
}

/**
 * Records one version entry — called from `publish()` (`crud-actions.ts`)
 * with the document's state *immediately before* the publish mutation
 * applies (`ARCHITECTURE/19_CMS_FOUNDATION.md` §9). Deliberately not wrapped
 * in a transaction with the subsequent `doc.save()`: this codebase uses no
 * Mongoose sessions anywhere (`lib/db.ts` provides none), and MongoDB
 * transactions require a replica set, which isn't a given deployment
 * assumption here. Ordering the write first means the one failure mode this
 * leaves open is a stray, harmless `VersionHistory` entry if the following
 * `save()` then fails — never the reverse (a live mutation with no recorded
 * "before" state), which is the failure mode that would actually lose data.
 */
export async function snapshotVersion(
  collection: Resource,
  snapshot: Record<string, unknown>,
  editedBy: string,
): Promise<void> {
  await connectToDatabase();
  await VersionHistory.create({
    collection,
    documentId: snapshot._id as Types.ObjectId,
    snapshot,
    editedBy: new Types.ObjectId(editedBy),
    editedAt: new Date(),
  });
}

/** Every past version of one document, newest first — the version-history page's main list. */
export async function listVersions(
  collection: Resource,
  documentId: string,
): Promise<ClientVersionEntry[]> {
  await connectToDatabase();
  if (!Types.ObjectId.isValid(documentId)) return [];

  const entries = await VersionHistory.find({ collection, documentId })
    .sort({ editedAt: -1 })
    .populate<{ editedBy: { _id: Types.ObjectId; name: string; email: string } | null }>(
      "editedBy",
      "name email",
    )
    .lean<LeanVersionHistoryEntry[]>();

  return entries.map(toClientVersionEntry);
}

/** One specific version entry, scoped to the collection + document it claims to belong to — `restoreVersion` uses this scoping to reject a version ID that doesn't actually belong to the document being restored. */
export async function getVersionEntry(
  collection: Resource,
  documentId: string,
  versionHistoryId: string,
): Promise<ClientVersionEntry | null> {
  if (!Types.ObjectId.isValid(versionHistoryId) || !Types.ObjectId.isValid(documentId)) return null;

  await connectToDatabase();
  const entry = await VersionHistory.findOne({ _id: versionHistoryId, collection, documentId })
    .populate<{ editedBy: { _id: Types.ObjectId; name: string; email: string } | null }>(
      "editedBy",
      "name email",
    )
    .lean<LeanVersionHistoryEntry>();

  return entry ? toClientVersionEntry(entry) : null;
}

/**
 * The last N edits across *every* collection, oldest-filter-free — the
 * dashboard's "recent activity" card (`ARCHITECTURE/19_CMS_FOUNDATION.md`
 * §10 item 3: "who published what, when," real editorial history, never a
 * fabricated metric). Fully generic: adding a twelfth collection to the
 * registry means its publishes show up here automatically, no code change.
 */
export async function listRecentActivity(limit = 10): Promise<ClientVersionEntry[]> {
  await connectToDatabase();
  const entries = await VersionHistory.find({})
    .sort({ editedAt: -1 })
    .limit(limit)
    .populate<{ editedBy: { _id: Types.ObjectId; name: string; email: string } | null }>(
      "editedBy",
      "name email",
    )
    .lean<LeanVersionHistoryEntry[]>();

  return entries.map(toClientVersionEntry);
}
