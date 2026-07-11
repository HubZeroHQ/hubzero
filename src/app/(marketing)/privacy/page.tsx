import type { Metadata } from "next";

import { ContentRenderer } from "@/components/marketing/blocks/content-renderer";
import { PageHeader } from "@/components/marketing/page-header";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { getLegalPageContent } from "@/lib/cms/public-content";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description: "How HubZero collects, uses, and protects your information.",
  path: "/privacy",
});

/**
 * Authored in Studio (Settings → Legal pages), not hardcoded — the same
 * `Block[]`/`<ContentRenderer>` pipeline every narrative collection's detail
 * page uses, reused rather than a second "simple legal page" system.
 */
export default async function PrivacyPage() {
  const blocks = await getLegalPageContent("privacy");

  return (
    <div className="pb-28 sm:pb-32 lg:pb-40">
      <div className="pt-20 pb-16 sm:pt-24 lg:pt-28">
        <Container>
          <PageHeader eyebrow="Legal" headline="Privacy Policy" size="large" />
        </Container>
      </div>

      {blocks.length > 0 ? (
        <ContentRenderer blocks={blocks} />
      ) : (
        <Container>
          <EmptyState
            title="Coming soon"
            description="This page hasn't been published yet — check back soon, or get in touch if you have a question in the meantime."
          />
        </Container>
      )}
    </div>
  );
}
