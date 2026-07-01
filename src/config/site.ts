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
  /**
   * No verified org-level email/social accounts exist yet (only personal
   * team-member accounts, which aren't appropriate to publish as the
   * company's own). Per `03_INFORMATION_ARCHITECTURE.md` §3 — "social icons
   * link to real, maintained accounts or are omitted" — Footer renders a
   * Connect link only when its value here is non-null. Fill these in before
   * launch rather than pointing them at a placeholder.
   */
  links: {
    email: null as string | null,
    linkedin: null as string | null,
    github: null as string | null,
  },
} as const;

export type SiteConfig = typeof siteConfig;
