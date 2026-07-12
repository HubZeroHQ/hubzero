import { Reveal } from "@/components/marketing/reveal";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { cn } from "@/lib/utils";

interface Pillar {
  name: string;
  description: string;
  href: string | null;
  status: string;
}

const pillars: Pillar[] = [
  {
    name: "Work",
    description: "Client engagements, delivered — real evidence, not a portfolio of intentions.",
    href: "/work",
    status: "Live",
  },
  {
    name: "Labs",
    description:
      "Research and experimentation — hardware, software, AI — shown honestly in progress.",
    href: "/labs",
    status: "Live",
  },
  {
    name: "Blueprints",
    description:
      "Reusable, production-ready engineering foundations — proof of range, not a template store.",
    href: null,
    status: "In progress",
  },
  {
    name: "Builds",
    description: "Products HubZero owns and ships itself, not delivered to a client.",
    href: null,
    status: "In progress",
  },
];

/**
 * The pillars, as an index, not a pitch (`CREATIVE_DIRECTION.md` §13.1).
 * Brisk and quiet after Proof's long exhale (§7.1) — a confident company's
 * table of contents. Blueprints and Builds render as real, honestly-labeled
 * pillars with no link yet rather than being hidden — `.hubzero/polish/
 * PRODUCT_POLISH.md` forbids a "coming soon" *page*, not an honest
 * "in progress" state on an index that's telling the truth about a real
 * four-pillar structure.
 */
export function Pillars() {
  return (
    <section className="py-24 sm:py-28">
      <Container>
        <Reveal>
          <p className="text-caption text-text-muted font-mono tracking-widest uppercase">
            How HubZero is organized
          </p>
        </Reveal>
        <div className="mt-10 grid gap-px sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar, i) => {
            const content = (
              <div className="border-border-muted flex h-full flex-col border p-6">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-h3 text-text font-semibold">{pillar.name}</h3>
                  <span
                    className={cn(
                      "text-caption font-mono whitespace-nowrap",
                      pillar.href ? "text-text-muted" : "text-text-muted/70",
                    )}
                  >
                    {pillar.status}
                  </span>
                </div>
                <p className="text-caption text-text-muted mt-3">{pillar.description}</p>
              </div>
            );

            return (
              <Reveal key={pillar.name} delayMs={i * 60}>
                {pillar.href ? (
                  <Link href={pillar.href} className="block h-full no-underline hover:no-underline">
                    {content}
                  </Link>
                ) : (
                  content
                )}
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
