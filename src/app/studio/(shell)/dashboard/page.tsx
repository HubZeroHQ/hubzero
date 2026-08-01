import type { Metadata } from 'next';
import { ContentEntryList } from '@/components/studio/dashboard/ContentEntryList';
import { DashboardWidgetCard } from '@/components/studio/dashboard/DashboardWidgetCard';
import { NewLeadsWidget } from '@/components/studio/dashboard/NewLeadsWidget';
import { PublishingSummary } from '@/components/studio/dashboard/PublishingSummary';
import { RecentActivityWidget } from '@/components/studio/dashboard/RecentActivityWidget';
import { HealthOverviewSection } from '@/components/studio/health/HealthOverviewSection';
import { PageHeader } from '@/components/studio/PageHeader';
import { auth } from '@/lib/auth';
import { listAllContent } from '@/lib/studio/dashboard-queries';
import { leadRepository } from '@/lib/db/repositories/lead';
import type { PublishStatus } from '@/types/studio';

export const metadata: Metadata = {
  title: 'Dashboard — HubZero Studio',
};

/**
 * The editorial control centre (v3.1 Milestone 16).
 *
 * Every section answers one of three questions, in this order:
 *
 * 1. **What needs me?** — health findings that actually exist, then the review
 *    queue and new leads.
 * 2. **What am I working on?** — the viewer's own drafts.
 * 3. **What changed?** — a five-row activity preview.
 *
 * Anything that answers none of those was moved rather than deleted. The full
 * health report — including the checks that are currently passing — now lives
 * at `/studio/health`, and the complete activity feed at `/studio/activity`.
 * The dashboard previously rendered both in full, which is why a site with
 * nothing wrong still needed scrolling to say so.
 *
 * `(shell)/layout.tsx` already guarantees a session, so `auth()` here reads it
 * rather than re-guarding the route.
 */
export default async function DashboardPage() {
  const session = await auth();
  const { role, id: userId } = session!.user;

  const [content, allLeads] = await Promise.all([listAllContent(), leadRepository.list()]);

  const ownDrafts = content.filter(
    (entry) => entry.status === 'draft' && entry.createdByUserId === userId,
  );
  const inReview = content.filter((entry) => entry.status === 'inReview');

  const newLeads = allLeads.filter(
    (lead) =>
      lead.status === 'new' && (role !== 'member' || lead.assignedToUserId?.toString() === userId),
  );

  // One pass over the content already loaded — these totals replace the
  // previous collection-by-collection breakdown, which listed roughly forty
  // numbers that asked nobody to do anything.
  const statusCounts = content.reduce<Record<string, number>>((counts, entry) => {
    counts[entry.status] = (counts[entry.status] ?? 0) + 1;
    return counts;
  }, {});

  const showNewLeads = role !== 'member' || newLeads.length > 0;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Dashboard" description="What needs your attention right now." />

      {/* Findings first, and only the ones that exist. Restricted to the roles
          that can act on them — most findings require `publish`. */}
      {role !== 'member' ? <HealthOverviewSection /> : null}

      <div className="grid items-start gap-6 md:grid-cols-2">
        {role === 'member' ? (
          <DashboardWidgetCard title="Needs your attention">
            <ContentEntryList entries={ownDrafts} emptyTitle="Nothing waiting on you" />
          </DashboardWidgetCard>
        ) : (
          <DashboardWidgetCard title="Review queue">
            <ContentEntryList entries={inReview} emptyTitle="Nothing in review" />
          </DashboardWidgetCard>
        )}

        {showNewLeads ? (
          <DashboardWidgetCard title="New leads">
            <NewLeadsWidget leads={newLeads} />
          </DashboardWidgetCard>
        ) : null}
      </div>

      {/* "What am I working on" — kept for the roles whose attention card above
          is the review queue rather than their own drafts. */}
      {role !== 'member' ? (
        <DashboardWidgetCard title="Your drafts">
          <ContentEntryList entries={ownDrafts} emptyTitle="No drafts" />
        </DashboardWidgetCard>
      ) : null}

      <DashboardWidgetCard title="Publishing">
        <PublishingSummary counts={statusCounts as Record<PublishStatus, number>} />
      </DashboardWidgetCard>

      <DashboardWidgetCard title="Recent activity">
        <RecentActivityWidget />
      </DashboardWidgetCard>
    </div>
  );
}
