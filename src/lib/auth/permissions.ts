import { type Capability, roleHasCapability } from '@/config/permissions';
import type { UserRole } from '@/types/cms';
import { auth } from './index';

export class UnauthorizedError extends Error {
  constructor(message = 'You must be signed in to do this.') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'You do not have permission to do this.') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

/** The current CMS session's role, or `null` if signed out. */
export async function getSessionRole(): Promise<UserRole | null> {
  const session = await auth();
  return session?.user.role ?? null;
}

/**
 * Throws if the current session lacks `capability` (PLANNING.md §29). Every
 * CMS server action or route handler that performs a gated operation should
 * call this before touching the database — `config/permissions.ts`'s
 * capability table is the single source of truth for who can do what, not
 * ad hoc `role === 'admin'` checks scattered through the codebase.
 *
 * Team Member's "own entries + assigned entries only" qualifier from §29 is
 * deliberately not enforced here yet: Work/Build/Blueprint/Lab (§26.1-§26.4)
 * carry no author/owner field in the approved schema, so there's nothing to
 * scope against for those collections without a schema change. Note
 * (authorId) and Lead (assignedToUserId) do carry owner-shaped fields, but a
 * consistent entry-ownership rule across every collection needs a decision
 * on whether that's a schema addition (§26) or a narrower per-collection
 * rule — worth resolving before Team Member accounts are actually in use.
 */
export async function requireCapability(capability: Capability): Promise<UserRole> {
  const session = await auth();
  if (!session) {
    throw new UnauthorizedError();
  }
  if (!roleHasCapability(session.user.role, capability)) {
    throw new ForbiddenError(`Role "${session.user.role}" lacks capability "${capability}".`);
  }
  return session.user.role;
}
