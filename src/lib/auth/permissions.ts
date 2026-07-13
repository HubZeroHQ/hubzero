import type { ObjectId } from 'mongodb';
import { type Capability, roleHasCapability } from '@/config/permissions';
import type { UserRole } from '@/types/studio';
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

export interface SessionIdentity {
  role: UserRole;
  userId: string;
}

/** The current Studio session's role, or `null` if signed out. */
export async function getSessionRole(): Promise<UserRole | null> {
  const session = await auth();
  return session?.user.role ?? null;
}

/**
 * Throws if the current session lacks `capability` (PLANNING.md §29). Every
 * Studio server action or route handler that performs a role-level gated
 * operation should call this before touching the database —
 * `config/permissions.ts`'s capability table is the single source of truth
 * for who can do what, not ad hoc `role === 'admin'` checks scattered
 * through the codebase.
 *
 * For operations scoped to a specific entry (edit, not create/list), use
 * `requireEntryCapability` instead — Team Member's "own entries + assigned
 * entries only" qualifier (§29) can't be decided from the role alone.
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

/** The subset of an entry's fields entry-scoped permission checks read. */
export interface OwnableEntry {
  createdByUserId?: ObjectId;
  assignedToUserId?: ObjectId;
}

/**
 * Throws unless the current session may act on `entry` under `capability`
 * (PLANNING.md §29's "own entries + assigned entries only" for Team
 * Member). `createdByUserId`/`assignedToUserId` are read purely as
 * provenance/assignment data to decide *which* entries a role's existing
 * capability applies to — the role/capability table in
 * `config/permissions.ts` remains the actual authorization source, not
 * entry ownership itself:
 *
 * - A role with `editAnyEntry` (Admin, Head Admin) always passes.
 * - A role with `editOwnEntry` passes only if `entry.createdByUserId`
 *   matches the signed-in user.
 * - A role with `editAssignedEntry` passes only if `entry.assignedToUserId`
 *   matches the signed-in user.
 */
export async function requireEntryCapability(entry: OwnableEntry): Promise<SessionIdentity> {
  const session = await auth();
  if (!session) {
    throw new UnauthorizedError();
  }

  if (!canActOnEntry(entry, { role: session.user.role, userId: session.user.id })) {
    throw new ForbiddenError(`Role "${session.user.role}" cannot act on this entry.`);
  }

  return { role: session.user.role, userId: session.user.id };
}

/**
 * The non-throwing sibling of `requireEntryCapability` — same ownership
 * logic, used where a page needs a plain boolean to decide what to *show*
 * (an Edit button, a status-transition control) rather than to gate a
 * mutation. Every collection's detail/edit pages need this exact "can the
 * viewer act on this specific entry" check, so it's the one place that
 * logic lives instead of each page re-deriving
 * `isAnyEntryEditor`/`isOwner`/`isAssignee` inline.
 */
export function canActOnEntry(entry: OwnableEntry, session: SessionIdentity): boolean {
  const { role, userId } = session;

  const isAnyEntryEditor = roleHasCapability(role, 'editAnyEntry');
  const isOwner =
    roleHasCapability(role, 'editOwnEntry') && entry.createdByUserId?.toString() === userId;
  const isAssignee =
    roleHasCapability(role, 'editAssignedEntry') && entry.assignedToUserId?.toString() === userId;

  return isAnyEntryEditor || isOwner || isAssignee;
}
