import { ObjectId } from 'mongodb';
import { redirect } from 'next/navigation';
import { CmsShell } from '@/components/cms/shell/CmsShell';
import { auth } from '@/lib/auth';
import { leadRepository } from '@/lib/db/repositories/lead';

/**
 * The shell chrome (sidebar, top bar, command palette — `CmsShell`) wraps
 * every route in this `(shell)` group but not `/cms/login`, which lives
 * outside the group and renders full-screen instead. `middleware.ts`
 * already redirects signed-out requests before they reach here; this
 * `redirect` is a defense-in-depth check (`.hubzero/principles.md` —
 * Finish Completely), not the primary gate.
 */
export default async function CmsShellLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) {
    redirect('/cms/login');
  }

  const { role } = session.user;
  const hasAssignedLeads =
    role === 'teamMember'
      ? (await leadRepository.list({ assignedToUserId: new ObjectId(session.user.id) })).length > 0
      : false;

  return (
    <CmsShell
      role={role}
      hasAssignedLeads={hasAssignedLeads}
      user={{
        name: session.user.name ?? session.user.email ?? 'Unknown',
        email: session.user.email ?? '',
        role,
      }}
    >
      {children}
    </CmsShell>
  );
}
