import type { UserRole } from '@/types/studio';

export const ROLE_LABEL: Record<UserRole, string> = {
  headAdmin: 'Head Admin',
  admin: 'Admin',
  teamMember: 'Team Member',
};
