import type { ObjectId } from 'mongodb';
import type { Block } from './blocks';
import type { DocumentRole, OwnerType } from './schema';

/**
 * Version foundation (PLANNING.md §36 — "version history... become additions
 * to the Document Engine's storage/rendering layer, inherited by every
 * current and future owner simultaneously"). This phase stores snapshots so
 * that layer has real data to build on; it deliberately ships no browsing
 * UI, no diffing, and no restore action yet — those are the version
 * *history* feature, out of scope here.
 *
 * A snapshot captures the document's state *before* an update overwrites
 * it, taken from `documentRepository.updateBlocks`. Snapshots are
 * throttled (`VERSION_SNAPSHOT_MIN_INTERVAL_MS` in the repository) rather
 * than written on every autosave tick — otherwise a single active editing
 * session would write hundreds of near-duplicate rows for a feature that
 * doesn't have a retention/compaction policy yet.
 */
export interface DocumentVersionRecord {
  _id: ObjectId;
  documentId: ObjectId;
  ownerType: OwnerType;
  ownerId: ObjectId;
  role: DocumentRole;
  blocks: Block[];
  createdAt: Date;
  createdByUserId?: ObjectId;
}
