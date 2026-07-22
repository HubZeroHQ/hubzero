import { z } from 'zod';
import type { MediaFolder } from '@/types/studio';

/** CMS_PRODUCT_DESIGN.md §6 — one level of grouping, not a folder tree. */
export const MEDIA_FOLDERS: readonly MediaFolder[] = [
  'work',
  'builds',
  'blueprints',
  'labs',
  'notes',
  'team',
  'engineeringProfiles',
  'general',
] as const;

const mediaFolderSchema = z.enum(MEDIA_FOLDERS as [MediaFolder, ...MediaFolder[]]);

/** PLANNING.md §26.10, §33 — a Cloudinary reference, never binary data. */
export const mediaAssetSchema = z.object({
  cloudinaryPublicId: z.string().min(1),
  url: z.string().url(),
  altText: z.string().min(1),
  caption: z.string().optional(),
  credit: z.string().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  fileSizeBytes: z.number().nonnegative().optional(),
  mimeType: z.string().optional(),
  originalFilename: z.string().optional(),
  folder: mediaFolderSchema.default('general'),
  reuseTags: z.array(z.string().min(1)).default([]),
});

export type MediaAssetInput = z.infer<typeof mediaAssetSchema>;
