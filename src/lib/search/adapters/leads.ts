import { leadRepository } from '@/lib/db/repositories/lead';
import type { SearchAdapter } from '../types';

/**
 * Leads (§26.8) is the one collection search results must scope by
 * assignment, not just by role visibility (§8: a Member without
 * Leads visibility never sees a Lead surface in search either) — no
 * reference ID, since Leads never receives one.
 */
export const leadsSearchAdapter: SearchAdapter = {
  type: 'leads',
  label: 'Leads',
  isVisible: () => true,
  async search(query, ctx) {
    const entries = await leadRepository.list();
    const normalizedQuery = query.toLowerCase();
    const scoped =
      ctx.role === 'member'
        ? entries.filter((entry) => entry.assignedToUserId?.toString() === ctx.userId)
        : entries;

    return scoped
      .filter(
        (entry) =>
          entry.name.toLowerCase().includes(normalizedQuery) ||
          entry.email.toLowerCase().includes(normalizedQuery),
      )
      .map((entry) => ({
        id: entry._id.toString(),
        type: 'leads' as const,
        title: entry.name,
        subtitle: entry.email,
        status: undefined,
        href: '/studio/leads',
      }));
  },
};
