import { Reveal } from "@/components/marketing/reveal";
import { MediaImage } from "@/components/marketing/media-image";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import type { HomepageContentItem } from "@/lib/cms/public-content";

/**
 * Proof (`CREATIVE_DIRECTION.md` §13.1) — the one real case study, given
 * full weight. The tallest, quietest beat on the page (§7.1): after The
 * Assembly's/duality section's spike of energy, this is the long calm
 * exhale, because it's the only claim on the homepage a visitor can
 * independently verify. Renders nothing if no published case study exists
 * yet — an honest gap, not a placeholder.
 */
export function Proof({ item }: { item: HomepageContentItem | null }) {
  if (!item) return null;

  return (
    <section className="py-24 sm:py-32">
      <Container>
        <Reveal>
          <p className="text-caption text-text-muted font-mono tracking-widest uppercase">Proof</p>
        </Reveal>
        <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <Reveal>
            {item.cover ? (
              <MediaImage
                src={item.cover.url}
                alt={item.cover.alt}
                width={item.cover.width ?? 1200}
                height={item.cover.height ?? 900}
                className="border-border-muted w-full rounded-sm border object-cover"
              />
            ) : (
              <div className="bg-bg-light border-border-muted aspect-[4/3] w-full rounded-sm border" />
            )}
          </Reveal>
          <Reveal delayMs={100}>
            <h2 className="text-h1 text-text font-semibold text-balance">{item.title}</h2>
            <p className="text-body text-text-muted mt-4 max-w-md">{item.summary}</p>
            {item.techTags.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-2" role="list">
                {item.techTags.map((tag) => (
                  <li key={tag} className="text-caption text-text-muted font-mono">
                    {tag}
                  </li>
                ))}
              </ul>
            )}
            {item.href && (
              <Link
                href={item.href}
                className="text-body text-text mt-8 inline-flex items-center gap-2 font-medium no-underline hover:underline"
              >
                Read the case study
                <span aria-hidden="true">→</span>
              </Link>
            )}
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
