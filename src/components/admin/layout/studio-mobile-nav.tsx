"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { LogOut, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { IconButton } from "@/components/ui/icon-button";
import { Link } from "@/components/ui/link";
import { studioNavItems } from "@/config/studio-nav";
import { logout } from "@/lib/cms/logout-action";
import { roleMeetsMinimum } from "@/lib/cms/roles";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/types/cms";

export interface StudioMobileNavProps {
  user: SessionUser;
}

/**
 * Mobile counterpart to `Sidebar` — same Radix Dialog pattern as the public
 * site's `MobileNav` (focus trap, Escape-to-close, scroll-lock handled by
 * Radix rather than hand-rolled), rendering the exact same `studioNavItems`
 * so desktop and mobile can never drift (`ARCHITECTURE/16_RESPONSIVE_DESIGN_STANDARDS.md`'s
 * "each tier is its own composition," applied to the admin's utility surface).
 */
export function StudioMobileNav({ user }: StudioMobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const items = studioNavItems.filter(
    (item) => !item.minimumRole || roleMeetsMinimum(user.role, item.minimumRole),
  );

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <IconButton
          icon={<Menu className="size-5" />}
          aria-label="Open menu"
          className="lg:hidden"
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
          <Dialog.Title className="sr-only">Studio navigation</Dialog.Title>
          <Dialog.Description className="sr-only">
            Links to the HubZero Studio admin sections.
          </Dialog.Description>

          <div className="mb-6 flex items-center justify-between">
            <span className="text-text text-body font-medium">{user.name}</span>
            <Dialog.Close asChild>
              <IconButton icon={<X className="size-5" />} aria-label="Close menu" />
            </Dialog.Close>
          </div>

          <nav aria-label="Studio" className="flex flex-col gap-1">
            {items.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  tone="muted"
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-3 no-underline hover:no-underline",
                    active ? "bg-bg text-text" : "hover:bg-bg hover:text-text",
                  )}
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <form action={logout} className="mt-auto pt-6">
            <button
              type="submit"
              className="text-text-muted hover:text-text flex w-full items-center gap-3 rounded-md px-3 py-3 text-left"
            >
              <LogOut className="size-4 shrink-0" aria-hidden="true" />
              Sign out
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
