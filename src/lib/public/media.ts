import type { MediaAsset } from '@/types/studio';
import type { PublicMedia, PublicMediaRole } from './domain';

const RESPONSIVE_WIDTHS = [320, 480, 640, 768, 960, 1200, 1600, 2000] as const;
const PLACEHOLDER_COLOR = '#141414';

const SIZES_BY_ROLE: Record<PublicMediaRole, string> = {
  hero: '(min-width: 1440px) 1300px, (min-width: 768px) calc(100vw - 96px), calc(100vw - 40px)',
  screenshot: '(min-width: 1024px) 960px, calc(100vw - 40px)',
  diagram: '(min-width: 1024px) 960px, calc(100vw - 40px)',
  portrait: '(min-width: 900px) 420px, calc(100vw - 40px)',
  gallery: '(min-width: 1300px) 620px, (min-width: 700px) 48vw, calc(100vw - 40px)',
  inline: '(min-width: 1024px) 800px, calc(100vw - 40px)',
  social: '1200px',
};

export function isSafePublicUrl(value: string): boolean {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

/** Adds a bounded, provider-owned Cloudinary transformation to a delivery URL. */
export function cloudinaryImageUrl(source: string, width?: number): string | null {
  if (!isSafePublicUrl(source)) return null;
  const url = new URL(source);
  if (url.hostname !== 'res.cloudinary.com') return null;
  const marker = '/upload/';
  if (!url.pathname.includes(marker)) return null;
  const transform = ['f_auto', 'q_auto', 'c_limit', width ? `w_${width}` : undefined]
    .filter(Boolean)
    .join(',');
  url.pathname = url.pathname.replace(marker, `${marker}${transform}/`);
  return url.toString();
}

export function toPublicMedia(
  asset: MediaAsset | null | undefined,
  role: PublicMediaRole,
  context?: { alt?: string; caption?: string; crop?: string },
): PublicMedia | undefined {
  if (!asset?.width || !asset.height) return undefined;
  const assetWidth = asset.width;
  const alt = context?.alt ?? asset.altText;
  if (!alt.trim()) return undefined;
  const baseWidth = Math.min(assetWidth, role === 'social' ? 1200 : 2000);
  const url = cloudinaryImageUrl(asset.url, baseWidth);
  if (!url) return undefined;
  const widths = RESPONSIVE_WIDTHS.filter((width) => width <= assetWidth);
  if (!widths.includes(baseWidth as (typeof RESPONSIVE_WIDTHS)[number])) {
    widths.push(baseWidth as (typeof RESPONSIVE_WIDTHS)[number]);
  }
  widths.sort((a, b) => a - b);

  return {
    url,
    width: asset.width,
    height: asset.height,
    alt,
    role,
    ...((context?.caption ?? asset.caption) ? { caption: context?.caption ?? asset.caption } : {}),
    ...(asset.credit ? { credit: asset.credit } : {}),
    ...(context?.crop ? { crop: context.crop } : {}),
    responsive: {
      srcSet: widths
        .map((width) => `${cloudinaryImageUrl(asset.url, width) ?? url} ${width}w`)
        .join(', '),
      sizes: SIZES_BY_ROLE[role],
    },
    placeholder: { kind: 'color', value: PLACEHOLDER_COLOR },
  };
}
