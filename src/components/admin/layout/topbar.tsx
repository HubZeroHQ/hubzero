import { LogOut } from "lucide-react";

import { CommandPalette } from "@/components/admin/command-palette/command-palette";
import { StudioMobileNav } from "@/components/admin/layout/studio-mobile-nav";
import { Text } from "@/components/ui";
import { logout } from "@/lib/cms/logout-action";
import type { SessionUser } from "@/types/cms";

export interface TopbarProps {
  user: SessionUser;
}

/**
 * Server Component — the mobile nav trigger (`StudioMobileNav`) is the only
 * client island inside it. Shows who's signed in and a direct sign-out
 * action; page-specific context (title/breadcrumb) is each page's own
 * `PageHeader`, not duplicated here, so the topbar stays a constant, never a
 * per-page special case.
 */
export function Topbar({ user }: TopbarProps) {
  return (
    <header className="border-border-muted flex items-center justify-between gap-4 border-b px-6 py-4 md:px-8">
      <StudioMobileNav user={user} />

      <CommandPalette user={user} />

      <div className="ml-auto flex items-center gap-4">
        <div className="hidden text-right sm:block">
          <Text size="caption" weight="medium">
            {user.name}
          </Text>
          <Text size="caption" tone="muted" className="capitalize">
            {user.role.replace("_", " ")}
          </Text>
        </div>
        <form action={logout}>
          <button
            type="submit"
            aria-label="Sign out"
            className="text-text-muted hover:text-text text-caption inline-flex items-center gap-2"
          >
            <LogOut className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </form>
      </div>
    </header>
  );
}
