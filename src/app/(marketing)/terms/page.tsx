import type { Metadata } from "next";

import { ContentRenderer } from "@/components/marketing/blocks/content-renderer";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { getLegalPageContent } from "@/lib/cms/public-content";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  title: "Terms of Service",
  description: "The terms governing use of HubZero's site and services.",
  path: "/terms",
});

/**
 * Authored in Studio (Settings → Legal pages), not hardcoded — the same
 * `Block[]`/`<ContentRenderer>` pipeline every narrative collection's detail
 * page uses, reused rather than a second "simple legal page" system.
 */
export default async function TermsPage() {
  const blocks = await getLegalPageContent("terms");

  return (
    <div className="pb-28 sm:pb-32 lg:pb-40">
      <div className="pt-20 pb-16 sm:pt-24 lg:pt-28">
        <Container>
          <p className="text-caption text-text-muted font-mono tracking-wide uppercase">Legal</p>
          <h1 className="text-text mt-6 max-w-2xl text-[clamp(2.25rem,1rem+4.5vw,4.5rem)] leading-[1.08] font-normal tracking-tight">
            Terms of Service
          </h1>
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
