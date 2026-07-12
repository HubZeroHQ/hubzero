import type { Metadata } from "next";

import "@/lib/cms/collections";

import { PageHeader } from "@/components/marketing/page-header";
import { RichText } from "@/components/marketing/rich-text";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { Link } from "@/components/ui/link";
import { findPublished } from "@/lib/cms/public-content";
import { pageMetadata } from "@/lib/seo";
import { CareerListing, type CareerListingDocument } from "@/models/career-listing";

export const metadata: Metadata = pageMetadata({
  title: "Careers",
  description: "Open roles at HubZero.",
  path: "/careers",
});

/**
 * `ARCHITECTURE/06_PAGE_SPECIFICATIONS.md` Careers — "open roles (CMS-managed,
 * can be empty)." Deliberately scoped to what's real and buildable here: the
 * listings themselves and how to apply. The spec's broader "what it's like
 * to work at HubZero" culture narrative is real editorial/brand-voice
 * writing this engineering pass doesn't invent on the founder's behalf — an
 * honest gap, not silently skipped.
 */
export default async function CareersPage() {
  const listings = await findPublished<CareerListingDocument>(CareerListing, {
    listingStatus: "open",
  });

  return (
    <div className="pt-16 pb-28 sm:pt-20 lg:pt-24">
      <Container>
        <PageHeader eyebrow="Careers" headline="Open roles at HubZero.">
          <p className="text-body text-text-muted mt-6 max-w-xl">
            Meet the team on the{" "}
            <Link href="/team" className="text-text underline underline-offset-2">
              Team page
            </Link>
            . To apply, or to ask about a role that isn&apos;t listed, reach out directly.
          </p>
        </PageHeader>
      </Container>

      <Container className="mt-16 lg:mt-20">
        {listings.length === 0 ? (
          <EmptyState
            title="No open roles right now"
            description="Nothing is open at the moment — check back, or get in touch if you think you'd be a fit anyway."
          />
        ) : (
          <div className="divide-border-muted divide-y">
            {listings.map((listing) => (
              <div key={listing._id.toString()} className="py-12 first:pt-0">
                <h2 className="text-h2 text-text font-normal">{listing.title}</h2>
                <div className="mt-5 max-w-[var(--content-prose)]">
                  <RichText>{listing.description}</RichText>
                </div>
                {listing.requirements.length > 0 && (
                  <ul className="text-body text-text-muted mt-5 list-disc space-y-2 pl-5">
                    {listing.requirements.map((requirement) => (
                      <li key={requirement}>{requirement}</li>
                    ))}
                  </ul>
                )}
                <Link href="/contact" className="text-text mt-6 inline-block">
                  Apply →
                </Link>
              </div>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
