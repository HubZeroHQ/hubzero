import { loadHealthReport } from '@/lib/studio/health/service';
import { HealthOverview } from './HealthOverview';

/**
 * Server boundary for the dashboard's health overview: one load, then pure
 * rendering — the same split as `HealthDashboardSection`, and the same single
 * `loadHealthReport` call. The dashboard and the full report differ only in
 * presentation, never in what was computed.
 */
export async function HealthOverviewSection() {
  const report = await loadHealthReport();
  return <HealthOverview report={report} />;
}
