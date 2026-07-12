"use client";

import { usePathname } from "next/navigation";

import { Logo } from "@/components/brand/logo";
import { Link } from "@/components/ui/link";
import { studioNavItems } from "@/config/studio-nav";
import { roleMeetsMinimum } from "@/lib/cms/roles";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/cms";

export interface SidebarProps {
  role: UserRole;
  className?: string;
}

/**
 * Desktop admin sidebar — the permanent, always-visible nav surface
 * (`ARCHITECTURE/19_CMS_FOUNDATION.md` §4's "role-filtered sidebar nav").
 * Reads `studioNavItems` (`config/studio-nav.ts`) rather than hardcoding
 * links, so a future collection's screen is a config addition, not a shell
 * edit. Needs `usePathname` for active-state styling, the same reason
 * `MobileNav` crosses the client boundary — the rest of the shell around it
 * stays a Server Component.
 */
export function Sidebar({ role, className }: SidebarProps) {
  const pathname = usePathname();
  const items = studioNavItems.filter(
    (item) => !item.minimumRole || roleMeetsMinimum(role, item.minimumRole),
  );

  return (
    <nav
      aria-label="Studio"
      className={cn(
        "border-border-muted bg-bg-light flex w-60 shrink-0 flex-col gap-6 border-r px-4 py-6",
        className,
      )}
    >
      <Link
        href="/studio"
        aria-label="HubZero Studio home"
        className="px-2 no-underline hover:no-underline"
      >
        <Logo />
      </Link>

      <ul className="flex flex-col gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                tone="muted"
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 no-underline hover:no-underline",
                  active ? "bg-bg text-text" : "hover:bg-bg hover:text-text",
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                <span className="text-body">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
