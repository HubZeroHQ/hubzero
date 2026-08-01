'use server';

import { auth } from '@/lib/auth';
import { roleHasCapability } from '@/config/permissions';
import type { EditorialEventCursor } from '@/lib/events/repository';
import { parseActivityFilters, type ActivitySearchParams } from '@/lib/studio/activity/filters';
import { loadActivity } from '@/lib/studio/activity/service';
import type { ActivityPage } from '@/lib/studio/activity/types';
import { ACTIVITY_PAGE_SIZE } from '@/lib/studio/activity/page-size';

/**
 * Fetches the next page of activity for the "Load more" control
 * (v3.1 Milestone 9).
 *
 * Takes the **raw query params**, not a parsed filter object. Everything a
 * client sends is untrusted, so the filters are re-parsed and re-validated here
 * by the same function the page uses — the client cannot hand the server a
 * filter shape that skipped validation, and there is only one place filters are
 * interpreted.
 *
 * Capability is re-checked rather than assumed from the fact that the page
 * rendered: a Server Action is its own entry point and is reachable directly.
 */
export async function loadMoreActivityAction(
  params: ActivitySearchParams,
  cursor: EditorialEventCursor,
): Promise<ActivityPage> {
  const session = await auth();
  if (!session || !roleHasCapability(session.user.role, 'editAnyEntry')) {
    return { items: [], nextCursor: null };
  }

  return loadActivity(
    parseActivityFilters(params),
    { role: session.user.role, userId: session.user.id },
    { limit: ACTIVITY_PAGE_SIZE, cursor },
  );
}
