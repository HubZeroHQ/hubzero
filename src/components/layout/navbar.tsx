"use client";

import { ArrowUpRight } from "lucide-react";
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
 * Scroll direction, computed independently of every other piece of nav
 * state (`.hubzero/architecture/principles.md` — Interface State Should Be
 * Independently Derived). This hook answers exactly one question — is the
 * visitor scrolling down or up right now — and nothing downstream of it
 * (hover state, open/closed state, a section's own color) is allowed to
 * feed back into it. `idle` (the initial and at-rest value) is treated the
 * same as `up` by the caller: only an active downward scroll forces the
 * nav closed.
 */
function useScrollDirection() {
  const [direction, setDirection] = useState<"up" | "down" | "idle">("idle");

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY;
        // Ignore sub-5px jitter and the first ~80px of the page — a visitor
        // nudging the trackpad at the very top of a page shouldn't collapse
        // the nav before they've meaningfully committed to scrolling.
        if (Math.abs(delta) > 5) {
          setDirection(delta > 0 && y > 80 ? "down" : "up");
          lastY = y;
        }
        ticking = false;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return direction;
}

/**
 * The Unfold (`CREATIVE_DIRECTION.md` §4) — the mark becoming the
 * interface. Collapsed, it's the mark alone, floating and quiet. On
 * desktop hover it unfolds into the full bar; on mobile, tapping it opens
 * `MobileNav`'s bottom sheet instead (§4's mobile treatment is a
 * structurally different answer, not a squeezed desktop bar). Scroll
 * direction and hover/open state are computed independently and only
 * composed at render time — scrolling down forces the collapsed state
 * regardless of hover; scrolling up only restores the *resting* treatment,
 * it never forces the bar open.
 */
export function Navbar() {
  const [hovered, setHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const scrollDirection = useScrollDirection();
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  const desktopExpanded = hovered && scrollDirection !== "down";

  return (
    <>
      {/* Desktop — fixed top-center, hover-driven unfold. */}
      <div className="z-sticky pointer-events-none fixed inset-x-0 top-6 hidden justify-center px-4 md:flex">
        <motion.nav
          layout
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          transition={
            shouldReduceMotion ? { duration: 0 } : { duration: duration.base, ease: ease.inOut }
          }
          className={cn(
            "border-border-muted bg-bg-light/90 pointer-events-auto flex items-center",
            "shadow-raised overflow-hidden rounded-full border backdrop-blur-md",
          )}
          aria-label="Primary"
        >
          <Link
            href="/"
            id="hz-nav-mark-anchor"
            aria-label="HubZero home"
            className="flex size-12 shrink-0 items-center justify-center no-underline hover:no-underline"
          >
            <Mark className="text-text size-6" />
          </Link>

          <motion.div
            initial={false}
            animate={{ width: desktopExpanded ? "auto" : 0 }}
            transition={
              shouldReduceMotion ? { duration: 0 } : { duration: duration.base, ease: ease.inOut }
            }
            className="flex items-center overflow-hidden"
          >
            <div className="flex items-center gap-5 py-3 pr-5 whitespace-nowrap">
              {primaryNav.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    tone="muted"
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "text-caption font-medium no-underline hover:no-underline",
                      active && "text-text",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <span aria-hidden="true" className="bg-border h-4 w-px" />
              <ThemeToggle />
              <Link
                href={primaryCta.href}
                className="text-accent-text text-caption inline-flex items-center gap-1 font-medium no-underline hover:no-underline hover:opacity-80"
              >
                {primaryCta.label}
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
          </motion.div>
        </motion.nav>
      </div>

      {/* Mobile — fixed bottom-center, within one-handed thumb reach. */}
      <div className="z-sticky pointer-events-none fixed inset-x-0 bottom-[max(1.25rem,env(safe-area-inset-bottom))] flex justify-center md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          aria-haspopup="dialog"
          className={cn(
            "border-border-muted bg-bg-light/90 pointer-events-auto flex size-14 items-center justify-center",
            "shadow-raised rounded-full border backdrop-blur-md transition-opacity duration-150",
            scrollDirection === "down" && "opacity-60",
          )}
        >
          <Mark className="text-text size-7" />
        </button>
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
