import type { MediaAsset, MediaFolder } from '@/types/studio';

/**
 * `MediaAsset` carries an `ObjectId` and `Date` fields, neither of which
 * survives the Server Action RPC boundary as the class instance
 * server-side code expects (React's flight serializer emits `_id.toJSON()`,
 * a plain string, but a client component receiving it would still be typed
 * as if it held a real `ObjectId`). Every Server Action that returns Media
 * data to a Client Component (`lib/studio/actions/media.ts`'s search/list/
 * upload actions, consumed by `MediaPicker`/`MediaGrid`) returns this DTO
 * instead, so the boundary is honest about what's actually crossing it.
 */
export interface MediaAssetDTO {
  id: string;
  cloudinaryPublicId: string;
  url: string;
  altText: string;
  caption?: string;
  credit?: string;
  width?: number;
  height?: number;
  fileSizeBytes?: number;
  mimeType?: string;
  originalFilename?: string;
  folder: MediaFolder;
  reuseTags: string[];
  createdAt: string;
  updatedAt: string;
}

export function toMediaAssetDTO(asset: MediaAsset): MediaAssetDTO {
  return {
    id: asset._id.toString(),
    cloudinaryPublicId: asset.cloudinaryPublicId,
    url: asset.url,
    altText: asset.altText,
    caption: asset.caption,
    credit: asset.credit,
    width: asset.width,
    height: asset.height,
    fileSizeBytes: asset.fileSizeBytes,
    mimeType: asset.mimeType,
    originalFilename: asset.originalFilename,
    folder: asset.folder,
    reuseTags: asset.reuseTags,
    createdAt: asset.createdAt.toISOString(),
    updatedAt: asset.updatedAt.toISOString(),
  };
}
