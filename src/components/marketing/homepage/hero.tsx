import { Mark } from "@/components/brand/mark";
import { Link } from "@/components/ui/link";
import { primaryCta } from "@/config/nav";

/**
 * Homepage opening (`CREATIVE_DIRECTION.md` §13.1, revised 2026-07-13). No
 * animated intermission before the real page starts — the mark sits at
 * rest and the headline resolves in the same moment, per the founder's
 * standing rule that motion has to justify itself on usability first
 * (§4, §8). What used to be a two-second performance (`first-run.tsx`,
 * removed) is now just the page's rest state, at the top of the spine
 * (`spine.tsx`) the rest of the homepage's real content attaches to.
 */
export function Hero() {
  return (
    <section className="flex min-h-[70dvh] flex-col items-center justify-center px-6 pt-20 pb-16 text-center">
      <Mark className="text-text mb-8 size-10" />
      <div className="max-w-3xl">
        <h1 className="text-display text-text font-semibold text-balance">
          Building technology that solves real problems.
        </h1>
        <p className="text-body text-text-muted mx-auto mt-6 max-w-xl text-balance">
          HubZero is a small, founder-led engineering studio building software and hardware for
          businesses that need both — one team, taken from an unfamiliar problem to a shipped,
          maintained system.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href={primaryCta.href}
            className="bg-accent text-accent-foreground text-body rounded-full px-6 py-3 font-medium no-underline hover:no-underline hover:opacity-90"
          >
            {primaryCta.label}
          </Link>
          <Link
            href="/work"
            tone="muted"
            className="text-body font-medium no-underline hover:no-underline"
          >
            See the work
          </Link>
        </div>
      </div>
    </section>
  );
}
