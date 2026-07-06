/**
 * Builds Cloudinary delivery URLs with `q_auto`/`f_auto`/responsive-width
 * transformations (`ARCHITECTURE/19_CMS_FOUNDATION.md` §8) from a `Media`
 * document's already-known `secureUrl` — deliberately a pure string
 * transform, not a call into the `cloudinary` SDK (which needs an API
 * secret), so it's safe to import from `"use client"` components like
 * `<MediaImage>`/`<MediaThumbnail>` without pulling server-only credentials
 * into the client bundle. A Cloudinary delivery URL's cloud name is public by
 * construction (it's already part of every `secureUrl` string), so no secret
 * ever needs to reach the client for this to work.
 *
 * Local-storage URLs (`/api/media/...`) pass through unchanged — that backend
 * has no on-the-fly transformation, so `width` is simply ignored for it.
 */
const CLOUDINARY_HOST = "res.cloudinary.com";

export function isCloudinaryUrl(url: string): boolean {
  try {
    return new URL(url, "http://localhost").hostname === CLOUDINARY_HOST;
  } catch {
    return false;
  }
}

export interface CloudinaryTransformOptions {
  width?: number;
  quality?: "auto" | number;
  format?: "auto" | string;
}

export function cloudinaryTransformUrl(
  url: string,
  { width, quality = "auto", format = "auto" }: CloudinaryTransformOptions = {},
): string {
  if (!isCloudinaryUrl(url) || !url.includes("/upload/")) return url;
  const transforms = [`f_${format}`, `q_${quality}`, width ? `w_${Math.round(width)}` : null]
    .filter(Boolean)
    .join(",");
  return url.replace("/upload/", `/upload/${transforms}/`);
}

/**
 * A `next/image` custom `loader` — Next calls this once per responsive
 * breakpoint it decides to generate, so the `w_` transform naturally produces
 * real responsive widths server-side (Cloudinary resizes on delivery, this
 * app never does) rather than shipping one fixed-size original to every
 * viewport.
 */
export function cloudinaryImageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  return cloudinaryTransformUrl(src, { width, quality: quality ?? "auto" });
}
