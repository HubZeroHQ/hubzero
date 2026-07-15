import { mediaAssetSchema, type MediaAssetInput } from '@/lib/validation/media';
import type { MediaAsset } from '@/types/studio';
import { collections } from '../collections';
import { createRepository, parsePartialInput } from '../repository';

const base = createRepository<MediaAsset, MediaAssetInput>(collections.media);

export const mediaRepository = {
  findById: base.findById,
  list: base.list,
  remove: base.remove,
  findByCloudinaryPublicId: async (cloudinaryPublicId: string) =>
    (await collections.media()).findOne({ cloudinaryPublicId }),
  create: (input: MediaAssetInput, meta: { createdByUserId?: string } = {}) =>
    base.create(mediaAssetSchema.parse(input), meta),
  update: (id: string, input: Partial<MediaAssetInput>) =>
    base.update(id, parsePartialInput(mediaAssetSchema, input)),
};
