import { mediaAssetSchema, type MediaAssetInput } from '@/lib/validation/media';
import { ObjectId } from 'mongodb';
import type { MediaAsset } from '@/types/studio';
import { collections } from '../collections';
import { createRepository, parsePartialInput } from '../repository';

const base = createRepository<MediaAsset, MediaAssetInput>(collections.media);

export const mediaRepository = {
  findById: base.findById,
  findByIds: async (ids: readonly string[]) => {
    const objectIds = [...new Set(ids)]
      .filter((id) => ObjectId.isValid(id))
      .map((id) => new ObjectId(id));
    if (objectIds.length === 0) return [];
    return (await collections.media()).find({ _id: { $in: objectIds } }).toArray();
  },
  list: base.list,
  remove: base.remove,
  findByCloudinaryPublicId: async (cloudinaryPublicId: string) =>
    (await collections.media()).findOne({ cloudinaryPublicId }),
  create: (input: MediaAssetInput, meta: { createdByUserId?: string } = {}) =>
    base.create(mediaAssetSchema.parse(input), meta),
  update: (id: string, input: Partial<MediaAssetInput>) =>
    base.update(id, parsePartialInput(mediaAssetSchema, input)),
};
