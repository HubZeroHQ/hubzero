/**
 * The editorial block system — `ARCHITECTURE/20_CONTENT_BLOCKS.md`. Every
 * narrative collection (Case Study, Build, Labs Project, Blueprint, Note)
 * stores its long-form content as an ordered `Block[]` instead of a fixed set
 * of markdown fields (`problem`/`approach`/`result`, `description`, `body`,
 * …) — the author orders and mixes blocks freely, the renderer makes no
 * assumption about which block comes first or what a document "must" contain.
 *
 * `TwoColumnBlockData.left`/`right` intentionally type as `SimpleBlock[]`, not
 * `Block[]` — a two-column layout can hold text/image/quote/etc. blocks in
 * each column, but not a nested two-column layout. This is enforced by the
 * type system here and mirrored in `schema.ts`'s Zod validation, not just
 * documented — the two-column column arrays are built from a Zod union that
 * excludes the `twoColumn` case entirely, so "no nesting" can't drift out of
 * sync between the TS type and the runtime validator.
 */

export type BlockType =
  | "heading"
  | "paragraph"
  | "image"
  | "gallery"
  | "quote"
  | "callout"
  | "code"
  | "divider"
  | "metrics"
  | "timeline"
  | "video"
  | "spacer"
  | "twoColumn"
  | "markdown"
  | "html";

export interface HeadingBlockData {
  level: 2 | 3;
  text: string;
}

/** Short-form prose — inline markdown (bold/italic/links), not a full markdown document. For long-form writing, use the Markdown block instead. */
export interface ParagraphBlockData {
  text: string;
}

export type ImageAlign = "left" | "center" | "right";
export type ImageWidth = "content" | "wide" | "full";

export interface ImageBlockData {
  /** A `Media` document id — never a raw URL (`ARCHITECTURE/19_CMS_FOUNDATION.md` §8). */
  media: string;
  caption?: string;
  align: ImageAlign;
  width: ImageWidth;
}

export interface GalleryBlockData {
  media: string[];
  caption?: string;
}

export interface QuoteBlockData {
  text: string;
  attribution?: string;
  role?: string;
}

export type CalloutTone = "note" | "info" | "success" | "warning";

export interface CalloutBlockData {
  tone: CalloutTone;
  text: string;
}

export interface CodeBlockData {
  code: string;
  language?: string;
  filename?: string;
}

export type DividerBlockData = Record<string, never>;

export interface MetricItem {
  label: string;
  value: string;
}

export interface MetricsBlockData {
  items: MetricItem[];
}

export interface TimelineItem {
  date: string;
  title: string;
  description?: string;
}

export interface TimelineBlockData {
  items: TimelineItem[];
}

export interface VideoBlockData {
  url: string;
  caption?: string;
}

export type SpacerSize = "sm" | "md" | "lg";

export interface SpacerBlockData {
  size: SpacerSize;
}

export interface MarkdownBlockData {
  markdown: string;
}

/** Admin-only in practice: publishing is blocked for any non-admin role while a document contains one (`blocks/guard.ts`) — see that module's header comment for why this is a publish-time guard, not a save-time one. */
export interface HtmlBlockData {
  html: string;
}

interface BlockOf<T extends BlockType, D> {
  id: string;
  type: T;
  data: D;
}

export type SimpleBlock =
  | BlockOf<"heading", HeadingBlockData>
  | BlockOf<"paragraph", ParagraphBlockData>
  | BlockOf<"image", ImageBlockData>
  | BlockOf<"gallery", GalleryBlockData>
  | BlockOf<"quote", QuoteBlockData>
  | BlockOf<"callout", CalloutBlockData>
  | BlockOf<"code", CodeBlockData>
  | BlockOf<"divider", DividerBlockData>
  | BlockOf<"metrics", MetricsBlockData>
  | BlockOf<"timeline", TimelineBlockData>
  | BlockOf<"video", VideoBlockData>
  | BlockOf<"spacer", SpacerBlockData>
  | BlockOf<"markdown", MarkdownBlockData>
  | BlockOf<"html", HtmlBlockData>;

export interface TwoColumnBlockData {
  left: SimpleBlock[];
  right: SimpleBlock[];
}

export type Block = SimpleBlock | BlockOf<"twoColumn", TwoColumnBlockData>;
