import { ObjectId } from 'mongodb';
import { redirect } from 'next/navigation';
import { EditorGuardProvider } from '@/components/studio/editor/EditorGuardProvider';
import { StudioShell } from '@/components/studio/shell/StudioShell';
import { auth } from '@/lib/auth';
import { careerInterestRepository } from '@/lib/db/repositories/career-interest';
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
  const [hasAssignedLeads, hasAssignedCandidates] =
    role === 'member'
      ? await Promise.all([
          leadRepository
            .list({ assignedToUserId: new ObjectId(session.user.id) })
            .then((entries) => entries.length > 0),
          careerInterestRepository
            .list({ assignedToUserId: new ObjectId(session.user.id) })
            .then((entries) => entries.length > 0),
        ])
      : [false, false];

  return (
    // Wraps `StudioShell` rather than living inside it: the shell's own
    // navigation (the `g`-chord jumps in `useKeyboardShortcuts`, the command
    // palette) has to be able to consult the guard, and a provider rendered
    // *inside* the shell's JSX would be invisible to the shell's own hooks.
    <EditorGuardProvider>
      <StudioShell
        role={role}
        hasAssignedLeads={hasAssignedLeads}
        hasAssignedCandidates={hasAssignedCandidates}
        user={{
          name: session.user.name ?? session.user.email ?? 'Unknown',
          email: session.user.email ?? '',
          role,
        }}
      >
        {children}
      </StudioShell>
    </EditorGuardProvider>
  );
}
