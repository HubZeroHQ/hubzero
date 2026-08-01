import type { Metadata } from 'next';
import { PageHeader } from '@/components/studio/PageHeader';
import { HealthDashboardSection } from '@/components/studio/health/HealthDashboardSection';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { ErrorState } from '@/components/ui/ErrorState';
import { roleHasCapability } from '@/config/permissions';
import { auth } from '@/lib/auth';

export const metadata: Metadata = { title: 'Content health — HubZero Studio' };

/**
 * The full editorial health report (v3.1 Milestone 16).
 *
 * This page exists because the dashboard stopped being the right home for it.
 * The report lists every check the Studio runs — including the ones currently
 * passing — which is genuinely useful when you want to know *what is being
 * watched*, and actively unhelpful as the first thing an editor sees each
 * morning. The dashboard now carries only the findings that need someone;
 * this is where the complete picture lives.
 *
 * It renders `HealthDashboardSection` unchanged. Nothing was rewritten to move
 * it here — the same loader, the same rules, the same rendering.
 */
export default async function ContentHealthPage() {
  const session = await auth();
  if (!session || !roleHasCapability(session.user.role, 'editAnyEntry')) {
    return (
      <ErrorState
        title="You can't review content health."
        description="Most findings here are resolved by editing entries that may not be yours."
        action={
          <ButtonLink href="/studio/dashboard" variant="secondary">
            Back to dashboard
          </ButtonLink>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Content health"
        description="Every editorial check the Studio runs, including the ones currently passing. The dashboard shows only what needs action; this is the complete report."
      />
      <HealthDashboardSection />
    </div>
  );
}
