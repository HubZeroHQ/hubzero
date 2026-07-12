import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

/** `/studio` excluded — the CMS/admin panel, never meant to be crawled or indexed (`ARCHITECTURE/13_SEO_STRATEGY.md` §3). */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/studio",
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
