import { codeToHtml } from "shiki";

/**
 * Server-only syntax highlighting for the `code` block
 * (`ARCHITECTURE/20_CONTENT_BLOCKS.md`) — Shiki runs at render time in the
 * `BlockRenderer` Server Component and returns static HTML, so no highlighter
 * JS ever ships to the client. A fixed dark theme is used regardless of the
 * site's own light/dark mode (`ThemeProvider`, `attribute="class"`) —
 * matching the common editorial convention of a code block having its own
 * distinct chrome, and avoiding the considerably more involved dual-theme
 * CSS-variable wiring Shiki would otherwise need.
 *
 * Kept in sync with `components/admin/blocks/block-data-editor.tsx`'s
 * `CODE_LANGUAGE_OPTIONS` — every language offered there must resolve to a
 * real Shiki grammar here.
 */
const SUPPORTED_LANGUAGES = new Set([
  "typescript",
  "tsx",
  "javascript",
  "jsx",
  "json",
  "python",
  "bash",
  "css",
  "html",
  "markdown",
  "yaml",
  "sql",
  "go",
  "rust",
  "java",
  "csharp",
  "cpp",
]);

const THEME = "github-dark";

export async function highlightCode(code: string, language?: string): Promise<string> {
  const lang = language && SUPPORTED_LANGUAGES.has(language) ? language : "text";
  try {
    return await codeToHtml(code, { lang, theme: THEME });
  } catch {
    // An unrecognized language string (free text predates the language
    // dropdown, or a grammar failed to load) — plain text still highlights
    // (just without token colors) rather than failing the whole page render.
    return codeToHtml(code, { lang: "text", theme: THEME });
  }
}
