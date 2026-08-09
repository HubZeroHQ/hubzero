import type { Metadata } from 'next';
import { PageHeader } from '@/components/studio/PageHeader';
import { ActivityFeed } from '@/components/studio/activity/ActivityFeed';
import { ActivityFilterBar } from '@/components/studio/activity/ActivityFilterBar';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { ErrorState } from '@/components/ui/ErrorState';
import { roleHasCapability } from '@/config/permissions';
import { auth } from '@/lib/auth';
import { editorialEventRepository } from '@/lib/events/repository';
import { resolveActors } from '@/lib/studio/actors';
import { parseActivityFilters, type ActivitySearchParams } from '@/lib/studio/activity/filters';
import { ACTIVITY_PAGE_SIZE } from '@/lib/studio/activity/page-size';
import { loadActivity } from '@/lib/studio/activity/service';
import { measureServerOperation } from '@/lib/performance/server';

export const metadata: Metadata = { title: 'Activity — HubZero Studio' };

/**
 * "What's changed?" — the Studio-wide editorial activity feed
 * (v3.1 Milestone 9).
 *
 * Reads the editorial event log and nothing else. It is not analytics and not
 * an audit viewer: it answers one question, chronologically, with a link
 * straight to the thing that changed.
 *
 * Gated on `editAnyEntry`, the same capability as the health screens. The feed
 * spans every collection and every author by design, so a role that can only
 * see its own entries would be shown a stream of rows it cannot open — and
 * would read "this entry no longer exists" for entries that exist perfectly
 * well but belong to someone else.
 */
export default async function StudioActivityPage({
  searchParams,
}: {
  searchParams: Promise<ActivitySearchParams>;
}) {
  return measureServerOperation('/studio/activity', 'page', () =>
    renderStudioActivityPage(searchParams),
  );
}

async function renderStudioActivityPage(searchParams: Promise<ActivitySearchParams>) {
  const session = await auth();
  if (!session || !roleHasCapability(session.user.role, 'editAnyEntry')) {
    return (
      <ErrorState
        title="You can't view Studio activity."
        description="The feed spans every collection and every author, which is more than your role can read."
        action={
          <ButtonLink href="/studio/dashboard" variant="secondary">
            Back to dashboard
          </ButtonLink>
        }
      />
    );
  }

  const params = await searchParams;
  const filters = parseActivityFilters(params);
  const ctx = { role: session.user.role, userId: session.user.id };

  const [page, actorIds] = await Promise.all([
    loadActivity(filters, ctx, { limit: ACTIVITY_PAGE_SIZE }),
    editorialEventRepository.distinctActorIds().catch(() => [] as string[]),
  ]);

  const actors = [...(await resolveActors(actorIds)).values()].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Activity"
        description="Everything Studio has recorded across every collection, newest first. Only recorded editorial events appear — nothing here is inferred from an entry's current state."
      />
      <ActivityFilterBar filters={filters} actors={actors} />
      <ActivityFeed initial={page} params={params} />
    </div>
  );
}
