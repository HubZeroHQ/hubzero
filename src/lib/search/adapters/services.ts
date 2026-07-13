import { serviceRepository } from '@/lib/db/repositories/service';
import type { SearchAdapter } from '../types';

/** Services (§26.7) carries the simplified two-state workflow, no slug/reference ID. */
export const servicesSearchAdapter: SearchAdapter = {
  type: 'services',
  label: 'Services',
  isVisible: () => true,
  async search(query) {
    const entries = await serviceRepository.list();
    const normalizedQuery = query.toLowerCase();

    return entries
      .filter(
        (entry) =>
          entry.title.toLowerCase().includes(normalizedQuery) ||
          entry.description.toLowerCase().includes(normalizedQuery),
      )
      .map((entry) => ({
        id: entry._id.toString(),
        type: 'services' as const,
        title: entry.title,
        status: entry.status,
        href: '/cms/studio/services',
      }));
  },
};
