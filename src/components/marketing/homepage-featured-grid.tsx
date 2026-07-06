import { ArrowUpRight } from "lucide-react";

import {
  CardTags,
  ContributorAvatars,
  FeaturedBadge,
  ReadingTimeLabel,
} from "@/components/marketing/card-meta";
import { MediaImage } from "@/components/marketing/media-image";
import { Reveal } from "@/components/marketing/reveal";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { HOMEPAGE_RESOURCE_LABELS } from "@/lib/cms/homepage-resources";
import type { HomepageContentItem } from "@/lib/cms/public-content";
import { cn } from "@/lib/utils";

/**
 * The rest of the homepage's curated content — every configured, visible
 * item beyond the one marked hero (`lib/cms/public-content.ts`'s
 * `getHomepageContent`, `<HomepageHero>`). Generic across every
 * homepage-featurable collection: a card renders identically whether it's a
 * Case Study, Build, Labs Project, Blueprint, or Note, with only the small
 * eyebrow label naming which. Renders nothing if there's nothing configured
 * beyond the hero — an honest empty state, not a section with nothing in it.
 */
export function HomepageFeaturedGrid({ items }: { items: HomepageContentItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="pb-28 sm:pb-36 lg:pb-44">
      <Container>
        <Reveal>
          <p className="text-caption text-text-muted font-mono tracking-wide uppercase">
            More from HubZero
          </p>
        </Reveal>

        <div className="divide-border-muted mt-10 divide-y">
          {items.map((item, index) => (
            <Reveal key={`${item.resource}-${item.title}-${index}`} delayMs={index * 60}>
              <Content item={item} />
            </Reveal>
          ))}
        </div>
      </Container>
    </div>
  );
}

function Content({ item }: { item: HomepageContentItem }) {
  const className = cn(
    "group grid grid-cols-1 gap-6 py-10 sm:grid-cols-12 sm:gap-8 lg:py-12",
    item.href && "no-underline hover:no-underline",
  );

  const children = (
    <>
      <div className="sm:order-2 sm:col-span-5">
        {item.cover ? (
          <MediaImage
            src={item.cover.url}
            alt={item.cover.alt}
            width={item.cover.width ?? 1200}
            height={item.cover.height ?? 800}
            sizes="(min-width: 640px) 40vw, 92vw"
            className={cn(
              "h-auto w-full transition-opacity duration-150",
              item.href && "group-hover:opacity-90",
            )}
          />
        ) : (
          <div className="bg-bg-light aspect-video w-full" aria-hidden="true" />
        )}
      </div>
      <div className="flex flex-col justify-center sm:order-1 sm:col-span-7">
        <div className="flex items-center gap-3">
          <p className="text-caption text-text-muted font-mono tracking-wide uppercase">
            {HOMEPAGE_RESOURCE_LABELS[item.resource]}
          </p>
          {item.featured && <FeaturedBadge />}
        </div>
        <h3 className="text-h3 text-text mt-3 font-normal">{item.title}</h3>
        <p className="text-body text-text-muted mt-3 max-w-md">{item.summary}</p>
        <CardTags tags={item.techTags} />
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
          {item.href && (
            <span className="text-text inline-flex items-center gap-1.5">
              Read more
              <ArrowUpRight
                className="size-4 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden="true"
              />
            </span>
          )}
          <span className="text-caption text-text-muted">
            <ReadingTimeLabel minutes={item.readingTimeMinutes} />
          </span>
          <ContributorAvatars members={item.contributors} />
        </div>
      </div>
    </>
  );

  if (item.href) {
    return (
      <Link href={item.href} className={className}>
        {children}
      </Link>
    );
  }
  return <div className={className}>{children}</div>;
}
