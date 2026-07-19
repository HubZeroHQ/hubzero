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
  publishedTime?: string;
  authors?: Array<{ name: string; url?: string }>;
  feed?: boolean;
}): Metadata {
  const socialTitle = input.title ? `${input.title} — ${PUBLIC_SITE.name}` : PUBLIC_SITE.name;
  const canonical = canonicalUrl(input.path);
  const image = input.image?.url ?? canonicalUrl(PUBLIC_SITE.socialImage).toString();
  return {
    metadataBase: canonicalUrl('/'),
    // The root layout owns the `%s — HubZero` document-title template.
    // Supplying only the page title here prevents the site name being appended twice.
    ...(input.title ? { title: input.title } : {}),
    description: input.description,
    alternates: {
      canonical,
      ...(input.feed && PUBLIC_SITE.release.feed
        ? { types: { 'application/rss+xml': canonicalUrl('/feed.xml').toString() } }
        : {}),
    },
    robots: input.noIndex
      ? { index: false, follow: PUBLIC_SITE.release.live }
      : { index: true, follow: true },
    openGraph: {
      title: socialTitle,
      description: input.description,
      url: canonical,
      siteName: PUBLIC_SITE.name,
      locale: PUBLIC_SITE.locale,
      type: input.type ?? 'website',
      ...(input.type === 'article' && input.publishedTime
        ? { publishedTime: input.publishedTime }
        : {}),
      ...(input.type === 'article' && input.authors?.length
        ? { authors: input.authors.flatMap((author) => (author.url ? [author.url] : [])) }
        : {}),
      images: [
        input.image
          ? {
              url: image,
              width: input.image.width,
              height: input.image.height,
              alt: input.image.alt,
            }
          : {
              url: image,
              width: PUBLIC_SITE.socialImageWidth,
              height: PUBLIC_SITE.socialImageHeight,
              alt: PUBLIC_SITE.name,
            },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description: input.description,
      images: [image],
    },
  };
}
