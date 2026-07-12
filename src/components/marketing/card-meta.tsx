import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import type { PublicTeamMember } from "@/lib/cms/public-content";

/**
 * Small, shared building blocks every browsing card (`WorkGrid`/`LabsGrid`/
 * `BlueprintsGrid`/Notes' list) composes into its own layout — kept as
 * atoms rather than one shared `<Card>` so each collection stays visually
 * distinct while still drawing from one design system, per
 * `ARCHITECTURE/20_CONTENT_BLOCKS.md` §5's card-metadata additions
 * (`featured`/`readingTimeMinutes`/`contributors`/tags) finally having
 * somewhere to render.
 */

export function ReadingTimeLabel({ minutes }: { minutes: number }) {
  return <span>{minutes} min read</span>;
}

export function FeaturedBadge() {
  return <Badge tone="accent">Featured</Badge>;
}

/** The `techTags`/`techStack`/`tags` join, matching the mono-caption convention detail pages already use for the same data. */
export function CardTags({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;
  return <p className="text-caption text-text-muted font-mono">{tags.join(" · ")}</p>;
}

/**
 * A compact, overlapping-avatar stack for a card's tight footprint — the
 * counterpart to `blocks/contributor-chips.tsx`'s full detail-page chips,
 * which are too large (32px photo + two-line name/role) to fit inside a
 * list row. Reuses the same `PublicTeamMember` shape/visibility filtering
 * (`getPublicTeamMembers`), just rendered smaller and without a heading.
 */
export function ContributorAvatars({
  members,
  max = 4,
}: {
  members: PublicTeamMember[];
  max?: number;
}) {
  if (members.length === 0) return null;
  const shown = members.slice(0, max);
  const overflow = members.length - shown.length;

  return (
    <div
      className="flex items-center -space-x-2"
      aria-label={`Contributors: ${members.map((m) => m.name).join(", ")}`}
    >
      {shown.map((member) => (
        <span
          key={member.id}
          title={member.name}
          className="border-bg bg-bg-light relative size-6 shrink-0 overflow-hidden rounded-full border-2"
        >
          {member.photo && (
            <Image src={member.photo.url} alt="" fill sizes="24px" className="object-cover" />
          )}
        </span>
      ))}
      {overflow > 0 && (
        <span
          className="border-bg bg-bg-light text-text-muted relative flex size-6 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-medium"
          aria-hidden="true"
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}
