import type { ObjectId } from 'mongodb';

/**
 * A Mongo id-shaped value as it actually appears at runtime once it's
 * round-tripped through a repository: a real `ObjectId` (native driver
 * reads) or a plain hex string (`lib/validation/shared.ts`'s
 * `objectIdString` schema validates relation fields as strings and nothing
 * in `lib/db/repository.ts`'s generic `create()`/`update()` converts them
 * to a real `ObjectId` before persisting — see that file's own comment on
 * why `create()` force-casts through `TRecord`). Code that compares or
 * de-duplicates ids must accept both shapes rather than assuming one.
 */
export type IdLike = ObjectId | string;

/** Normalizes any `IdLike` to its plain hex-string form for comparison — the one place that conversion happens, instead of every caller guessing whether a value has `.toString()`/`.equals()`. */
export function toIdString(id: IdLike): string {
  return typeof id === 'string' ? id : id.toString();
}

/** Compares two `IdLike` values by their string form — safe whether either side is a real `ObjectId` or the string form the repository layer actually stores, unlike `ObjectId.prototype.equals`, which throws if called on a plain string. */
export function idsEqual(a: IdLike, b: IdLike): boolean {
  return toIdString(a) === toIdString(b);
}
