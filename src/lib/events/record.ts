import 'server-only';

import { auth } from '@/lib/auth';
import { editorialEventRepository, ensureEditorialEventIndexes } from './repository';
import type { EditorialEventPayload, EventEntityType } from './schema';

/**
 * The one way an editorial event is written (v3.1 Milestone 8).
 *
 * Called from the **shared write paths** — `createEntryCreateAction`,
 * `createEntryUpdateAction`, `createEntryTransitionAction`,
 * `setFeaturedOrderAction`, `createDocumentSaveAction` — never from a call
 * site. That placement is the whole design: a collection joins the audit trail
 * by using the factories it already uses, so a new collection cannot forget to
 * log, and no parallel mutation path exists to drift from.
 *
 * The actor is read from the session here rather than threaded through every
 * factory signature. Every one of these paths already runs inside an
 * authenticated Server Action, so the session is available, and passing a user
 * id through five factories would be five chances to pass the wrong one.
 *
 * Never throws. A failed audit write must not fail the editorial action that
 * produced it — by the time this runs the entry has already been saved, and
 * turning a logging failure into a save failure would trade a missing row for
 * lost work.
 */
export async function recordEditorialEvent(input: {
  entityType: EventEntityType;
  entityId: string;
  payload: EditorialEventPayload;
}): Promise<void> {
  try {
    void ensureEditorialEventIndexes();

    const session = await auth();
    await editorialEventRepository.append({
      entityType: input.entityType,
      entityId: input.entityId,
      ...(session?.user.id ? { actorUserId: session.user.id } : {}),
      payload: input.payload,
    });
  } catch {
    // Deliberately swallowed — see the note above.
  }
}

export { eventEntityTypeFor } from './schema';
