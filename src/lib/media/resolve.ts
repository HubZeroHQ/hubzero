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
  const ids = [heroImageId, ...galleryImageIds]
    .filter((id): id is ObjectId => Boolean(id))
    .map((id) => id.toString());
  const assets = await mediaRepository.findByIds(ids);
  const byId = new Map(assets.map((asset) => [asset._id.toString(), asset]));

  return {
    heroAsset: heroImageId ? (byId.get(heroImageId.toString()) ?? null) : null,
    galleryAssets: galleryImageIds.flatMap((id) => {
      const asset = byId.get(id.toString());
      return asset ? [asset] : [];
    }),
  };
}

export async function resolveMediaAssets(ids: ObjectId[]): Promise<MediaAsset[]> {
  const assets = await mediaRepository.findByIds(ids.map((id) => id.toString()));
  const byId = new Map(assets.map((asset) => [asset._id.toString(), asset]));
  return ids.flatMap((id) => {
    const asset = byId.get(id.toString());
    return asset ? [asset] : [];
  });
}
