import type { Metadata } from "next";

import "@/lib/cms/collections";

import { Close } from "@/components/marketing/homepage/close";
import { Duality } from "@/components/marketing/homepage/duality";
import { Hero } from "@/components/marketing/homepage/hero";
import { Pillars } from "@/components/marketing/homepage/pillars";
import { Proof } from "@/components/marketing/homepage/proof";
import { TeamPreview, type TeamPreviewMember } from "@/components/marketing/homepage/team-preview";
import { JsonLd } from "@/components/seo/json-ld";
import { brandAssets } from "@/config/brand";
import { siteConfig } from "@/config/site";
import { findPublished, getHomepageContent, resolveCoverImage } from "@/lib/cms/public-content";
import { pageMetadata } from "@/lib/seo";
import { TeamMember, type TeamMemberDocument } from "@/models/team-member";

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

export const revalidate = 3600;

async function getTeamPreview(): Promise<TeamPreviewMember[]> {
  const docs = await findPublished<TeamMemberDocument>(TeamMember, {
    isCoreMember: true,
    profileVisible: true,
  });

  return Promise.all(
    docs.map(async (doc) => ({
      username: doc.username,
      name: doc.name,
      role: doc.role,
      photo: await resolveCoverImage(doc.photo ? String(doc.photo) : undefined),
    })),
  );
}

export default async function HomePage() {
  const [{ hero }, team] = await Promise.all([getHomepageContent(), getTeamPreview()]);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: siteConfig.name,
          url: siteConfig.url,
          description: siteConfig.description,
          logo: `${siteConfig.url}${brandAssets.appleTouchIcon}`,
        }}
      />
      <Hero />
      <Duality />
      <Proof item={hero} />
      <Pillars />
      <TeamPreview members={team} />
      <Close />
    </>
  );
}
