import { mediaAssetSchema, type MediaAssetInput } from '@/lib/validation/media';
import type { MediaAsset } from '@/types/cms';
import { collections } from '../collections';
import { createRepository } from '../repository';

const base = createRepository<MediaAsset, MediaAssetInput>(collections.media);

export const mediaRepository = {
  findById: base.findById,
  list: base.list,
  remove: base.remove,
  findByCloudinaryPublicId: async (cloudinaryPublicId: string) =>
    (await collections.media()).findOne({ cloudinaryPublicId }),
  create: (input: MediaAssetInput) => base.create(mediaAssetSchema.parse(input)),
  update: (id: string, input: Partial<MediaAssetInput>) =>
    base.update(id, mediaAssetSchema.partial().parse(input)),
};
