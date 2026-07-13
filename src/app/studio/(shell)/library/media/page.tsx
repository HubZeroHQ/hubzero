import type { Metadata } from 'next';
import { CollectionPlaceholder } from '@/components/studio/CollectionPlaceholder';

export const metadata: Metadata = { title: 'Media — HubZero Studio' };

export default function MediaPage() {
  return (
    <CollectionPlaceholder
      title="Media"
      description="The Media library — upload, search, and reuse of Cloudinary-backed assets — hasn't been built yet (CMS_PRODUCT_DESIGN.md §6)."
    />
  );
}
