/**
 * Re-imports the five founder portraits from `team-portraits/*.jpg` after a
 * higher-resolution re-shoot/export (same 3:4 framing — only source quality
 * changed).
 *
 * This intentionally differs from `ensurePortrait()` in
 * scripts/seed-engineering-profiles.ts, which skips the upload entirely once
 * a Media record for a founder's `cloudinaryPublicId` already exists. That
 * skip is correct for first-time seeding, but wrong here: we want the same
 * Cloudinary public ID and the same Media record updated in place (CMS_
 * PRODUCT_DESIGN.md Appendix B.2's "replace this file everywhere" case, not
 * the per-reference "replace" that always forks a new record), so every
 * existing `Team.portraitId` reference keeps pointing at the same asset —
 * just newer bytes behind it. No new Media documents are created and no
 * Team/EngineeringProfile records are touched.
 *
 * Usage: npm run reimport:team-portraits
 */
import path from 'node:path';
import { mediaRepository } from '@/lib/db/repositories/media';
import { getCloudinaryClient } from '@/lib/media/cloudinary';

const FOUNDERS: { slug: string; portraitFile: string; name: string; role: string }[] = [
  { slug: 'rifaque', portraitFile: 'rifaque.jpg', name: 'Rifaque Ahmed', role: 'Co-Founder' },
  { slug: 'raif', portraitFile: 'raif.jpg', name: 'Raif Karani', role: 'Co-Founder' },
  { slug: 'iyad', portraitFile: 'iyad.jpg', name: 'Mohammed Iyad', role: 'Co-Founder' },
  {
    slug: 'sultan',
    portraitFile: 'sultan.jpg',
    name: 'Syed Mohammed Sultan',
    role: 'Co-Founder',
  },
  {
    slug: 'salsabeel',
    portraitFile: 'salsabeel.jpg',
    name: 'Salsabeel Kobattey',
    role: 'Co-Founder',
  },
];

async function reimportPortrait(founder: (typeof FOUNDERS)[number]): Promise<void> {
  const publicId = `hubzero/team/${founder.slug}`;
  const existing = await mediaRepository.findByCloudinaryPublicId(publicId);
  if (!existing) {
    throw new Error(
      `No existing Media record for "${publicId}" — run \`npm run seed:engineering-profiles\` ` +
        `first, or this founder has never been imported.`,
    );
  }

  const filePath = path.resolve(process.cwd(), 'team-portraits', founder.portraitFile);
  const cloudinary = getCloudinaryClient();

  // `overwrite: true` replaces the binary at the same public_id;
  // `invalidate: true` busts Cloudinary's edge cache so the new bytes are
  // actually served instead of a stale CDN copy. The resulting `secure_url`
  // carries a new `/v<version>/` segment, which also cache-busts on our side
  // (Next/Image and browsers key on the URL).
  const upload = await cloudinary.uploader.upload(filePath, {
    public_id: publicId,
    overwrite: true,
    invalidate: true,
  });

  const aspectRatio = upload.width / upload.height;
  if (Math.abs(aspectRatio - 3 / 4) > 0.02) {
    throw new Error(
      `${founder.name}: expected a 3:4 portrait, got ${upload.width}x${upload.height} ` +
        `(ratio ${aspectRatio.toFixed(3)}). Aborting to avoid a framing regression.`,
    );
  }

  await mediaRepository.update(existing._id.toString(), {
    url: upload.secure_url,
    width: upload.width,
    height: upload.height,
    fileSizeBytes: upload.bytes,
    mimeType: `image/${upload.format}`,
    originalFilename: founder.portraitFile,
  });

  console.log(
    `Updated ${founder.name} (${publicId}): ${upload.width}x${upload.height}, ` +
      `${(upload.bytes / 1024).toFixed(0)} KB -> ${upload.secure_url}`,
  );
}

async function main(): Promise<void> {
  const nodeEnv = process.env.NODE_ENV ?? 'development';
  if (nodeEnv !== 'development') {
    console.error(`Refusing to run: NODE_ENV is "${nodeEnv}", not "development".`);
    process.exit(1);
  }

  for (const founder of FOUNDERS) {
    await reimportPortrait(founder);
  }

  console.log(
    '\nDone. Same Media record IDs and cloudinaryPublicIds throughout — no duplicates created.',
  );
  process.exit(0);
}

main().catch((error) => {
  console.error('Reimport failed:', error);
  process.exit(1);
});
