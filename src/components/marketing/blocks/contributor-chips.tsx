import Image from "next/image";

import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import type { PublicTeamMember } from "@/lib/cms/public-content";

export interface ContributorChipsProps {
  members: PublicTeamMember[];
  label?: string;
}

/**
 * "Worked on this project" — real `TeamMember` chips linking to
 * `/team/[username]`, replacing free-text credit lines
 * (`ARCHITECTURE/20_CONTENT_BLOCKS.md` §4). Renders nothing if every
 * contributor turned out to be unpublished/hidden (`getPublicTeamMembers`
 * already filters those out) rather than showing an empty "Team" heading.
 */
export function ContributorChips({ members, label = "Team" }: ContributorChipsProps) {
  if (members.length === 0) return null;

  return (
    <Container size="prose">
      <p className="text-caption text-text-muted font-mono tracking-wide uppercase">{label}</p>
      <div className="mt-4 flex flex-wrap gap-4">
        {members.map((member) => (
          <Link
            key={member.id}
            href={`/team/${member.username}`}
            tone="default"
            className="border-border-muted hover:border-accent flex items-center gap-3 rounded-full border py-1.5 pr-4 pl-1.5 no-underline hover:no-underline"
          >
            <span className="bg-bg-light relative size-8 shrink-0 overflow-hidden rounded-full">
              {member.photo && (
                <Image src={member.photo.url} alt="" fill sizes="32px" className="object-cover" />
              )}
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-caption text-text font-medium">{member.name}</span>
              <span className="text-caption text-text-muted">{member.role}</span>
            </span>
          </Link>
        ))}
      </div>
    </Container>
  );
}
