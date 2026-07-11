"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { CloseIcon, MenuIcon } from "@/components/ui/icons";
import { Link } from "@/components/ui/link";
import type { NavItem } from "@/config/nav";
import { duration, ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface MobileNavProps {
  items: NavItem[];
  cta: NavItem;
}

/**
 * Radix Dialog, not a hand-rolled drawer — focus trap, Escape-to-close, and
 * scroll-lock are genuinely hard to get right by hand (same reasoning
 * Phase 2A used for Select/Switch). Renders the exact same `items`/`cta`
 * the desktop Navbar receives, so mobile and desktop can never drift apart.
 *
 * Open/close motion moved from plain CSS keyframes to Motion
 * (DESIGN/V3/08_MOTION_SYSTEM.md §4) — a user re-tapping the menu button
 * mid-animation now interrupts cleanly instead of restarting a CSS animation
 * from its keyframe start. `forceMount` + `AnimatePresence` lets Motion own
 * the exit animation while Radix keeps owning open state, the focus trap,
 * and scroll lock — `asChild` forwards Motion's ref straight through to the
 * element Radix's focus trap actually measures, so none of that changes.
 * Same duration/ease values as the CSS it replaces (`lib/motion.ts`).
 */
export function MobileNav({ items, cta }: MobileNavProps) {
  const [open, setOpen] = useState(false);
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
  const drawerVariants = {
    hidden: {
      x: "100%",
      transition: { duration: shouldReduceMotion ? 0 : duration.fast, ease: ease.inOut },
    },
    visible: {
      x: 0,
      transition: { duration: shouldReduceMotion ? 0 : duration.base, ease: ease.out },
    },
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <IconButton
          icon={<MenuIcon className="size-5" />}
          aria-label="Open menu"
          className="md:hidden"
        />
      </Dialog.Trigger>
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
                variants={drawerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="z-modal bg-bg-light border-border-muted fixed inset-y-0 right-0 flex w-[min(20rem,85vw)] flex-col border-l p-6 shadow-xl focus:outline-none"
              >
                <Dialog.Title className="sr-only">Site navigation</Dialog.Title>
                <Dialog.Description className="sr-only">
                  Links to the primary sections of the HubZero site.
                </Dialog.Description>

                <div className="mb-6 flex items-center justify-end">
                  <Dialog.Close asChild>
                    <IconButton icon={<CloseIcon className="size-5" />} aria-label="Close menu" />
                  </Dialog.Close>
                </div>

                <nav aria-label="Mobile" className="flex flex-col gap-1">
                  <Link
                    href="/search"
                    tone="muted"
                    onClick={() => setOpen(false)}
                    className="text-h2 hover:bg-bg rounded-md px-3 py-3 font-serif no-underline hover:no-underline"
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
                        onClick={() => setOpen(false)}
                        className={cn(
                          "text-h2 hover:bg-bg rounded-md px-3 py-3 font-serif no-underline hover:no-underline",
                          active && "text-accent-text",
                        )}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>

                <div className="mt-auto pt-6">
                  <Button href={cta.href} className="w-full" onClick={() => setOpen(false)}>
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
