import { SpineLabel, SpineMarker } from "@/components/marketing/homepage/spine";
import { Reveal } from "@/components/marketing/reveal";
import { MediaImage } from "@/components/marketing/media-image";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";

export interface TeamPreviewMember {
  username: string;
  name: string;
  role: string;
  photo: { url: string; alt: string } | null;
}

/**
 * The team, as operators (`CREATIVE_DIRECTION.md` §13.1) — the Assembly
 * Line's last attached part: real, named people, labeled the way the rest
 * of the spine's parts are labeled, not a separate decorative card grid.
 * The `SpineMarker` surfacing on hover/focus is functional feedback ("this
 * person is a real attachment point on the system above," §7.2 rule 2's
 * spirit applied to people, not just facts), not decoration. Portraits are
 * today's real, unedited source photographs — §10's unified art direction
 * is separate production work, not a blocker for shipping real people with
 * real words over no team section at all.
 */
export function TeamPreview({ members }: { members: TeamPreviewMember[] }) {
  if (members.length === 0) return null;

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <Reveal>
          <SpineLabel>Team</SpineLabel>
        </Reveal>
        <div className="mt-10 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          {members.map((member, i) => (
            <Reveal key={member.username} delayMs={i * 60}>
              <Link
                href={`/team/${member.username}`}
                className="group block no-underline hover:no-underline"
              >
                <div className="bg-bg-light aspect-square w-full overflow-hidden rounded-sm">
                  {member.photo ? (
                    <MediaImage
                      src={member.photo.url}
                      alt={member.photo.alt}
                      width={320}
                      height={320}
                      className="h-full w-full object-cover grayscale-25 transition-[filter] duration-150 group-hover:grayscale-0"
                    />
                  ) : null}
                </div>
                <p className="text-body text-text mt-3 flex items-center gap-1.5 font-medium">
                  <SpineMarker className="text-accent-text opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100" />
                  {member.name}
                </p>
                <p className="text-caption text-text-muted mt-0.5 font-mono">{member.role}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
