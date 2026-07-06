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

/** Standard 200-words-per-minute assumption (the same figure `Note.readingTimeMinutes` already used pre-blocks), rounded up so short content never reads as "0 minutes." */
const WORDS_PER_MINUTE = 200;

export function computeReadingTimeMinutes(blocks: Block[] | undefined): number {
  const wordCount = extractPlainText(blocks).trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}
