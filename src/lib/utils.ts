import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge only knows Tailwind's built-in class scale by default. Our
 * custom @theme font-size tokens (globals.css) — text-display/h1/h2/h3/body/
 * caption — aren't in that list, so plain twMerge misclassifies them as
 * text-color utilities (both are "text-*") and silently drops them whenever
 * they're merged alongside a real color class like text-text/text-accent.
 * Registering them under the font-size group fixes that.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": ["text-display", "text-h1", "text-h2", "text-h3", "text-body", "text-caption"],
    },
  },
});

/** Merge conditional class names and resolve Tailwind conflicts deterministically. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Converts a blank string (what an empty optional form field submits as) into `undefined`, for use with `z.preprocess`. */
export function emptyToUndefined(value: unknown) {
  return typeof value === "string" && value.trim() === "" ? undefined : value;
}

/** Escapes regex metacharacters in user input before it's interpolated into a MongoDB `$regex` filter — shared by every collection/reference search. */
export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Human-readable file size (e.g. `"1.4 MB"`) — shared by the Media Library's per-file display and the dashboard's storage-usage card. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}
