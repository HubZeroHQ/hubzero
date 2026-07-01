"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Link } from "@/components/ui/link";
import type { NavItem } from "@/config/nav";
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
 */
export function MobileNav({ items, cta }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <IconButton
          icon={<Menu className="size-5" />}
          aria-label="Open menu"
          className="md:hidden"
        />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            "z-overlay bg-bg-dark/60 fixed inset-0 backdrop-blur-sm",
            "data-[state=open]:[animation:overlay-in_0.3s_cubic-bezier(0.16,1,0.3,1)]",
            "data-[state=closed]:[animation:overlay-out_0.2s_cubic-bezier(0.4,0,0.2,1)]",
          )}
        />
        <Dialog.Content
          className={cn(
            "z-modal bg-bg-light border-border-muted fixed inset-y-0 right-0 flex w-[min(20rem,85vw)] flex-col border-l p-6 shadow-xl focus:outline-none",
            "data-[state=open]:[animation:drawer-in_0.3s_cubic-bezier(0.16,1,0.3,1)]",
            "data-[state=closed]:[animation:drawer-out_0.2s_cubic-bezier(0.4,0,0.2,1)]",
          )}
        >
          <Dialog.Title className="sr-only">Site navigation</Dialog.Title>
          <Dialog.Description className="sr-only">
            Links to the primary sections of the HubZero site.
          </Dialog.Description>

          <div className="mb-6 flex items-center justify-end">
            <Dialog.Close asChild>
              <IconButton icon={<X className="size-5" />} aria-label="Close menu" />
            </Dialog.Close>
          </div>

          <nav aria-label="Mobile" className="flex flex-col gap-1">
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
                    active && "text-accent",
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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
