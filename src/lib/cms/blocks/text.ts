import type { Block, SimpleBlock } from "@/lib/cms/blocks/types";

/**
 * Flattens a block tree to plain prose — the only thing every narrative
 * collection's `readingTimeMinutes` (`computedFields`, per collection's
 * `*.config.ts`) needs. Code/HTML/divider/spacer blocks contribute nothing —
 * they aren't prose a reader spends "reading time" on.
 */
function simpleBlockText(block: SimpleBlock): string {
  switch (block.type) {
    case "heading":
      return block.data.text;
    case "paragraph":
      return block.data.text;
    case "markdown":
      return block.data.markdown;
    case "quote":
      return [block.data.text, block.data.attribution].filter(Boolean).join(" ");
    case "callout":
      return block.data.text;
    case "image":
      return block.data.caption ?? "";
    case "gallery":
      return block.data.caption ?? "";
    case "video":
      return block.data.caption ?? "";
    case "metrics":
      return block.data.items.map((item) => `${item.label} ${item.value}`).join(" ");
    case "timeline":
      return block.data.items.map((item) => `${item.title} ${item.description ?? ""}`).join(" ");
    case "code":
    case "html":
    case "divider":
    case "spacer":
      return "";
    default: {
      // Exhaustiveness guard: a 16th `BlockType` that forgets to add a case
      // here fails the build instead of silently contributing 0 words to
      // every collection's `readingTimeMinutes`.
      const exhaustive: never = block;
      return exhaustive;
    }
  }
}

function blockText(block: Block): string {
  if (block.type === "twoColumn") {
    return [...block.data.left, ...block.data.right].map(simpleBlockText).join(" ");
  }
  return simpleBlockText(block);
}

export function extractPlainText(blocks: Block[] | undefined): string {
  if (!blocks || blocks.length === 0) return "";
  return blocks.map(blockText).join(" ");
}

/**
 * A one-line summary of a single block's content, used by the collapsed
 * `BlockShell` in the admin editor so collapsing a block doesn't hide *what
 * it is* along with its fields — e.g. a collapsed Heading shows its own
 * text, a collapsed Metrics grid shows how many stats it holds. Falls back
 * to a generic count/description for block types with no meaningful prose
 * (`image`/`gallery`/`divider`/`spacer`), since `simpleBlockText` returns
 * `""` for those.
 */
export function blockPreviewText(block: Block, maxLength = 80): string {
  function truncate(text: string): string {
    const trimmed = text.trim();
    return trimmed.length > maxLength ? `${trimmed.slice(0, maxLength - 1).trimEnd()}…` : trimmed;
  }

  switch (block.type) {
    case "image":
      return block.data.caption ? truncate(block.data.caption) : "1 image";
    case "gallery":
      return `${block.data.media.length} image${block.data.media.length === 1 ? "" : "s"}`;
    case "video":
      return block.data.caption ? truncate(block.data.caption) : block.data.url || "No URL yet";
    case "divider":
      return "";
    case "spacer":
      return block.data.size;
    case "twoColumn":
      return `${block.data.left.length} left · ${block.data.right.length} right`;
    case "html":
      return "Raw HTML";
    case "code":
      return block.data.filename || "Code snippet";
    default: {
      const text = simpleBlockText(block as SimpleBlock);
      return text ? truncate(text) : "Empty";
    }
  }
}

/** Standard 200-words-per-minute assumption (the same figure `Note.readingTimeMinutes` already used pre-blocks), rounded up so short content never reads as "0 minutes." */
const WORDS_PER_MINUTE = 200;

export function computeReadingTimeMinutes(blocks: Block[] | undefined): number {
  const wordCount = extractPlainText(blocks).trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}
