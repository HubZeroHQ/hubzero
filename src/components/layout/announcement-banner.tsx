"use client";

import { X } from "lucide-react";
import { useState } from "react";

import { IconButton } from "@/components/ui/icon-button";
import type { WithChildren } from "@/types";

/**
 * Opt-in infrastructure — not mounted by default in `MarketingShell`. There's
 * no real announcement to ship yet (site is pre-launch), so this exists as a
 * ready primitive rather than shipped with placeholder marketing copy.
 * Dismissal is in-memory only for now (resets on reload); add persistence
 * once a real, recurring announcement needs it — not before.
 */
export function AnnouncementBanner({ children }: WithChildren) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      role="region"
      aria-label="Site announcement"
      className="bg-accent text-accent-foreground text-caption relative flex items-center justify-center gap-3 px-12 py-2.5 text-center font-medium"
    >
      <p>{children}</p>
      <IconButton
        icon={<X className="size-4" />}
        aria-label="Dismiss announcement"
        size="sm"
        onClick={() => setDismissed(true)}
        className="text-accent-foreground hover:bg-accent-foreground/10 absolute right-2"
      />
    </div>
  );
}
