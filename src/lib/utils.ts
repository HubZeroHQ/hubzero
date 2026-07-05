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

/** A short single-line teaser from the first paragraph of a longer markdown/richtext field — e.g. a Case Study card's result line, derived from the full `result` field rather than a second author-maintained summary. */
export function firstLineTeaser(value: string, maxLength = 160): string {
  const firstLine =
    value
      .trim()
      .split("\n")
      .find((line) => line.trim().length > 0) ?? "";
  if (firstLine.length <= maxLength) return firstLine;
  return `${firstLine.slice(0, maxLength - 1).trimEnd()}…`;
}
