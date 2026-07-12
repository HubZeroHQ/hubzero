"use client";

import Image from "next/image";
import { useState } from "react";

import { SpineLabel } from "@/components/marketing/homepage/spine";
import { Reveal } from "@/components/marketing/reveal";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import type { HomepageContentItem } from "@/lib/cms/public-content";
import { cn } from "@/lib/utils";

interface Screen {
  key: string;
  label: string;
  src: string;
}

/**
 * The six real screenshots of the one real, shipped case study (also
 * referenced statically from `services/software/page.tsx`) — not CMS media,
 * just what's actually in `public/case-studies/bhatkal-time-luxe/`. Real
 * pages of a real, running product, browsable rather than pasted as one
 * static image (`CREATIVE_DIRECTION.md` §7.2 rule 1 — operate the real
 * thing, don't just depict it).
 *
 * `as const satisfies` (a fixed-length readonly tuple, not `Screen[]`) so
 * `SCREENS[0]` is statically known to exist under `noUncheckedIndexedAccess`
 * — this array is a hardcoded literal, never empty at runtime, and typing it
 * as a tuple says so instead of hand-waving a non-null assertion past it.
 */
const SCREENS = [
  { key: "home", label: "Homepage", src: "/case-studies/bhatkal-time-luxe/hero-homepage.webp" },
  { key: "brands", label: "Brands", src: "/case-studies/bhatkal-time-luxe/brands-page.webp" },
  {
    key: "arrivals",
    label: "New arrivals",
    src: "/case-studies/bhatkal-time-luxe/new-arrivals-page.webp",
  },
  { key: "product", label: "Product", src: "/case-studies/bhatkal-time-luxe/product-page.webp" },
  {
    key: "quick-look",
    label: "Quick look",
    src: "/case-studies/bhatkal-time-luxe/quick-look-component.webp",
  },
  { key: "cart", label: "Cart", src: "/case-studies/bhatkal-time-luxe/cart-page.webp" },
] as const satisfies readonly Screen[];

/**
 * Proof, browsable (`CREATIVE_DIRECTION.md` §13.1) — the second part
 * attached to the Assembly Line's spine. The one real case study, given
 * full weight — but the visitor drives it (picking a screen) rather than
 * watching a single static image next to a paragraph. Still the page's long
 * exhale after the architecture detail's density: quiet because it's
 * independently verifiable, not because it's inert. Renders nothing if no
 * published case study exists yet — an honest gap, not a placeholder.
 */
export function Proof({ item }: { item: HomepageContentItem | null }) {
  const [activeKey, setActiveKey] = useState<string>(SCREENS[0].key);

  if (!item) return null;

  const active = SCREENS.find((screen) => screen.key === activeKey) ?? SCREENS[0];

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <Reveal>
          <SpineLabel>Proof</SpineLabel>
          <h2 className="text-h1 text-text mt-6 max-w-2xl font-semibold text-balance">
            {item.title}
          </h2>
          <p className="text-body text-text-muted mt-4 max-w-lg text-balance">{item.summary}</p>
        </Reveal>

        <Reveal delayMs={80}>
          <div className="border-border-muted mt-10 overflow-hidden rounded-lg border">
            <div className="border-border-muted bg-bg-light flex items-center gap-4 border-b px-4 py-2.5">
              <div className="flex items-center gap-1.5" aria-hidden="true">
                <span className="bg-border size-2.5 rounded-full" />
                <span className="bg-border size-2.5 rounded-full" />
                <span className="bg-border size-2.5 rounded-full" />
              </div>
              <div
                role="tablist"
                aria-label="Bhatkal Time Luxe screens"
                className="flex flex-1 items-center gap-1 overflow-x-auto"
              >
                {SCREENS.map((screen) => (
                  <button
                    key={screen.key}
                    type="button"
                    role="tab"
                    aria-selected={screen.key === activeKey}
                    onClick={() => setActiveKey(screen.key)}
                    className={cn(
                      "text-caption shrink-0 rounded-full px-3 py-1 font-medium whitespace-nowrap transition-colors duration-150",
                      screen.key === activeKey
                        ? "bg-bg text-text"
                        : "text-text-muted hover:text-text",
                    )}
                  >
                    {screen.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-bg-light relative aspect-[16/10] w-full">
              <Image
                key={active.key}
                src={active.src}
                alt={`Bhatkal Time Luxe — ${active.label}`}
                fill
                sizes="(min-width: 1024px) 1024px, 100vw"
                className="object-cover object-top"
                priority={active.key === SCREENS[0].key}
              />
            </div>
          </div>
        </Reveal>

        <Reveal delayMs={140} className="mt-6 flex flex-wrap items-center justify-between gap-4">
          {item.techTags.length > 0 && (
            <ul className="flex flex-wrap gap-x-4 gap-y-2" role="list">
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
              className="text-body text-text inline-flex items-center gap-2 font-medium no-underline hover:underline"
            >
              Read the case study
              <span aria-hidden="true">→</span>
            </Link>
          )}
        </Reveal>
      </Container>
    </section>
  );
}
