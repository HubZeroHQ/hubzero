import 'server-only';

import { auth } from '@/lib/auth';
import { editorialEventRepository, ensureEditorialEventIndexes } from './repository';
import type { EditorialEventPayload, EventEntityType } from './schema';

/**
 * The one boundary through which editorial events are written.
 *
 * Mutations call this only after their primary write succeeds. Audit failures
 * are reported to server telemetry but never turn a successful editorial save
 * into lost work.
 */
export async function recordEditorialEvent(input: {
  entityType: EventEntityType;
  entityId: string;
  payload: EditorialEventPayload;
}): Promise<void> {
  try {
    await ensureEditorialEventIndexes();

    const session = await auth();
    await editorialEventRepository.append({
      entityType: input.entityType,
      entityId: input.entityId,
      ...(session?.user.id ? { actorUserId: session.user.id } : {}),
      payload: input.payload,
    });
  } catch (error) {
    // Do not include the full payload: rejection notes can contain private
    // editorial context.
    console.error('Editorial event write failed', {
      entityType: input.entityType,
      entityId: input.entityId,
      eventType: input.payload.type,
      error,
    });
  }
}

export { eventEntityTypeFor } from './schema';
