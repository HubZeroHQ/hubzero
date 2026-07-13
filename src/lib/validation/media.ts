import { z } from 'zod';

/** PLANNING.md §26.10, §33 — a Cloudinary reference, never binary data. */
export const mediaAssetSchema = z.object({
  cloudinaryPublicId: z.string().min(1),
  url: z.string().url(),
  altText: z.string().min(1),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  reuseTags: z.array(z.string().min(1)).default([]),
});

export type MediaAssetInput = z.infer<typeof mediaAssetSchema>;
