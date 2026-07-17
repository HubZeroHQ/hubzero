import type { ObjectId } from 'mongodb';
import { mediaRepository } from '@/lib/db/repositories/media';
import type { MediaAsset } from '@/types/studio';

/**
 * Resolves a collection entry's direct hero image + gallery Media
 * references (CMS_PRODUCT_DESIGN.md §6) in one call. Extracted once Build
 * and Blueprint's detail/edit routes both needed the identical "look up the
 * hero if set, look up every gallery id in parallel, drop any that no
 * longer resolve" sequence — a third collection reusing this pair (Work's
 * own `heroImageId` today has no gallery counterpart) is a call to this
 * function, not a fifth copy of the `Promise.all` boilerplate.
 */
export async function resolveHeroAndGallery(
  heroImageId: ObjectId | undefined,
  galleryImageIds: ObjectId[],
): Promise<{ heroAsset: MediaAsset | null; galleryAssets: MediaAsset[] }> {
  const [heroAsset, galleryAssets] = await Promise.all([
    heroImageId ? mediaRepository.findById(heroImageId.toString()) : Promise.resolve(null),
    Promise.all(galleryImageIds.map((imageId) => mediaRepository.findById(imageId.toString()))),
  ]);

  return {
    heroAsset,
    galleryAssets: galleryAssets.filter((asset): asset is MediaAsset => asset !== null),
  };
}

export async function resolveMediaAssets(ids: ObjectId[]): Promise<MediaAsset[]> {
  const assets = await Promise.all(ids.map((id) => mediaRepository.findById(id.toString())));
  return assets.filter((asset): asset is MediaAsset => asset !== null);
}
