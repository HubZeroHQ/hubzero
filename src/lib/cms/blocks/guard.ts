import type { Block } from "@/lib/cms/blocks/types";
import type { UserRole } from "@/types/cms";

/**
 * The Raw HTML block is "admin-only" as a *publish*-time rule, not a
 * save-time one: rejecting it on every autosave/update would brick a
 * Teammate's in-progress draft the moment they experiment with the block,
 * for a restriction that only actually matters once content goes live. This
 * mirrors the existing `publishGuard` escape hatch (`collection-config.ts`)
 * exactly — `crud-actions.ts`'s `publish()` runs this generic check
 * alongside any collection-specific guard, for every collection with a
 * `"blocks"` field, with no per-collection code.
 */
const HTML_BLOCK_ALLOWED_ROLES: UserRole[] = ["admin", "head_admin"];

function collectFromColumn(blocks: Block[]): boolean {
  return blocks.some((block) => block.type === "html");
}

export function blocksContainHtml(blocks: Block[] | undefined): boolean {
  if (!blocks || blocks.length === 0) return false;
  return blocks.some((block) => {
    if (block.type === "html") return true;
    if (block.type === "twoColumn") {
      return collectFromColumn(block.data.left) || collectFromColumn(block.data.right);
    }
    return false;
  });
}

export function checkHtmlBlockPublishGuard(
  blocks: Block[] | undefined,
  role: UserRole,
): string | null {
  if (HTML_BLOCK_ALLOWED_ROLES.includes(role)) return null;
  if (!blocksContainHtml(blocks)) return null;
  return "This document contains a Raw HTML block, which only an Admin or Head Admin can publish. Remove it, or ask an Admin to publish.";
}

/**
 * "Which documents use this image" (`lib/cms/media.ts`'s `getMediaUsage`)
 * needs to see inside block content, not just top-level `image`/`imageArray`
 * fields — an Image or Gallery block's `media` id is nested JSON, invisible
 * to a plain Mongoose field-equality query. Generic across every block type
 * that can reference media (`image`, `gallery`, and both columns of a
 * `twoColumn`), so a future block type with a media reference is covered the
 * moment it's added here.
 */
export function collectBlockMediaIds(blocks: Block[] | undefined): string[] {
  if (!blocks || blocks.length === 0) return [];
  const ids: string[] = [];
  for (const block of blocks) {
    if (block.type === "image") {
      if (block.data.media) ids.push(block.data.media);
    } else if (block.type === "gallery") {
      ids.push(...block.data.media);
    } else if (block.type === "twoColumn") {
      ids.push(...collectBlockMediaIds(block.data.left), ...collectBlockMediaIds(block.data.right));
    }
  }
  return ids;
}
