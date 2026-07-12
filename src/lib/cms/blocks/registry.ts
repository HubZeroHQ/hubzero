import {
  Code2,
  Columns2,
  Film,
  Grid2x2,
  Heading as HeadingIcon,
  Image as ImageIcon,
  ListTree,
  Megaphone,
  Minus,
  Quote as QuoteIcon,
  SeparatorHorizontal,
  SquareCode,
  Table as TableIcon,
  Text as TextIcon,
  TextQuote,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { Block, BlockType, SimpleBlock } from "@/lib/cms/blocks/types";

/** Generates a stable client-side block id. Web Crypto's `randomUUID` is available in every environment this module runs in (the admin editor's browser bundle, and any Node 19+ script) — no `uuid`/`nanoid` dependency needed for something this small. */
export function newBlockId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * The one place a new block type touches (`ARCHITECTURE/20_CONTENT_BLOCKS.md`):
 * label/description/icon for the "Add block" menu, plus a default-data
 * factory. `components/admin/blocks/*` and the "Add block" menu read this
 * generically — no per-collection variant, since the block vocabulary is the
 * same for every narrative collection.
 */
export interface BlockTypeMeta {
  label: string;
  description: string;
  icon: LucideIcon;
  group: "Text" | "Media" | "Data" | "Layout" | "Advanced";
  /** `false` for `twoColumn` — a column can't contain another two-column layout (`types.ts`). */
  availableInColumn: boolean;
  createDefault: () => Block;
}

function block<T extends BlockType>(type: T, data: Extract<Block, { type: T }>["data"]): Block {
  return { id: newBlockId(), type, data } as Block;
}

export const BLOCK_TYPE_META: Record<BlockType, BlockTypeMeta> = {
  heading: {
    label: "Heading",
    description: "A section break — use sparingly, the story doesn't need one before every block.",
    icon: HeadingIcon,
    group: "Text",
    availableInColumn: true,
    createDefault: () => block("heading", { level: 2, text: "" }),
  },
  paragraph: {
    label: "Paragraph",
    description: "Short-form prose with inline bold/italic/links.",
    icon: TextIcon,
    group: "Text",
    availableInColumn: true,
    createDefault: () => block("paragraph", { text: "" }),
  },
  markdown: {
    label: "Markdown",
    description: "Quick long-form writing — full markdown, one block.",
    icon: SquareCode,
    group: "Text",
    availableInColumn: true,
    createDefault: () => block("markdown", { markdown: "" }),
  },
  quote: {
    label: "Quote",
    description: "A pull quote, optionally attributed.",
    icon: TextQuote,
    group: "Text",
    availableInColumn: true,
    createDefault: () => block("quote", { text: "" }),
  },
  callout: {
    label: "Callout",
    description: "A highlighted note, tip, or warning.",
    icon: Megaphone,
    group: "Text",
    availableInColumn: true,
    createDefault: () => block("callout", { tone: "note", text: "" }),
  },
  image: {
    label: "Image",
    description: "A single image from the media library.",
    icon: ImageIcon,
    group: "Media",
    availableInColumn: true,
    createDefault: () => block("image", { media: "", align: "center", width: "content" }),
  },
  gallery: {
    label: "Image gallery",
    description: "Multiple images shown together.",
    icon: Grid2x2,
    group: "Media",
    availableInColumn: true,
    createDefault: () => block("gallery", { media: [] }),
  },
  video: {
    label: "Video embed",
    description: "A YouTube/Vimeo link or hosted video URL.",
    icon: Film,
    group: "Media",
    availableInColumn: true,
    createDefault: () => block("video", { url: "" }),
  },
  metrics: {
    label: "Metrics grid",
    description: "A row of label/value stats.",
    icon: ListTree,
    group: "Data",
    availableInColumn: true,
    createDefault: () => block("metrics", { items: [{ label: "", value: "" }] }),
  },
  timeline: {
    label: "Timeline",
    description: "A dated sequence of milestones.",
    icon: ListTree,
    group: "Data",
    availableInColumn: true,
    createDefault: () => block("timeline", { items: [{ date: "", title: "" }] }),
  },
  divider: {
    label: "Divider",
    description: "A visual break between sections.",
    icon: Minus,
    group: "Layout",
    availableInColumn: true,
    createDefault: () => block("divider", {}),
  },
  spacer: {
    label: "Spacer",
    description: "Extra vertical space.",
    icon: SeparatorHorizontal,
    group: "Layout",
    availableInColumn: true,
    createDefault: () => block("spacer", { size: "md" }),
  },
  twoColumn: {
    label: "Two-column layout",
    description: "Side-by-side content — each column holds its own blocks.",
    icon: Columns2,
    group: "Layout",
    availableInColumn: false,
    createDefault: () => block("twoColumn", { left: [], right: [] }),
  },
  code: {
    label: "Code block",
    description: "A formatted code snippet.",
    icon: Code2,
    group: "Advanced",
    availableInColumn: true,
    createDefault: () => block("code", { code: "" }),
  },
  html: {
    label: "Raw HTML",
    description:
      "Admin/Head Admin only — publishing is blocked while this block is present for any other role.",
    icon: Code2,
    group: "Advanced",
    availableInColumn: true,
    createDefault: () => block("html", { html: "" }),
  },
  table: {
    label: "Table",
    description: "A simple data table with a horizontal-scroll fallback on small screens.",
    icon: TableIcon,
    group: "Data",
    availableInColumn: true,
    createDefault: () => block("table", { headers: ["", ""], rows: [["", ""]] }),
  },
};

export const BLOCK_TYPES = Object.keys(BLOCK_TYPE_META) as BlockType[];

export function isSimpleBlock(candidate: Block): candidate is SimpleBlock {
  return candidate.type !== "twoColumn";
}
