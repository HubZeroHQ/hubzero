"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";

import { Mark } from "@/components/brand/mark";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import type { NavItem } from "@/config/nav";
import { duration, ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface MobileNavProps {
  items: NavItem[];
  cta: NavItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Mobile navigation (`CREATIVE_DIRECTION.md` §4). The persistent desktop bar
 * (`navbar.tsx`) doesn't fit five links plus a CTA at phone width, so mobile
 * gets a structurally different answer to the same job: tapping the menu
 * button in that same persistent bar opens this bottom sheet. This was
 * always tap-triggered, never hover-gated, so it stayed compliant with §4's
 * "no reveal gesture" rule even before the desktop hover-unfold was retired.
 * Radix Dialog owns the focus trap, Escape-to-close, and scroll-lock; Motion
 * owns the open/close transition (`forceMount` + `AnimatePresence`), so a
 * re-tap mid-animation interrupts cleanly instead of restarting from a
 * keyframe start.
 */
export function MobileNav({ items, cta, open, onOpenChange }: MobileNavProps) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  const overlayVariants = {
    hidden: {
      opacity: 0,
      transition: { duration: shouldReduceMotion ? 0 : duration.fast, ease: ease.inOut },
    },
    visible: {
      opacity: 1,
      transition: { duration: shouldReduceMotion ? 0 : duration.base, ease: ease.out },
    },
  };
  const sheetVariants = {
    hidden: {
      y: "100%",
      transition: { duration: shouldReduceMotion ? 0 : duration.fast, ease: ease.inOut },
    },
    visible: {
      y: 0,
      transition: { duration: shouldReduceMotion ? 0 : duration.base, ease: ease.out },
    },
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                variants={overlayVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="z-overlay bg-bg-dark/60 fixed inset-0 backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount>
              <motion.div
                variants={sheetVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="z-modal bg-bg-light border-border-muted fixed inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-2xl border-t p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-xl focus:outline-none"
              >
                <Dialog.Title className="sr-only">Site navigation</Dialog.Title>
                <Dialog.Description className="sr-only">
                  Links to the primary sections of the HubZero site.
                </Dialog.Description>

                <div className="mb-6 flex items-center justify-between">
                  <Mark className="text-text-muted size-6" />
                  <ThemeToggle className="p-2" />
                </div>

                <nav aria-label="Mobile" className="flex flex-col gap-1 overflow-y-auto">
                  <Link
                    href="/search"
                    tone="muted"
                    onClick={() => onOpenChange(false)}
                    className="text-h3 hover:bg-bg rounded-md px-3 py-3 font-semibold no-underline hover:no-underline"
                  >
                    Search
                  </Link>
                  {items.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        tone="muted"
                        aria-current={active ? "page" : undefined}
                        onClick={() => onOpenChange(false)}
                        className={cn(
                          "text-h3 hover:bg-bg rounded-md px-3 py-3 font-semibold no-underline hover:no-underline",
                          active && "text-accent-text",
                        )}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>

                <div className="mt-6 shrink-0">
                  <Button href={cta.href} className="w-full" onClick={() => onOpenChange(false)}>
                    {cta.label}
                  </Button>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
