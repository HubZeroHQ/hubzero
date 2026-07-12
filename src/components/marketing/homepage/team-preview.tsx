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
 * The team, briefly (`CREATIVE_DIRECTION.md` §13.1) — real, named people
 * standing behind everything above, without repeating the full Team page
 * here. Portraits are today's real, unedited source photographs — §10's
 * unified art direction is separate production work (§14 priority 6), not
 * a blocker for shipping real people with real words over no team section
 * at all.
 */
export function TeamPreview({ members }: { members: TeamPreviewMember[] }) {
  if (members.length === 0) return null;

  return (
    <section className="py-24 sm:py-28">
      <Container>
        <Reveal>
          <p className="text-caption text-text-muted font-mono tracking-widest uppercase">Team</p>
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
                      className="h-full w-full object-cover grayscale-25 transition-[filter] duration-300 group-hover:grayscale-0"
                    />
                  ) : null}
                </div>
                <p className="text-body text-text mt-3 font-medium">{member.name}</p>
                <p className="text-caption text-text-muted mt-0.5 font-mono">{member.role}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
