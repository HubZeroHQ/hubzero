import { teamRepository } from '@/lib/db/repositories/team';
import type { SearchAdapter } from '../types';

/** Team (§26.6) has no status/slug — bespoke rather than `createContentAdapter`. */
export const teamSearchAdapter: SearchAdapter = {
  type: 'team',
  label: 'Team',
  isVisible: () => true,
  async search(query) {
    const entries = await teamRepository.list();
    const normalizedQuery = query.toLowerCase();

    return entries
      .filter(
        (entry) =>
          entry.name.toLowerCase().includes(normalizedQuery) ||
          entry.role.toLowerCase().includes(normalizedQuery) ||
          entry.group.toLowerCase().includes(normalizedQuery) ||
          entry.referenceId.toLowerCase().includes(normalizedQuery),
      )
      .map((entry) => ({
        id: entry._id.toString(),
        type: 'team' as const,
        title: entry.name,
        subtitle: entry.role,
        referenceId: entry.referenceId,
        href: '/studio/team',
      }));
  },
};
