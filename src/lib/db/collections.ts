import type { Collection } from 'mongodb';
import { getDb } from './mongodb';
import type { DocumentRecord } from '@/lib/documents/schema';
import type { DocumentVersionRecord } from '@/lib/documents/version';
import type {
  Blueprint,
  Build,
  Lab,
  Lead,
  MediaAsset,
  Note,
  Service,
  TaxonomyEntry,
  Team,
  User,
  Work,
} from '@/types/studio';

/**
 * Typed accessors for every collection in PLANNING.md §26 — the single
 * place collection names are spelled out, so a rename never means chasing
 * down every `db.collection('...')` call.
 */
async function collection<T extends object>(name: string): Promise<Collection<T>> {
  const db = await getDb();
  return db.collection<T>(name);
}

export const collections = {
  work: () => collection<Work>('work'),
  builds: () => collection<Build>('builds'),
  blueprints: () => collection<Blueprint>('blueprints'),
  labs: () => collection<Lab>('labs'),
  notes: () => collection<Note>('notes'),
  team: () => collection<Team>('team'),
  services: () => collection<Service>('services'),
  leads: () => collection<Lead>('leads'),
  users: () => collection<User>('users'),
  media: () => collection<MediaAsset>('media'),
  taxonomy: () => collection<TaxonomyEntry>('taxonomy'),
  documents: () => collection<DocumentRecord>('documents'),
  documentVersions: () => collection<DocumentVersionRecord>('documentVersions'),
};
