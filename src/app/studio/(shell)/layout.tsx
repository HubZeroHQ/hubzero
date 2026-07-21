import { ObjectId } from 'mongodb';
import { redirect } from 'next/navigation';
import { StudioShell } from '@/components/studio/shell/StudioShell';
import { auth } from '@/lib/auth';
import { leadRepository } from '@/lib/db/repositories/lead';

/**
 * The shell chrome (sidebar, top bar, command palette — `StudioShell`) wraps
 * every route in this `(shell)` group but not `/studio/login`, which lives
 * outside the group and renders full-screen instead. `middleware.ts`
 * already redirects signed-out requests before they reach here; this
 * `redirect` is a defense-in-depth check (`.hubzero/principles.md` —
 * Finish Completely), not the primary gate.
 */
export default async function StudioShellLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) {
    redirect('/studio/login');
  }

  const { role } = session.user;
  const hasAssignedLeads =
    role === 'member'
      ? (await leadRepository.list({ assignedToUserId: new ObjectId(session.user.id) })).length > 0
      : false;

  return (
    <StudioShell
      role={role}
      hasAssignedLeads={hasAssignedLeads}
      user={{
        name: session.user.name ?? session.user.email ?? 'Unknown',
        email: session.user.email ?? '',
        role,
      }}
    >
      {children}
    </StudioShell>
  );
}
