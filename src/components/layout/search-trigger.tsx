"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Link } from "@/components/ui/link";

/**
 * The public site's Cmd/Ctrl+K shortcut (Phase G) — navigates straight to
 * `/search` rather than opening a duplicate in-page modal palette: Studio's
 * `<CommandPalette>` (Phase F) exists because Studio needs quick-create
 * actions and a "Go to" nav list alongside search results; the public site's
 * only comparable need is "jump to search," which a dedicated page already
 * serves (and stays usable/bookmarkable with JS disabled, unlike a
 * client-only modal).
 */
export function SearchTrigger() {
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        router.push("/search");
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return (
    <Link
      href="/search"
      tone="muted"
      aria-label="Search (Cmd+K)"
      className="inline-flex items-center gap-1.5 no-underline hover:no-underline"
    >
      <Search className="size-4" aria-hidden="true" />
      <kbd className="border-border-muted hidden rounded border px-1.5 py-0.5 text-[10px] md:inline">
        ⌘K
      </kbd>
    </Link>
  );
}
