import type { Metadata } from 'next';
import { FeaturedOrderPage } from '@/components/studio/featured/FeaturedOrderPage';
import { FEATURED_COLLECTIONS } from '@/lib/studio/featured-collections';

export const metadata: Metadata = { title: 'Work editorial order — HubZero Studio' };

/**
 * One thin route per orderable collection. Everything except the key comes
 * from `FEATURED_COLLECTIONS`, so adding a collection to the registry is the
 * only step that carries real information (v3.1 Milestone 2).
 */
export default function WorkFeaturedOrderRoute() {
  return <FeaturedOrderPage collection={FEATURED_COLLECTIONS.work} />;
}
