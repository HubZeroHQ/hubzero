import type { Metadata } from "next";

import "@/lib/cms/collections";

import { ArchitectureDetail } from "@/components/marketing/homepage/architecture-detail";
import { Close } from "@/components/marketing/homepage/close";
import { Hero } from "@/components/marketing/homepage/hero";
import { Pillars, type LabsPreview } from "@/components/marketing/homepage/pillars";
import { Proof } from "@/components/marketing/homepage/proof";
import { SpineRoot } from "@/components/marketing/homepage/spine";
import { TeamPreview, type TeamPreviewMember } from "@/components/marketing/homepage/team-preview";
import { JsonLd } from "@/components/seo/json-ld";
import { brandAssets } from "@/config/brand";
import { siteConfig } from "@/config/site";
import { findPublished, getHomepageContent, resolveCoverImage } from "@/lib/cms/public-content";
import { pageMetadata } from "@/lib/seo";
import { LabsProject, type LabsProjectDocument } from "@/models/labs-project";
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

/** The one real Labs entry (`CREATIVE_DIRECTION.md` §13.1's "Labs, honestly smaller") — most recently published, whichever that is, rather than a hardcoded slug. */
async function getFeaturedLabsProject(): Promise<LabsPreview | null> {
  const docs = await findPublished<LabsProjectDocument>(LabsProject);
  const doc = docs[0];
  if (!doc) return null;

  return {
    title: doc.title,
    summary: doc.summary,
    href: `/labs/${doc.slug}`,
    techTags: doc.techTags,
  };
}

export default async function HomePage() {
  const [{ hero }, team, labs] = await Promise.all([
    getHomepageContent(),
    getTeamPreview(),
    getFeaturedLabsProject(),
  ]);

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
      <SpineRoot>
        <ArchitectureDetail />
        <Proof item={hero} />
        <Pillars labs={labs} />
        <TeamPreview members={team} />
      </SpineRoot>
      <Close />
    </>
  );
}
