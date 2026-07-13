import { ObjectId } from 'mongodb';
import type { OptionalUnlessRequiredId } from 'mongodb';
import { documentSchema, type DocumentInput, type DocumentRecord } from '@/lib/documents/schema';
import { collections } from '../collections';

/**
 * Documents are queried by owner far more often than by their own `_id`
 * (§25: index/list pages never load full block bodies; a detail page fetches
 * a specific owner's Documents separately) — so this repository is
 * owner-shaped rather than wrapping the generic `createRepository`.
 */
export const documentRepository = {
  async findByOwner(
    ownerType: DocumentRecord['ownerType'],
    ownerId: string,
  ): Promise<DocumentRecord[]> {
    const collection = await collections.documents();
    return collection.find({ ownerType, ownerId: new ObjectId(ownerId) }).toArray();
  },

  async findByOwnerAndRole(
    ownerType: DocumentRecord['ownerType'],
    ownerId: string,
    role: DocumentRecord['role'],
  ): Promise<DocumentRecord | null> {
    const collection = await collections.documents();
    return collection.findOne({ ownerType, ownerId: new ObjectId(ownerId), role });
  },

  async create(input: DocumentInput): Promise<DocumentRecord> {
    const parsed = documentSchema.parse(input);
    const now = new Date();
    const doc = {
      ownerType: parsed.ownerType,
      ownerId: new ObjectId(parsed.ownerId),
      role: parsed.role,
      blocks: parsed.blocks,
      createdAt: now,
      updatedAt: now,
    };

    const collection = await collections.documents();
    const { insertedId } = await collection.insertOne(
      doc as unknown as OptionalUnlessRequiredId<DocumentRecord>,
    );
    return { ...doc, _id: insertedId };
  },

  async updateBlocks(id: string, blocks: DocumentInput['blocks']): Promise<DocumentRecord | null> {
    const parsedBlocks = documentSchema.shape.blocks.parse(blocks);
    const collection = await collections.documents();
    return collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { blocks: parsedBlocks, updatedAt: new Date() } },
      { returnDocument: 'after' },
    );
  },

  async remove(id: string): Promise<boolean> {
    const collection = await collections.documents();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount === 1;
  },
};
