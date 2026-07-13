import { userRepository } from '@/lib/db/repositories/user';
import { ROLE_LABEL } from '@/lib/studio/role-label';
import type { SearchAdapter } from '../types';

/** Users (§26.9) is Head Admin-only, matching Settings' visibility (§8). */
export const usersSearchAdapter: SearchAdapter = {
  type: 'users',
  label: 'Users',
  isVisible: (ctx) => ctx.role === 'headAdmin',
  async search(query) {
    const entries = await userRepository.list();
    const normalizedQuery = query.toLowerCase();

    return entries
      .filter(
        (entry) =>
          entry.name.toLowerCase().includes(normalizedQuery) ||
          entry.email.toLowerCase().includes(normalizedQuery),
      )
      .map((entry) => ({
        id: entry._id.toString(),
        type: 'users' as const,
        title: entry.name,
        subtitle: ROLE_LABEL[entry.role],
        href: '/studio/settings/users',
      }));
  },
};
