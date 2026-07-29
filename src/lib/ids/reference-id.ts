import { nextCounterValue } from '@/lib/db/counters';
import { REFERENCE_ID_PAD_LENGTH } from '@/config/reference-ids';
import type { ReferenceId, ReferenceIdPrefix } from '@/types/studio';

/**
 * Assigns the next permanent reference ID for a collection (PLANNING.md
 * §27). Call exactly once, at create time — an ID never changes once
 * assigned and is never reused, so this must never run on update.
 */
export async function generateReferenceId<Prefix extends ReferenceIdPrefix>(
  prefix: Prefix,
): Promise<ReferenceId<Prefix>> {
  const seq = await nextCounterValue(prefix);
  const padded = String(seq).padStart(REFERENCE_ID_PAD_LENGTH, '0');
  return (prefix === 'EP' ? `EP-${padded}` : `HZ-${prefix}-${padded}`) as ReferenceId<Prefix>;
}
