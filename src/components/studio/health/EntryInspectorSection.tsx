import { loadEntryInspection } from '@/lib/studio/health/inspector';
import { EntryInspector } from './EntryInspector';

/**
 * Server boundary for the entry inspector (v3.1 Milestone 11): one load, then
 * pure rendering. Split from `EntryInspector` so the rendering half stays a
 * plain function of an `EntryInspection` and can be exercised without a
 * database.
 *
 * Every editor renders this same component with its collection key — there is
 * no per-collection inspector, because "what is wrong with this entry" is the
 * same question everywhere and is answered by the same engine.
 *
 * Renders nothing when the entry is not in the health snapshot. That is the
 * honest failure: an empty panel would imply a clean bill of health for an
 * entry the engine never actually examined.
 */
export async function EntryInspectorSection({
  collectionKey,
  entryId,
  editHref,
}: {
  collectionKey: string;
  entryId: string;
  /** Where "fix this" sends the editor for document and metadata gaps — the editor they are already in. */
  editHref: string;
}) {
  const inspection = await loadEntryInspection({ collectionKey, entryId, editHref });
  if (!inspection) return null;
  return <EntryInspector inspection={inspection} />;
}
