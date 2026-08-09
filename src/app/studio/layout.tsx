import { RootDocument } from '@/app/root-document';
import { ensureMongoReady } from '@/lib/db/mongodb';

// Studio is authenticated and request-specific already. Keeping this layout
// dynamic guarantees the readiness gate runs for document requests instead
// of being evaluated during static generation.
export const dynamic = 'force-dynamic';

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  // Studio owns an independent root layout so this await happens before the
  // first `<html>` byte exists. Nested loading/error boundaries cannot turn a
  // readiness failure into an already-committed HTTP 200 response.
  await ensureMongoReady();
  return <RootDocument>{children}</RootDocument>;
}
