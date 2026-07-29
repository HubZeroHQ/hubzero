import { userRepository } from '@/lib/db/repositories/user';

/**
 * Users management's core safeguard (Users completion sprint, Part 1):
 * there must always be at least one active Head Admin, so the Studio can
 * never lock itself out of user administration. Call with the user about
 * to be deleted/disabled/demoted — returns whether removing *their*
 * standing as an active Head Admin would leave zero others.
 */
export async function isLastActiveHeadAdmin(userId: string): Promise<boolean> {
  const target = await userRepository.findById(userId);
  if (!target || target.role !== 'headAdmin' || target.disabled) {
    return false;
  }

  const allUsers = await userRepository.list();
  const otherActiveHeadAdmins = allUsers.filter(
    (user) => user.role === 'headAdmin' && !user.disabled && user._id.toString() !== userId,
  );

  return otherActiveHeadAdmins.length === 0;
}
