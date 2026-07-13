import { ObjectId } from 'mongodb';
import type { Collection, Filter, OptionalUnlessRequiredId, UpdateFilter } from 'mongodb';
import { generateReferenceId } from '@/lib/ids/reference-id';
import type { ReferenceIdPrefix, WithId, WithTimestamps } from '@/types/cms';

export interface RepositoryOptions {
  /** When set, `create()` assigns a permanent reference ID (§27) exactly once. */
  referenceIdPrefix?: ReferenceIdPrefix;
}

/**
 * Shared CRUD shape for every CMS collection (PLANNING.md §26) — one
 * implementation of "validate, timestamp, optionally assign a reference ID"
 * instead of hand-rolling the same operations across eleven collections.
 * Collection-specific modules under `lib/db/repositories/` wrap this with
 * their Zod schema (`lib/validation/*`) for parsing and any bespoke queries
 * (e.g. `findBySlug`). Callers are expected to pass already-validated input;
 * this layer owns persistence, not validation.
 */
export function createRepository<TRecord extends WithId & WithTimestamps, TInput extends object>(
  getCollection: () => Promise<Collection<TRecord>>,
  options: RepositoryOptions = {},
) {
  return {
    async findById(id: string): Promise<TRecord | null> {
      const collection = await getCollection();
      const result = await collection.findOne({ _id: new ObjectId(id) } as Filter<TRecord>);
      return result as TRecord | null;
    },

    async list(filter: Filter<TRecord> = {}): Promise<TRecord[]> {
      const collection = await getCollection();
      const results = await collection.find(filter).toArray();
      return results as TRecord[];
    },

    async create(input: TInput, meta: { createdByUserId?: string } = {}): Promise<TRecord> {
      const now = new Date();
      const referenceId = options.referenceIdPrefix
        ? await generateReferenceId(options.referenceIdPrefix)
        : undefined;

      // The runtime contract: every field TRecord requires beyond TInput
      // (referenceId, createdByUserId, _id, timestamps) is supplied here.
      // `referenceIdPrefix` must be set for any TRecord whose type requires
      // a `referenceId`; callers for any TRecord requiring `createdByUserId`
      // (PublishableEntity, §24) must pass `meta.createdByUserId` — it's
      // permanent provenance (§29), assigned exactly once and never part of
      // TInput, so `update()` can never touch it.
      const doc = {
        ...input,
        ...(referenceId ? { referenceId } : {}),
        ...(meta.createdByUserId ? { createdByUserId: new ObjectId(meta.createdByUserId) } : {}),
        createdAt: now,
        updatedAt: now,
      } as unknown as TRecord;

      const collection = await getCollection();
      const { insertedId } = await collection.insertOne(
        doc as unknown as OptionalUnlessRequiredId<TRecord>,
      );
      return { ...doc, _id: insertedId };
    },

    async update(id: string, patch: Partial<TInput>): Promise<TRecord | null> {
      const collection = await getCollection();
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) } as Filter<TRecord>,
        { $set: { ...patch, updatedAt: new Date() } } as UpdateFilter<TRecord>,
        { returnDocument: 'after' },
      );
      return result as TRecord | null;
    },

    async remove(id: string): Promise<boolean> {
      const collection = await getCollection();
      const result = await collection.deleteOne({ _id: new ObjectId(id) } as Filter<TRecord>);
      return result.deletedCount === 1;
    },
  };
}
