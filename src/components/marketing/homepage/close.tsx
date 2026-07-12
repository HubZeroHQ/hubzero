import { Mark } from "@/components/brand/mark";
import { Reveal } from "@/components/marketing/reveal";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { primaryCta } from "@/config/nav";

/**
 * Resolution (`CREATIVE_DIRECTION.md` §13.1) — the spine comes to rest. The
 * page arrived dense and leaves quiet, on purpose (§7.1, §7.2 rule 4): no
 * repeated pitch, no second device, just what happens when someone actually
 * reaches out. The small static mark below the headline mirrors the hero's
 * rest state (`hero.tsx`) — the same object at the start and the end of the
 * scroll, closing the line it opened.
 */
export function Close() {
  return (
    <section className="py-20 sm:py-24">
      <Container size="prose" className="text-center">
        <Reveal>
          <Mark className="text-text-muted mx-auto mb-6 size-6" />
          <h2 className="text-h2 text-text font-semibold text-balance">
            Every project starts with a real conversation, not a form that disappears into a queue.
          </h2>
          <p className="text-body text-text-muted mt-4">
            Tell us what you&apos;re building. We&apos;ll ask real questions before quoting
            anything.
          </p>
          <Link
            href={primaryCta.href}
            className="bg-accent text-accent-foreground text-body mt-8 inline-flex items-center rounded-full px-6 py-3 font-medium no-underline hover:no-underline hover:opacity-90"
          >
            {primaryCta.label}
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}
