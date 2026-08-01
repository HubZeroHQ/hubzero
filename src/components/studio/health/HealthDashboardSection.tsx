import { loadHealthReport } from '@/lib/studio/health/service';
import { HealthDashboard } from './HealthDashboard';

/**
 * Server boundary for the health dashboard: one load, then pure rendering.
 * Split from `HealthDashboard` so the rendering half stays a plain function of
 * a `HealthReport` and can be exercised without a database.
 */
export async function HealthDashboardSection() {
  const report = await loadHealthReport();
  return <HealthDashboard report={report} />;
}
