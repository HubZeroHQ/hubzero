import { ArrowUpRight } from "lucide-react";

import { CardTags, ContributorAvatars, ReadingTimeLabel } from "@/components/marketing/card-meta";
import { MediaImage } from "@/components/marketing/media-image";
import { Reveal } from "@/components/marketing/reveal";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { HOMEPAGE_RESOURCE_LABELS } from "@/lib/cms/homepage-resources";
import type { HomepageContentItem } from "@/lib/cms/public-content";

/**
 * The homepage's trust climax (`ARCHITECTURE/15_HOMEPAGE_DESIGN.md` §7/§9):
 * one real piece of work, presented editorially. Generic across every
 * homepage-featurable collection (`lib/cms/homepage-resources.ts`) — the
 * founder marks any one configured item as hero
 * (`lib/cms/public-content.ts`'s `getHomepageContent`), and this component
 * renders whichever `HomepageContentItem` that resolves to, never a
 * collection-specific fork. `item.href` is `null` for a collection with no
 * public detail route yet (e.g. Build today) — the CTA is omitted rather
 * than pointing at a broken link.
 */
export function HomepageHero({ item }: { item: HomepageContentItem }) {
  return (
    <div className="pt-32 pb-28 sm:pt-40 sm:pb-36 lg:pt-52 lg:pb-44">
      <Container>
        <Reveal>
          <p className="text-caption text-text-muted font-mono tracking-wide uppercase">
            Featured {HOMEPAGE_RESOURCE_LABELS[item.resource].toLowerCase()}
          </p>
        </Reveal>
        <Reveal delayMs={60}>
          <h2 className="text-text mt-4 text-[clamp(2rem,1rem+4vw,4rem)] leading-[1.1] font-normal tracking-tight">
            {item.title}
          </h2>
        </Reveal>
      </Container>

      {item.cover && (
        <Reveal delayMs={120}>
          <Container className="mt-14 sm:mt-16 lg:mt-20">
            {/* Asymmetric placement, not centered — the image runs toward the
                right edge of the same content grid the text above/below uses.
                Anchored to the bounded marketing Container (not the bare
                viewport, per the anchoring rule in ARCHITECTURE/16 §10) so
                the offset holds steady at every width. */}
            <div className="ml-auto w-full max-w-5xl">
              <MediaImage
                src={item.cover.url}
                alt={item.cover.alt}
                width={item.cover.width ?? 2557}
                height={item.cover.height ?? 1270}
                sizes="(min-width: 1024px) 64rem, 92vw"
                className="h-auto w-full"
                priority
              />
            </div>
          </Container>
        </Reveal>
      )}

      <Container className="mt-16 sm:mt-20 lg:mt-24">
        <div className="max-w-[var(--content-prose)]">
          <Reveal>
            <p className="text-h3 text-text font-serif">{item.summary}</p>
          </Reveal>

          <Reveal delayMs={100}>
            <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2">
              <CardTags tags={item.techTags} />
              <span className="text-caption text-text-muted">
                <ReadingTimeLabel minutes={item.readingTimeMinutes} />
              </span>
              <ContributorAvatars members={item.contributors} />
            </div>
          </Reveal>

          {item.href && (
            <Reveal delayMs={140}>
              <Link
                href={item.href}
                className="text-text mt-10 inline-flex items-center gap-1.5 no-underline hover:no-underline hover:opacity-80"
              >
                Read more
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
            </Reveal>
          )}
        </div>
      </Container>
    </div>
  );
}
