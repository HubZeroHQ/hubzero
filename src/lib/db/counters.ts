import { getDb } from './mongodb';

interface CounterDocument {
  _id: string;
  seq: number;
}

/**
 * Atomic per-prefix counter (PLANNING.md §27) backed by a dedicated
 * `counters` collection — `findOneAndUpdate`'s `$inc` is atomic at the
 * database level, so simultaneous creations can never collide without any
 * application-level locking.
 */
export async function nextCounterValue(prefix: string): Promise<number> {
  const db = await getDb();
  const counters = db.collection<CounterDocument>('counters');

  const result = await counters.findOneAndUpdate(
    { _id: prefix },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after' },
  );

  if (!result) {
    throw new Error(`Failed to increment counter for prefix "${prefix}"`);
  }

  return result.seq;
}

/**
 * Sets a prefix's counter to an exact value — used exactly once, by
 * `scripts/renumber-founder-engineering-profiles.ts`, to reset the `EP`
 * counter after that script's one-time renumbering. Every normal code path
 * must keep using `nextCounterValue`'s atomic `$inc`; this bypasses that on
 * purpose and must never be called from application request handling.
 */
export async function setCounterValue(prefix: string, value: number): Promise<void> {
  const db = await getDb();
  const counters = db.collection<CounterDocument>('counters');
  await counters.updateOne({ _id: prefix }, { $set: { seq: value } }, { upsert: true });
}
