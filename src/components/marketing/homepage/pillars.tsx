import { SpineLabel } from "@/components/marketing/homepage/spine";
import { Reveal } from "@/components/marketing/reveal";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";

export interface LabsPreview {
  title: string;
  summary: string;
  href: string;
  techTags: string[];
}

/**
 * Labs, honestly smaller (`CREATIVE_DIRECTION.md` §13.1, §13.4). No image
 * exists for the one real Labs entry, so it doesn't compete with Proof for
 * space — a deliberately modest footprint, plainly labeled "in progress,"
 * rather than forced into a device-frame it hasn't earned. Blueprints and
 * Builds are named honestly (they're real, structural parts of how HubZero
 * is organized) but not linked — neither has a real published entry yet
 * (`src/config/nav.ts`'s own content-gating rule keeps them out of primary
 * nav for the same reason), so pointing to them here would be a link to
 * nothing, which `.hubzero/polish/PRODUCT_POLISH.md` already forbids.
 */
export function Pillars({ labs }: { labs: LabsPreview | null }) {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <Reveal>
          <SpineLabel>Labs</SpineLabel>
        </Reveal>
        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:items-start">
          <Reveal>
            <h2 className="text-h2 text-text font-semibold text-balance">
              {labs ? labs.title : "Research and experimentation"}
            </h2>
            {labs && (
              <>
                <p className="text-body text-text-muted mt-4 max-w-md text-balance">
                  {labs.summary}
                </p>
                {labs.techTags.length > 0 && (
                  <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2" role="list">
                    {labs.techTags.map((tag) => (
                      <li key={tag} className="text-caption text-text-muted font-mono">
                        {tag}
                      </li>
                    ))}
                  </ul>
                )}
                <Link
                  href={labs.href}
                  className="text-body text-text mt-6 inline-flex items-center gap-2 font-medium no-underline hover:underline"
                >
                  See it built, end to end
                  <span aria-hidden="true">→</span>
                </Link>
              </>
            )}
          </Reveal>

          <Reveal delayMs={100}>
            <div className="border-border-muted bg-bg-light flex items-center gap-2.5 rounded-md border px-4 py-3">
              <span className="bg-accent size-1.5 shrink-0 rounded-full" aria-hidden="true" />
              <span className="text-caption text-text-muted font-mono tracking-wide uppercase">
                Active — internal R&amp;D, no client involved
              </span>
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <span className="text-caption text-text-muted font-mono tracking-widest uppercase">
                Also underway
              </span>
              <div className="flex items-center gap-2.5">
                <span
                  className="bg-text-muted/50 size-1.5 shrink-0 rounded-full"
                  aria-hidden="true"
                />
                <span className="text-caption text-text-muted">
                  Blueprints — reusable engineering foundations, in development
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span
                  className="bg-text-muted/50 size-1.5 shrink-0 rounded-full"
                  aria-hidden="true"
                />
                <span className="text-caption text-text-muted">
                  Builds — products we own and ship ourselves, in development
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
