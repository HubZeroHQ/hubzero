import type { Metadata } from 'next';
import { PUBLIC_SITE } from '@/config/public-site';
import { publicEnv } from '@/lib/env';
import type { PublicMedia } from '../domain';

export function canonicalUrl(path: string): URL {
  return new URL(path, publicEnv().NEXT_PUBLIC_SITE_URL);
}

export function createPublicMetadata(input: {
  title?: string;
  description: string;
  path: string;
  image?: PublicMedia;
  noIndex?: boolean;
  type?: 'website' | 'article';
}): Metadata {
  const title = input.title ? `${input.title} — ${PUBLIC_SITE.name}` : PUBLIC_SITE.name;
  const canonical = canonicalUrl(input.path);
  const image = input.image?.url ?? canonicalUrl(PUBLIC_SITE.socialImage).toString();
  return {
    metadataBase: canonicalUrl('/'),
    title,
    description: input.description,
    alternates: { canonical },
    robots: input.noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title,
      description: input.description,
      url: canonical,
      siteName: PUBLIC_SITE.name,
      locale: PUBLIC_SITE.locale,
      type: input.type ?? 'website',
      images: [
        {
          url: image,
          ...(input.image
            ? { width: input.image.width, height: input.image.height, alt: input.image.alt }
            : {}),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: input.description,
      images: [image],
    },
  };
}
