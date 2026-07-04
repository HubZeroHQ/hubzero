/**
 * Side-effect import barrel: every collection's `*.config.ts` module calls
 * `registerCollection()` (`collection-config.ts`) at module load, so anything
 * that reads the registry generically — the unified review queue, the
 * generic version-history screen, the dashboard's activity feed — must
 * import this file first to guarantee every collection has actually
 * registered itself before asking "what's registered." A collection reached
 * only through its own `/studio/<collection>` pages (which import its config
 * directly) doesn't need this; only cross-collection screens with no static
 * import path to a specific collection do.
 *
 * Adding a collection here is a one-line data change, never a new code path
 * for any generic screen that already consumes the registry
 * (`ARCHITECTURE/19_CMS_FOUNDATION.md` §14 Phase E's entire premise).
 */
import "@/lib/cms/collections/case-study.config";
