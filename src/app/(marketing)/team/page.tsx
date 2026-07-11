import type { Metadata } from "next";
import Image from "next/image";

import "@/lib/cms/collections";

import { PageHeader } from "@/components/marketing/page-header";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { Link } from "@/components/ui/link";
import { findPublished, resolveCoverImage } from "@/lib/cms/public-content";
import { pageMetadata } from "@/lib/seo";
import { TeamMember, type TeamMemberDocument } from "@/models/team-member";

export const metadata: Metadata = pageMetadata({
  title: "Team",
  description: "The core people behind HubZero's engineering work.",
  path: "/team",
});

export const revalidate = 3600;

/**
 * `ARCHITECTURE/06_PAGE_SPECIFICATIONS.md` Team index — core members only
 * (`isCoreMember`), never a full roster, and only profiles a Head Admin has
 * explicitly marked `profileVisible`. Reads real `TeamMember` documents;
 * none exist yet (the About page's founder bios are hardcoded and
 * deliberately not migrated here — see that page's own note), so an empty
 * roster today is an honest starting state, not a bug.
 */
export default async function TeamIndexPage() {
  const members = await findPublished<TeamMemberDocument>(TeamMember, {
    isCoreMember: true,
    profileVisible: true,
  });

  const items = await Promise.all(
    members.map(async (doc) => ({
      username: doc.username,
      name: doc.name,
      role: doc.role,
      photo: await resolveCoverImage(doc.photo ? String(doc.photo) : undefined),
    })),
  );

  return (
    <div className="pt-16 pb-28 sm:pt-20 lg:pt-24">
      <Container>
        <PageHeader eyebrow="Team" headline="The people you'd actually be working with." />
      </Container>

      <Container className="mt-16 lg:mt-20">
        {items.length === 0 ? (
          <EmptyState
            title="Team profiles are coming soon"
            description="Core team profiles will show up here once they're published — see the About page for who leads HubZero today."
          />
        ) : (
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((member) => (
              <Link
                key={member.username}
                href={`/team/${member.username}`}
                className="no-underline hover:no-underline"
              >
                <div className="size-20 shrink-0 overflow-hidden rounded-sm">
                  {member.photo ? (
                    <Image
                      src={member.photo.url}
                      alt={member.photo.alt}
                      width={160}
                      height={160}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="bg-bg-light h-full w-full" aria-hidden="true" />
                  )}
                </div>
                <h2 className="text-h3 text-text mt-4 font-normal">{member.name}</h2>
                <p className="text-caption text-text-muted mt-1 font-mono">{member.role}</p>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
