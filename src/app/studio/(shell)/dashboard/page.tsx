import type { Metadata } from 'next';
import { ContentEntryList } from '@/components/studio/dashboard/ContentEntryList';
import { DashboardWidgetCard } from '@/components/studio/dashboard/DashboardWidgetCard';
import { NewLeadsWidget } from '@/components/studio/dashboard/NewLeadsWidget';
import { RecentActivityWidget } from '@/components/studio/dashboard/RecentActivityWidget';
import { PageHeader } from '@/components/studio/PageHeader';
import { auth } from '@/lib/auth';
import { listAllContent } from '@/lib/studio/dashboard-queries';
import { leadRepository } from '@/lib/db/repositories/lead';

export const metadata: Metadata = {
  title: 'Dashboard — HubZero Studio',
};

/**
 * CMS_PRODUCT_DESIGN.md §3 — every widget here is a live, filtered view
 * into a real collection, never a summary statistic; each is empty today
 * only because no Studio content exists yet, not because it's mocked.
 * `(shell)/layout.tsx` already guarantees a session exists before this
 * renders, so `auth()` is called here purely to read the session, not to
 * re-guard the route.
 */
export default async function DashboardPage() {
  const session = await auth();
  const { role, id: userId } = session!.user;

  const [content, allLeads] = await Promise.all([listAllContent(), leadRepository.list()]);

  const ownDrafts = content.filter(
    (entry) => entry.status === 'draft' && entry.createdByUserId === userId,
  );
  const inReview = content.filter((entry) => entry.status === 'inReview');
  const recentlyPublished = content
    .filter((entry) => entry.status === 'published')
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  const newLeads = allLeads.filter(
    (lead) =>
      lead.status === 'new' &&
      (role !== 'teamMember' || lead.assignedToUserId?.toString() === userId),
  );

  // §3: Admin/Head Admin's "Needs Your Attention" is the In Review queue
  // filtered to collections they can act on — both roles can act on every
  // collection (§29), so it's the full queue; Team Member's is their own
  // Drafts instead.
  const needsAttention = role === 'teamMember' ? ownDrafts : inReview;
  const showInReviewQueue = role !== 'teamMember';
  const showNewLeads = role !== 'teamMember' || newLeads.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Dashboard" description="What needs your attention right now." />

      <DashboardWidgetCard title="Needs your attention">
        <ContentEntryList
          entries={needsAttention}
          emptyTitle={role === 'teamMember' ? 'Nothing waiting on you' : 'Nothing in review'}
          emptyDescription={
            role === 'teamMember'
              ? 'Drafts you own will show up here.'
              : 'Entries submitted for review will show up here.'
          }
        />
      </DashboardWidgetCard>

      <div className="grid gap-6 md:grid-cols-2">
        {showInReviewQueue ? (
          <DashboardWidgetCard title="In review queue">
            <ContentEntryList
              entries={inReview}
              emptyTitle="Nothing in review"
              emptyDescription="Entries submitted across Work, Builds, Blueprints, Labs, and Notes will show up here."
            />
          </DashboardWidgetCard>
        ) : null}
        {showNewLeads ? (
          <DashboardWidgetCard title="New leads">
            <NewLeadsWidget leads={newLeads} />
          </DashboardWidgetCard>
        ) : null}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <DashboardWidgetCard title="Your drafts">
          <ContentEntryList
            entries={ownDrafts}
            emptyTitle="No drafts"
            emptyDescription="Content you're actively writing will show up here."
          />
        </DashboardWidgetCard>
        <DashboardWidgetCard title="Recently published">
          <ContentEntryList
            entries={recentlyPublished}
            emptyTitle="Nothing published yet"
            emptyDescription="Entries that go live will show up here, linking straight to what shipped."
          />
        </DashboardWidgetCard>
      </div>

      <DashboardWidgetCard title="Recent activity">
        <RecentActivityWidget />
      </DashboardWidgetCard>
    </div>
  );
}
