import { ObjectId } from 'mongodb';
import type { Collection } from 'mongodb';
import { describe, expect, it, vi } from 'vitest';
import { createFeaturedOrdering } from './featured-ordering';

interface Row {
  _id: ObjectId;
  featuredOrder: number | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * A minimal in-memory stand-in for the two Mongo operations this module uses.
 * Enough to assert *what gets written* — which is the whole contract — without
 * a live database.
 */
function fakeCollection(rows: Row[]) {
  const state = rows.map((row) => ({ ...row }));

  const collection = {
    find: vi.fn(() => ({
      toArray: async () => state.filter((row) => row.featuredOrder !== null).map((r) => ({ ...r })),
    })),
    updateMany: vi.fn(async (filter: { _id: { $nin: ObjectId[] } }, update: { $set: Row }) => {
      const keep = filter._id.$nin.map((id) => id.toString());
      for (const row of state) {
        if (row.featuredOrder !== null && !keep.includes(row._id.toString())) {
          row.featuredOrder = update.$set.featuredOrder;
        }
      }
    }),
    bulkWrite: vi.fn(
      async (ops: Array<{ updateOne: { filter: { _id: ObjectId }; update: { $set: Row } } }>) => {
        let matchedCount = 0;
        for (const op of ops) {
          const row = state.find((r) => r._id.toString() === op.updateOne.filter._id.toString());
          if (row) {
            row.featuredOrder = op.updateOne.update.$set.featuredOrder;
            matchedCount += 1;
          }
        }
        return { matchedCount };
      },
    ),
  };

  return {
    collection: collection as unknown as Collection<Row>,
    state,
    positions: () =>
      Object.fromEntries(state.map((row) => [row._id.toString(), row.featuredOrder])),
  };
}

const id = () => new ObjectId();

function makeRows(count: number, orders: Array<number | null>): Row[] {
  const now = new Date();
  return Array.from({ length: count }, (_, index) => ({
    _id: id(),
    featuredOrder: orders[index] ?? null,
    createdAt: now,
    updatedAt: now,
  }));
}

describe('createFeaturedOrdering.setFeaturedOrder', () => {
  it('writes canonical 1..N positions for the supplied order', async () => {
    const rows = makeRows(3, [null, null, null]);
    const fake = fakeCollection(rows);
    const ordering = createFeaturedOrdering<Row>(async () => fake.collection);

    const written = await ordering.setFeaturedOrder([
      rows[2]!._id.toString(),
      rows[0]!._id.toString(),
    ]);

    expect(written).toBe(2);
    expect(fake.positions()[rows[2]!._id.toString()]).toBe(1);
    expect(fake.positions()[rows[0]!._id.toString()]).toBe(2);
    expect(fake.positions()[rows[1]!._id.toString()]).toBeNull();
  });

  it('clears entries dropped from the featured set, leaving no stale position', async () => {
    const rows = makeRows(3, [1, 2, 3]);
    const fake = fakeCollection(rows);
    const ordering = createFeaturedOrdering<Row>(async () => fake.collection);

    await ordering.setFeaturedOrder([rows[0]!._id.toString(), rows[2]!._id.toString()]);

    expect(fake.positions()[rows[0]!._id.toString()]).toBe(1);
    expect(fake.positions()[rows[1]!._id.toString()]).toBeNull();
    // Closed ranks: the survivor moved up rather than keeping position 3.
    expect(fake.positions()[rows[2]!._id.toString()]).toBe(2);
  });

  it('renumbers densely after a move, never leaving a hole', async () => {
    const rows = makeRows(4, [1, 2, 3, 4]);
    const fake = fakeCollection(rows);
    const ordering = createFeaturedOrdering<Row>(async () => fake.collection);

    // "4 becomes 2"
    await ordering.setFeaturedOrder([
      rows[0]!._id.toString(),
      rows[3]!._id.toString(),
      rows[1]!._id.toString(),
      rows[2]!._id.toString(),
    ]);

    const positions = Object.values(fake.positions())
      .filter((value) => value !== null)
      .sort();
    expect(positions).toEqual([1, 2, 3, 4]);
    expect(fake.positions()[rows[3]!._id.toString()]).toBe(2);
  });

  it('unfeatures everything when given an empty list, and skips the bulk write', async () => {
    const rows = makeRows(2, [1, 2]);
    const fake = fakeCollection(rows);
    const ordering = createFeaturedOrdering<Row>(async () => fake.collection);

    const written = await ordering.setFeaturedOrder([]);

    expect(written).toBe(0);
    expect(Object.values(fake.positions())).toEqual([null, null]);
    expect(fake.collection.bulkWrite).not.toHaveBeenCalled();
  });

  it('ignores ids that are not valid ObjectIds instead of writing a broken position', async () => {
    const rows = makeRows(1, [null]);
    const fake = fakeCollection(rows);
    const ordering = createFeaturedOrdering<Row>(async () => fake.collection);

    const written = await ordering.setFeaturedOrder(['not-an-object-id', rows[0]!._id.toString()]);

    // The surviving entry still lands on a canonical position — the discarded
    // id does not leave a gap at 1.
    expect(written).toBe(1);
    expect(fake.positions()[rows[0]!._id.toString()]).toBe(2);
  });

  it('is idempotent — saving the same order twice changes nothing', async () => {
    const rows = makeRows(3, [null, null, null]);
    const fake = fakeCollection(rows);
    const ordering = createFeaturedOrdering<Row>(async () => fake.collection);
    const order = [rows[1]!._id.toString(), rows[0]!._id.toString()];

    await ordering.setFeaturedOrder(order);
    const first = fake.positions();
    await ordering.setFeaturedOrder(order);

    expect(fake.positions()).toEqual(first);
  });
});

describe('createFeaturedOrdering.listFeatured', () => {
  it('returns featured rows in editorial order', async () => {
    const rows = makeRows(3, [2, null, 1]);
    const fake = fakeCollection(rows);
    const ordering = createFeaturedOrdering<Row>(async () => fake.collection);

    const featured = await ordering.listFeatured();

    expect(featured.map((row) => row._id.toString())).toEqual([
      rows[2]!._id.toString(),
      rows[0]!._id.toString(),
    ]);
  });
});
