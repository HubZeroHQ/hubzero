import type { Metadata } from 'next';
import { PageHeader } from '@/components/studio/PageHeader';
import { StudioSearch } from '@/components/studio/search/StudioSearch';
import { auth } from '@/lib/auth';
import { ensureSearchAdaptersRegistered } from '@/lib/search/register';
import { listSearchIndex } from '@/lib/search/registry';
import { measureServerOperation } from '@/lib/performance/server';

export const metadata: Metadata = { title: 'Search — HubZero Studio' };

/**
 * The full search screen. The command palette stays the fast keyboard jump;
 * this is the one to hold open while narrowing a query, which is why the
 * index is loaded once here rather than re-queried per keystroke.
 *
 * Scoping happens on this side of the boundary: `listSearchIndex` runs only
 * the adapters this viewer's role permits, so the snapshot handed to the
 * browser contains nothing they could not already have listed.
 */
export default async function StudioSearchPage() {
  return measureServerOperation('/studio/search', 'page', renderStudioSearchPage);
}

async function renderStudioSearchPage() {
  const session = await auth();
  ensureSearchAdaptersRegistered();
  const index = session
    ? await listSearchIndex({ role: session.user.role, userId: session.user.id })
    : [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Search"
        description="Find any entry in any collection by title, slug, or reference ID."
      />
      <StudioSearch index={index} />
    </div>
  );
}
