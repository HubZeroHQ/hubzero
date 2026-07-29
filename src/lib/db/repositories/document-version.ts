import { ObjectId } from 'mongodb';
import type { OptionalUnlessRequiredId } from 'mongodb';
import type { DocumentVersionRecord } from '@/lib/documents/version';
import type { DocumentRecord } from '@/lib/documents/schema';
import { collections } from '../collections';

export const documentVersionRepository = {
  async listForDocument(documentId: string): Promise<DocumentVersionRecord[]> {
    const collection = await collections.documentVersions();
    return collection
      .find({ documentId: new ObjectId(documentId) })
      .sort({ createdAt: -1 })
      .toArray();
  },

  async findLatestForDocument(documentId: string): Promise<DocumentVersionRecord | null> {
    const collection = await collections.documentVersions();
    return collection.findOne(
      { documentId: new ObjectId(documentId) },
      { sort: { createdAt: -1 } },
    );
  },

  /** Snapshots `document`'s current (pre-update) state — called from `documentRepository.updateBlocks` before the overwrite lands. */
  async createSnapshot(
    document: Pick<DocumentRecord, '_id' | 'ownerType' | 'ownerId' | 'role' | 'blocks'>,
    actorUserId?: string,
  ): Promise<DocumentVersionRecord> {
    const doc = {
      documentId: document._id,
      ownerType: document.ownerType,
      ownerId: document.ownerId,
      role: document.role,
      blocks: document.blocks,
      createdAt: new Date(),
      ...(actorUserId ? { createdByUserId: new ObjectId(actorUserId) } : {}),
    };

    const collection = await collections.documentVersions();
    const { insertedId } = await collection.insertOne(
      doc as unknown as OptionalUnlessRequiredId<DocumentVersionRecord>,
    );
    return { ...doc, _id: insertedId };
  },
};
