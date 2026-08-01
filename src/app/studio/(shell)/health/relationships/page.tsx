import type { Metadata } from 'next';
import { PageHeader } from '@/components/studio/PageHeader';
import { RelationshipHealthList } from '@/components/studio/health/RelationshipHealthList';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { ErrorState } from '@/components/ui/ErrorState';
import { roleHasCapability } from '@/config/permissions';
import { auth } from '@/lib/auth';
import { loadRelationshipIssues } from '@/lib/studio/relationship-health/service';

export const metadata: Metadata = { title: 'Relationship health — HubZero Studio' };

/**
 * The full, filterable integrity report. The dashboard carries the headline
 * count; this is where an editor triages and repairs.
 */
export default async function RelationshipHealthPage() {
  const session = await auth();
  if (!session || !roleHasCapability(session.user.role, 'editAnyEntry')) {
    return (
      <ErrorState
        title="You can't review relationship health."
        description="Repairing a broken reference means editing the entry that holds it, which may not be one of yours."
        action={
          <ButtonLink href="/studio/dashboard" variant="secondary">
            Back to dashboard
          </ButtonLink>
        }
      />
    );
  }

  const issues = await loadRelationshipIssues();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Relationship health"
        description="Every relationship each entry asserts, checked against what actually exists — at all statuses. The public site silently drops references it cannot resolve, so these are invisible from the site itself."
      />
      <RelationshipHealthList issues={issues} />
    </div>
  );
}
