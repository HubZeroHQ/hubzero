import { getDb } from './mongodb';

/**
 * Creates every index PLANNING.md §34 specifies. `createIndex` is idempotent,
 * so this is safe to invoke on every deploy rather than needing a separate
 * migration runner this early in the project. Not called automatically on
 * import or app startup — invoke explicitly from a deploy/bootstrap step.
 */
export async function ensureIndexes(): Promise<void> {
  const db = await getDb();

  const slugCollections = [
    'work',
    'builds',
    'blueprints',
    'labs',
    'notes',
    'engineeringProfiles',
  ] as const;
  const referenceIdCollections = [
    'work',
    'builds',
    'blueprints',
    'labs',
    'notes',
    'team',
    'engineeringProfiles',
  ] as const;
  const statusCollections = [
    'work',
    'builds',
    'blueprints',
    'labs',
    'notes',
    'engineeringProfiles',
    'services',
  ] as const;

  await Promise.all([
    ...slugCollections.map((name) =>
      db.collection(name).createIndex({ slug: 1 }, { unique: true }),
    ),
    ...referenceIdCollections.map((name) =>
      db.collection(name).createIndex({ referenceId: 1 }, { unique: true }),
    ),
    ...statusCollections.map((name) => db.collection(name).createIndex({ status: 1 })),
    db.collection('documents').createIndex({ ownerType: 1, ownerId: 1 }),
    db.collection('taxonomy').createIndex({ kind: 1 }),
    db.collection('taxonomy').createIndex({ slug: 1 }, { unique: true }),
    db.collection('users').createIndex({ email: 1 }, { unique: true }),
    db.collection('media').createIndex({ cloudinaryPublicId: 1 }, { unique: true }),
    db.collection('media').createIndex({ folder: 1 }),
    db.collection('media').createIndex({ reuseTags: 1 }),
    db.collection('engineeringProfiles').createIndex({ teamMemberId: 1 }, { unique: true }),
  ]);
}
