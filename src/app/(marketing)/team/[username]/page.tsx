import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import "@/lib/cms/collections";

import { JsonLd } from "@/components/seo/json-ld";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { findOnePublished, findPublished, resolveCoverImage } from "@/lib/cms/public-content";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import { TeamMember, type TeamMemberDocument } from "@/models/team-member";

interface TeamMemberPageProps {
  params: Promise<{ username: string }>;
}

export const revalidate = 3600;

async function getTeamMember(username: string) {
  return findOnePublished<TeamMemberDocument>(TeamMember, {
    username,
    profileVisible: true,
  });
}

export async function generateStaticParams() {
  const teamMembers = await findPublished<TeamMemberDocument>(TeamMember, { profileVisible: true });
  return teamMembers.map((doc) => ({ username: doc.username }));
}

export async function generateMetadata({ params }: TeamMemberPageProps): Promise<Metadata> {
  const { username } = await params;
  const doc = await getTeamMember(username);
  if (!doc) return {};
  const photo = await resolveCoverImage(doc.photo ? String(doc.photo) : undefined);
  return pageMetadata({
    title: doc.name,
    description: doc.bio.slice(0, 200),
    path: `/team/${doc.username}`,
    image: photo ? { url: photo.url, alt: photo.alt } : undefined,
  });
}

/**
 * `ARCHITECTURE/06_PAGE_SPECIFICATIONS.md` Team detail — simplified bio,
 * role, skills, and contact/social links (deliberately no "2-3 featured
 * projects" section: `TeamMember` has no schema field linking a profile to
 * specific `CaseStudy`/`Build`/`Note` documents yet, and fabricating that
 * list rather than modeling it isn't this phase's call to make).
 */
export default async function TeamMemberPage({ params }: TeamMemberPageProps) {
  const { username } = await params;
  const doc = await getTeamMember(username);
  if (!doc) notFound();

  const photo = await resolveCoverImage(doc.photo ? String(doc.photo) : undefined);
  const sameAs = [doc.socials.linkedin, doc.socials.github].filter((value): value is string =>
    Boolean(value),
  );

  return (
    <div className="pt-20 pb-32 sm:pt-24 lg:pt-28">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: doc.name,
          jobTitle: doc.role,
          description: doc.bio.slice(0, 200),
          ...(photo ? { image: absoluteUrl(photo.url) } : {}),
          ...(sameAs.length > 0 ? { sameAs } : {}),
        }}
      />
      <Container>
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
          <div className="size-24 shrink-0 overflow-hidden rounded-sm sm:size-32">
            {photo ? (
              <Image
                src={photo.url}
                alt={photo.alt}
                width={256}
                height={256}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="bg-bg-light h-full w-full" aria-hidden="true" />
            )}
          </div>
          <div>
            <h1 className="text-text text-[clamp(2rem,1rem+4vw,3.5rem)] leading-[1.1] font-normal tracking-tight">
              {doc.name}
            </h1>
            <p className="text-caption text-text-muted mt-2 font-mono">{doc.role}</p>
            {/* Plain labeled text links, matching the site's existing
                Footer social-link convention — no brand-icon set is
                available in this project's lucide-react version. */}
            <div className="text-caption mt-4 flex items-center gap-4">
              <a href={`mailto:${doc.socials.email}`} className="text-text-muted hover:text-text">
                Email
              </a>
              {doc.socials.github && (
                <a href={doc.socials.github} className="text-text-muted hover:text-text">
                  GitHub
                </a>
              )}
              {doc.socials.linkedin && (
                <a href={doc.socials.linkedin} className="text-text-muted hover:text-text">
                  LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>

        <p className="text-body text-text-muted mt-10 max-w-[var(--content-prose)]">{doc.bio}</p>

        {doc.skills.length > 0 && (
          <div className="mt-12 max-w-[var(--content-prose)] space-y-6">
            <h2 className="text-h3 text-text font-normal">Skills</h2>
            {doc.skills.map((group) => (
              <div key={group.category}>
                <p className="text-caption text-text-muted font-mono tracking-wide uppercase">
                  {group.category}
                </p>
                <p className="text-body text-text-muted mt-2">{group.items.join(", ")}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-16">
          <Link href="/team">← Back to team</Link>
        </div>
      </Container>
    </div>
  );
}
