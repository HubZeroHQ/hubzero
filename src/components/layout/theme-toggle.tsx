"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";

/**
 * Light mode has a complete token set (`globals.css`'s `.light` block) but,
 * until now, no way for a real visitor to reach it — `ThemeProvider` ships
 * `enableSystem={false}` and no control existed anywhere in the chrome. A
 * small, restrained control here closes that gap rather than leaving Vellum
 * as effectively dead code.
 *
 * Renders both icons unconditionally and lets the same `.dark`/`.light`
 * class-based CSS toggle `Logo` already uses pick the visible one — no
 * `mounted` state, no hydration-flash guard needed, because nothing here
 * branches on `theme`/`resolvedTheme` at render time; only the click handler
 * reads it.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
      className={cn("text-text-muted hover:text-text inline-flex items-center", className)}
    >
      <Sun className="dark:hidden" size={16} aria-hidden="true" />
      <Moon className="hidden dark:block" size={16} aria-hidden="true" />
    </button>
  );
}
