import { Reveal } from "@/components/marketing/reveal";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { primaryCta } from "@/config/nav";

/**
 * Close (`CREATIVE_DIRECTION.md` §13.1) — a short, warm landing after a
 * page that has done a lot. The page arrived loud and leaves quiet, on
 * purpose (§7.1): no repeated pitch, just what happens when someone
 * actually reaches out.
 */
export function Close() {
  return (
    <section className="py-24 sm:py-32">
      <Container size="prose" className="text-center">
        <Reveal>
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
