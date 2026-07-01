import { env } from "@/lib/env";

/**
 * Company definition sourced from ARCHITECTURE/01_PRODUCT_VISION.md §2 —
 * keep in sync with that document, not the other way around.
 */
export const siteConfig = {
  name: "HubZero",
  title: "HubZero — Engineering Studio",
  description:
    "HubZero is a small, founder-led engineering studio building software and hardware-adjacent products for businesses that need both.",
  url: env.NEXT_PUBLIC_SITE_URL,
} as const;

export type SiteConfig = typeof siteConfig;
