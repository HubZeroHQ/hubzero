"use client";

import { ArrowUpRight, Menu } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Mark } from "@/components/brand/mark";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Link } from "@/components/ui/link";
import { primaryCta, primaryNav } from "@/config/nav";
import { duration, ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Whether the visitor has scrolled past the top of the page — computed
 * independently of every other piece of nav state
 * (`.hubzero/architecture/principles.md` — Interface State Should Be
 * Independently Derived). This is the only thing scroll position is allowed
 * to drive: background/border chrome, so the bar stays legible over
 * whatever content is beneath it. It never hides the bar or changes what's
 * in it — per `CREATIVE_DIRECTION.md` §4, the nav is always in its complete
 * state.
 */
function useScrolled(threshold = 24) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > threshold);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return scrolled;
}

/**
 * Persistent navigation (`CREATIVE_DIRECTION.md` §4, revised 2026-07-13).
 * Mark, wordmark, every primary link, and the CTA are all visible
 * simultaneously at all times — nothing collapses, nothing has to be
 * discovered by hovering. The only motion is feedback on something already
 * visible: a shared-layout highlight that slides beneath whichever link has
 * hover/focus, and scroll-driven chrome strengthening past `useScrolled`'s
 * threshold. Mobile reuses the same persistent bar; its menu button opens
 * `MobileNav`'s bottom sheet on tap, which was never hover-gated and so was
 * never in violation of the "no reveal gesture" rule.
 */
export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);
  const scrolled = useScrolled();
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  return (
    <>
      <div className="z-sticky pointer-events-none fixed inset-x-0 top-4 flex justify-center px-4">
        <nav
          className={cn(
            "pointer-events-auto flex w-full max-w-3xl items-center justify-between gap-4 rounded-full border px-3 py-2",
            "transition-[background-color,border-color,box-shadow] duration-300",
            scrolled
              ? "border-border-muted bg-bg-light/90 shadow-raised backdrop-blur-md"
              : "border-transparent bg-transparent shadow-none",
          )}
          aria-label="Primary"
        >
          <Link
            href="/"
            aria-label="HubZero home"
            className="flex shrink-0 items-center gap-2 py-1.5 pl-1.5 no-underline hover:no-underline"
          >
            <Mark className="text-text size-6 shrink-0" />
            <span className="text-caption text-text hidden font-semibold tracking-tight sm:inline">
              HubZero
            </span>
          </Link>

          <div
            className="hidden items-center gap-1 md:flex"
            onMouseLeave={() => setHoveredHref(null)}
          >
            {primaryNav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  tone="muted"
                  aria-current={active ? "page" : undefined}
                  onMouseEnter={() => setHoveredHref(item.href)}
                  onFocus={() => setHoveredHref(item.href)}
                  onBlur={() => setHoveredHref(null)}
                  className={cn(
                    "text-caption relative rounded-full px-3 py-1.5 font-medium no-underline hover:no-underline",
                    active ? "text-text" : "text-text-muted",
                  )}
                >
                  {hoveredHref === item.href && (
                    <motion.span
                      layoutId="nav-hover-highlight"
                      transition={
                        shouldReduceMotion
                          ? { duration: 0 }
                          : { duration: duration.fast, ease: ease.out }
                      }
                      className="bg-bg absolute inset-0 -z-10 rounded-full"
                    />
                  )}
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle className="hidden md:inline-flex" />
            <Link
              href={primaryCta.href}
              className="text-accent-foreground bg-accent text-caption hidden items-center gap-1 rounded-full px-4 py-1.5 font-medium no-underline hover:no-underline hover:opacity-90 md:inline-flex"
            >
              {primaryCta.label}
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-haspopup="dialog"
              className="text-text hover:bg-bg flex size-9 items-center justify-center rounded-full md:hidden"
            >
              <Menu className="size-5" aria-hidden="true" />
            </button>
          </div>
        </nav>
      </div>

      <MobileNav
        items={primaryNav}
        cta={primaryCta}
        open={mobileOpen}
        onOpenChange={setMobileOpen}
      />
    </>
  );
}
