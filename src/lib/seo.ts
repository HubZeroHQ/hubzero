import type { Metadata } from "next";

import { brandAssets } from "@/config/brand";
import { siteConfig } from "@/config/site";

/** JSON-LD has no `metadataBase`-style auto-resolution the way `Metadata` does — image/url values in a `<JsonLd>` block need an absolute URL supplied explicitly. */
export function absoluteUrl(path: string): string {
  return `${siteConfig.url}${path}`;
}

export interface PageMetadataInput {
  title: string;
  description: string;
  /** Site-relative path, e.g. "/work/acme-widget" — resolved against `metadataBase` (`app/layout.tsx`) for canonical + OpenGraph URLs. */
  path: string;
  image?: { url: string; alt?: string };
  type?: "website" | "article";
}

/**
 * The one place every page-type's metadata gets its canonical URL,
 * OpenGraph, and Twitter/X card from (`ARCHITECTURE/13_SEO_STRATEGY.md` §2) —
 * previously each page only set `title`/`description`, silently falling back
 * to the root layout's generic OG card for every dynamic/static page.
 */
export function pageMetadata({
  title,
  description,
  path,
  image,
  type = "website",
}: PageMetadataInput): Metadata {
  const ogImage = image?.url ?? brandAssets.ogImage;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      title,
      description,
      url: path,
      images: [{ url: ogImage, alt: image?.alt ?? siteConfig.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}
