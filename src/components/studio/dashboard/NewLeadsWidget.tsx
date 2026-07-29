import { EmptyState } from '@/components/ui/EmptyState';
import { formatRelativeTime } from '@/lib/utils/relative-time';
import type { Lead } from '@/types/studio';
import { DashboardListRow } from './DashboardListRow';

/**
 * CMS_PRODUCT_DESIGN.md §3 — "how many things are waiting, untriaged" is
 * itself the actionable fact for Leads, the same shape as In Review Queue
 * but for a different collection (§26.8).
 */
export function NewLeadsWidget({ leads }: { leads: Lead[] }) {
  if (leads.length === 0) {
    return (
      <EmptyState
        title="No new leads"
        description="Submissions from the contact form will show up here as they arrive."
      />
    );
  }

  return (
    <ul className="divide-border-muted flex flex-col divide-y">
      {leads.slice(0, 8).map((lead) => (
        <li key={lead._id.toString()}>
          <DashboardListRow href="/studio/leads">
            <span className="text-text-primary min-w-0 flex-1 truncate">{lead.name}</span>
            <span className="text-text-muted shrink-0 truncate text-xs">{lead.email}</span>
            <span className="text-text-muted shrink-0 text-xs">
              {formatRelativeTime(lead.createdAt)}
            </span>
          </DashboardListRow>
        </li>
      ))}
    </ul>
  );
}
