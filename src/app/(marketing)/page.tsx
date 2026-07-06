import type { Metadata } from "next";

import { CtaClose } from "@/components/marketing/cta-close";
import { HeroSection } from "@/components/marketing/hero-section";
import { HomepageFeaturedGrid } from "@/components/marketing/homepage-featured-grid";
import { HomepageHero } from "@/components/marketing/homepage-hero";
import { HowWeWork } from "@/components/marketing/how-we-work";
import { WhatWeDo } from "@/components/marketing/what-we-do";
import { JsonLd } from "@/components/seo/json-ld";
import { brandAssets } from "@/config/brand";
import { siteConfig } from "@/config/site";
import { getHomepageContent } from "@/lib/cms/public-content";
import { pageMetadata } from "@/lib/seo";

// `siteConfig.title` is already `"HubZero — [positioning line]"`
// (`ARCHITECTURE/13_SEO_STRATEGY.md` §2's exact Home pattern), so the root
// layout's default title *is* the correct Home title — this override exists
// only to add the canonical URL, OG image, and Twitter card the layout's
// generic metadata doesn't set per-page.
export const metadata: Metadata = pageMetadata({
  title: siteConfig.title,
  description: siteConfig.description,
  path: "/",
});

export default async function HomePage() {
  const { hero, items } = await getHomepageContent();

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: siteConfig.name,
          url: siteConfig.url,
          description: siteConfig.description,
          logo: `${siteConfig.url}${brandAssets.icon}`,
        }}
      />
      <HeroSection />
      <WhatWeDo />
      {hero && <HomepageHero item={hero} />}
      <HomepageFeaturedGrid items={items} />
      <HowWeWork />
      <CtaClose />
    </>
  );
}
