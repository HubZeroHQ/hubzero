import { ArrowUpRight, TrendingDown, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Container } from "@/components/ui/container";
import { SuccessIcon, WarningIcon, type IconProps } from "@/components/ui/icons";
import { Lightbox } from "@/components/marketing/blocks/lightbox";
import { MediaImage } from "@/components/marketing/media-image";
import { RichText } from "@/components/marketing/rich-text";
import { highlightCode } from "@/lib/cms/blocks/syntax-highlight";
import type { ResolvedImage } from "@/lib/cms/public-content";
import type {
  Block,
  CalloutTone,
  ImageWidth,
  MetricTrend,
  SimpleBlock,
  TwoColumnRatio,
} from "@/lib/cms/blocks/types";
import { cn } from "@/lib/utils";

export interface BlockRendererProps {
  block: Block;
  /** Pre-resolved `Media` lookup — `ContentRenderer` batches this once for the whole tree, never per-block. */
  media: Record<string, ResolvedImage>;
  /** True for a block rendered inside a `twoColumn` column — the column's own grid cell already provides the horizontal container, so a nested block skips wrapping itself in a second, redundant `<Container>`. */
  bare?: boolean;
}

function Wrap({
  size,
  bare,
  children,
}: {
  size: "prose" | "default" | "full";
  bare?: boolean;
  children: ReactNode;
}) {
  if (bare) return <>{children}</>;
  return <Container size={size}>{children}</Container>;
}

const containerSizeForWidth: Record<ImageWidth, "prose" | "default" | "full"> = {
  content: "prose",
  wide: "default",
  full: "full",
};

// Left-edge hairline rule in the relevant semantic color, no filled
// background — a real engineering-document margin annotation, not a
// consumer-app alert banner (DESIGN/V3/06_COMPONENT_LANGUAGE.md §11).
const calloutToneClasses: Record<CalloutTone, string> = {
  note: "border-border-muted text-text-muted",
  info: "border-info text-info",
  success: "border-success text-success",
  warning: "border-warning text-warning",
};

const calloutToneLabels: Record<CalloutTone, string> = {
  note: "Note",
  info: "Info",
  success: "Success",
  warning: "Warning",
};

// Only `success`/`warning` have an approved shape in the trace-geometry icon
// set's minimum vocabulary (14_VISUAL_TOKENS.md §6 — "Success/error/warning")
// — `note`/`info` render without an icon rather than reaching for a
// lucide-react circle the geometric icon language explicitly excludes
// ("no curves, no circles as primitives"). Color is never the only signal
// either way — the mono tag label above always names the tone.
const calloutToneIcons: Partial<Record<CalloutTone, (props: IconProps) => ReactNode>> = {
  success: SuccessIcon,
  warning: WarningIcon,
};

const spacerHeight: Record<string, string> = {
  sm: "h-8",
  md: "h-16",
  lg: "h-28",
};

const metricTrendIcons: Record<MetricTrend, LucideIcon | null> = {
  up: TrendingUp,
  down: TrendingDown,
  flat: null,
};

const metricTrendClasses: Record<MetricTrend, string> = {
  up: "text-success",
  down: "text-danger",
  flat: "text-text-muted",
};

const twoColumnGridClasses: Record<TwoColumnRatio, string> = {
  "50-50": "md:grid-cols-2",
  "60-40": "md:grid-cols-[3fr_2fr]",
  "40-60": "md:grid-cols-[2fr_3fr]",
  "70-30": "md:grid-cols-[7fr_3fr]",
  "30-70": "md:grid-cols-[3fr_7fr]",
};

/** YouTube/Vimeo/Loom URLs become an embed; anything else falls back to a plain link — never an iframe pointed at an untrusted domain. */
function toEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (parsed.hostname === "youtu.be") {
      return `https://www.youtube-nocookie.com/embed/${parsed.pathname.slice(1)}`;
    }
    if (parsed.hostname.includes("vimeo.com")) {
      const id = parsed.pathname.split("/").filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
    if (parsed.hostname === "www.loom.com" || parsed.hostname === "loom.com") {
      const id = parsed.pathname.split("/").filter(Boolean).pop();
      return id ? `https://www.loom.com/embed/${id}` : null;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Renders one block — the public counterpart to
 * `components/admin/blocks/block-data-editor.tsx`, a switch rather than a
 * per-type component registry (the same reasoning `cms-field.tsx`'s header
 * comment gives). No page imports this directly for a single field the way
 * the old `<RichText>{doc.problem}</RichText>` pattern worked — pages render
 * `<ContentRenderer blocks={doc.content} />` and stay small
 * (`ARCHITECTURE/20_CONTENT_BLOCKS.md` §7).
 *
 * An async Server Component (`code` shells out to `highlightCode`, a Shiki
 * render) — Next.js awaits async components anywhere in a Server Component
 * tree, including ones produced by `.map()` in `ContentRenderer`, so no
 * caller needs to change for this.
 */
export async function BlockRenderer({ block, media, bare }: BlockRendererProps) {
  switch (block.type) {
    case "heading": {
      const Tag = block.data.level === 3 ? "h3" : "h2";
      return (
        <Wrap size="prose" bare={bare}>
          <Tag
            className={
              block.data.level === 3
                ? "text-h3 text-text font-normal"
                : "text-h2 text-text font-normal"
            }
          >
            {block.data.text}
          </Tag>
        </Wrap>
      );
    }

    case "paragraph":
      return (
        <Wrap size="prose" bare={bare}>
          <RichText>{block.data.text}</RichText>
        </Wrap>
      );

    case "markdown":
      return (
        <Wrap size="prose" bare={bare}>
          <RichText>{block.data.markdown}</RichText>
        </Wrap>
      );

    case "quote":
      return (
        <Wrap size="prose" bare={bare}>
          {/* No decorative oversized quotation-mark glyph
              (DESIGN/V3/06_COMPONENT_LANGUAGE.md §10) — the hairline rule and
              the serif italic line carry "this is a quote" on their own.
              1px, not 2px — 2px is reserved for focus rings alone
              (14_VISUAL_TOKENS.md §4). */}
          <blockquote className="border-accent relative border-l py-1 pl-8">
            <p className="text-h2 text-text relative font-serif leading-tight italic">
              {block.data.text}
            </p>
            {(block.data.attribution || block.data.role) && (
              <footer className="text-caption text-text-muted mt-5 flex items-center gap-2 font-mono not-italic">
                <span className="bg-accent/40 h-px w-6" aria-hidden="true" />
                {block.data.attribution}
                {block.data.attribution && block.data.role && (
                  <span className="text-text-muted/60">— {block.data.role}</span>
                )}
                {!block.data.attribution && block.data.role}
              </footer>
            )}
          </blockquote>
        </Wrap>
      );

    case "callout": {
      const ToneIcon = calloutToneIcons[block.data.tone];
      return (
        <Wrap size="prose" bare={bare}>
          {/* 1px hairline, not 2px — 2px is reserved for focus rings alone
              (14_VISUAL_TOKENS.md §4). */}
          <div className={cn("border-l py-1 pl-6", calloutToneClasses[block.data.tone])}>
            <div className="flex items-center gap-2">
              {ToneIcon && <ToneIcon className="size-3.5" aria-hidden="true" />}
              <span className="text-caption font-mono tracking-wide uppercase">
                {calloutToneLabels[block.data.tone]}
              </span>
            </div>
            <div className="text-text mt-2">
              {block.data.title && <p className="font-medium">{block.data.title}</p>}
              <p className={cn("text-body text-text-muted", block.data.title && "mt-1")}>
                {block.data.text}
              </p>
            </div>
          </div>
        </Wrap>
      );
    }

    case "image": {
      const resolved = media[block.data.media];
      if (!resolved) return null;
      const alignClass =
        block.data.align === "left"
          ? "mr-auto"
          : block.data.align === "right"
            ? "ml-auto"
            : "mx-auto";

      const figure = (
        <figure className={cn("w-full", block.data.width !== "full" && alignClass)}>
          <Lightbox
            images={[resolved]}
            initialIndex={0}
            trigger={
              <button type="button" className="block w-full cursor-zoom-in">
                <MediaImage
                  src={resolved.url}
                  alt={resolved.alt}
                  width={resolved.width ?? 1600}
                  height={resolved.height ?? 900}
                  sizes={block.data.width === "full" ? "100vw" : "(min-width: 1024px) 72rem, 92vw"}
                  className="h-auto w-full"
                />
              </button>
            }
          />
          {block.data.caption && (
            <figcaption className="text-caption text-text-muted mt-3">
              {block.data.caption}
            </figcaption>
          )}
        </figure>
      );

      // True full-bleed: escapes the page's own max-width/padding rather
      // than only relaxing to `Container size="full"` (which still keeps a
      // horizontal gutter, `container.tsx`'s own doc comment) — the standard
      // "break out of a centered, padded parent" technique.
      if (block.data.width === "full" && !bare) {
        return <div className="relative left-1/2 w-screen -translate-x-1/2">{figure}</div>;
      }

      return (
        <Wrap size={bare ? "prose" : containerSizeForWidth[block.data.width]} bare={bare}>
          {figure}
        </Wrap>
      );
    }

    case "gallery": {
      const images = block.data.media
        .map((id) => media[id])
        .filter((img): img is ResolvedImage => Boolean(img));
      if (images.length === 0) return null;
      const layout = block.data.layout ?? "grid";
      // A denser grid earns its keep once there's enough images to fill a
      // third column without starving any of them — below that, two large
      // images read better than three cramped ones.
      const gridColsClass = images.length >= 5 ? "sm:grid-cols-3" : "sm:grid-cols-2";

      return (
        <Wrap size="default" bare={bare}>
          {layout === "masonry" ? (
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4 [&>*]:break-inside-avoid">
              {images.map((image, index) => (
                <Lightbox
                  key={`${image.url}-${index}`}
                  images={images}
                  initialIndex={index}
                  trigger={
                    <button
                      type="button"
                      className="block w-full cursor-zoom-in overflow-hidden rounded-lg"
                    >
                      <MediaImage
                        src={image.url}
                        alt={image.alt}
                        width={image.width ?? 1200}
                        height={image.height ?? 800}
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 92vw"
                        className="w-full transition-transform duration-300 hover:scale-[1.03]"
                      />
                    </button>
                  }
                />
              ))}
            </div>
          ) : (
            // Contact-sheet grid — consistent 1:1 crop and a numbered
            // caption per cell, not a lightbox-first carousel presentation
            // (06_COMPONENT_LANGUAGE.md §16, 14_VISUAL_TOKENS.md §7).
            <div className={cn("grid grid-cols-1 gap-4", gridColsClass)}>
              {images.map((image, index) => (
                <div key={`${image.url}-${index}`} className="flex flex-col gap-2">
                  <Lightbox
                    images={images}
                    initialIndex={index}
                    trigger={
                      <button
                        type="button"
                        className="bg-bg-light block aspect-square w-full cursor-zoom-in overflow-hidden"
                      >
                        <MediaImage
                          src={image.url}
                          alt={image.alt}
                          width={image.width ?? 1200}
                          height={image.height ?? 800}
                          sizes="(min-width: 640px) 50vw, 92vw"
                          className="h-full w-full object-cover transition-opacity duration-150 hover:opacity-90"
                        />
                      </button>
                    }
                  />
                  <p className="text-caption text-text-muted font-mono">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                </div>
              ))}
            </div>
          )}
          {block.data.caption && (
            <p className="text-caption text-text-muted mt-3">{block.data.caption}</p>
          )}
        </Wrap>
      );
    }

    case "video": {
      const embedUrl = toEmbedUrl(block.data.url);
      return (
        <Wrap size="default" bare={bare}>
          {embedUrl ? (
            <div className="border-border-muted aspect-video w-full overflow-hidden rounded-lg border">
              <iframe
                src={embedUrl}
                title={block.data.caption ?? "Embedded video"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          ) : (
            <a
              href={block.data.url}
              target="_blank"
              rel="noreferrer"
              className="text-accent-text inline-flex items-center gap-2 underline underline-offset-2"
            >
              Watch the video <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
          )}
          {block.data.caption && (
            <p className="text-caption text-text-muted mt-3">{block.data.caption}</p>
          )}
        </Wrap>
      );
    }

    case "metrics":
      return (
        <Wrap size="default" bare={bare}>
          <div className="border-border-muted grid grid-cols-2 gap-6 border-y py-8 sm:grid-cols-4">
            {block.data.items.map((item, index) => {
              const TrendIcon = item.trend ? metricTrendIcons[item.trend] : null;
              return (
                <div key={index}>
                  <p className="text-h2 text-text flex items-center gap-2 font-mono font-normal">
                    {item.value}
                    {TrendIcon && (
                      <TrendIcon
                        className={cn("size-5", item.trend && metricTrendClasses[item.trend])}
                        aria-hidden="true"
                      />
                    )}
                  </p>
                  <p className="text-caption text-text-muted mt-1">{item.label}</p>
                </div>
              );
            })}
          </div>
        </Wrap>
      );

    case "timeline":
      return (
        <Wrap size="prose" bare={bare}>
          <ol className="flex flex-col gap-8">
            {block.data.items.map((item, index) => (
              // 1px connector, not 2px — 2px is reserved for focus rings
              // alone (14_VISUAL_TOKENS.md §4).
              <li key={index} className="border-border-muted relative border-l pl-6">
                {/* A filled square node, echoing a schematic junction — not a
                    round dot on a smooth line (06_COMPONENT_LANGUAGE.md §12). */}
                <span
                  className="bg-accent absolute top-1.5 -left-[5px] size-2 rotate-45"
                  aria-hidden="true"
                />
                <p className="text-caption text-text-muted font-mono">{item.date}</p>
                <p className="text-body text-text mt-1 font-medium">{item.title}</p>
                {item.description && (
                  <p className="text-body text-text-muted mt-1">{item.description}</p>
                )}
              </li>
            ))}
          </ol>
        </Wrap>
      );

    case "table":
      return (
        <Wrap size="default" bare={bare}>
          <div className="border-border-muted overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[32rem] border-collapse text-left">
              <thead>
                {/* No heavy header-row fill (06_COMPONENT_LANGUAGE.md §9) — the
                    hairline bottom border alone marks it as a header row. */}
                <tr className="border-border-muted border-b">
                  {block.data.headers.map((header, index) => (
                    <th key={index} className="text-caption text-text px-4 py-3 font-medium">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-border-muted divide-y">
                {block.data.rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="text-body text-text-muted px-4 py-3">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {block.data.caption && (
            <p className="text-caption text-text-muted mt-3">{block.data.caption}</p>
          )}
        </Wrap>
      );

    case "divider":
      return (
        <Wrap size="prose" bare={bare}>
          <hr className="border-border-muted" />
        </Wrap>
      );

    case "spacer":
      return <div className={spacerHeight[block.data.size]} aria-hidden="true" />;

    case "code": {
      const highlighted = await highlightCode(block.data.code, block.data.language);
      return (
        <Wrap size="default" bare={bare}>
          <div className="border-border-muted overflow-hidden rounded-lg border">
            {block.data.filename && (
              <p className="text-caption text-text-muted border-border-muted bg-bg-light border-b px-4 py-2 font-mono">
                {block.data.filename}
              </p>
            )}
            <div
              className="[&_pre]:overflow-x-auto [&_pre]:p-4 [&_pre]:text-sm"
              // Shiki's own static HTML output — generated server-side from
              // this document's stored `code` string, never user-submitted
              // input at request time (`schema.ts`'s `codeBlockSchema` caps
              // it at 20k chars, and only Studio authors with a `content`
              // field grant can write it).
              dangerouslySetInnerHTML={{ __html: highlighted }}
            />
          </div>
        </Wrap>
      );
    }

    case "html":
      return (
        <Wrap size="default" bare={bare}>
          {/* Admin-only in practice — publishing is blocked for non-admin authors while this block is present (`lib/cms/blocks/guard.ts`). Trusted internal-team content, not user-submitted input. */}
          <div dangerouslySetInnerHTML={{ __html: block.data.html }} />
        </Wrap>
      );

    case "twoColumn": {
      const ratio = block.data.ratio ?? "50-50";
      return (
        <Wrap size="default" bare={bare}>
          <div className={cn("grid grid-cols-1 gap-8", twoColumnGridClasses[ratio])}>
            <div className="flex flex-col gap-8">
              {block.data.left.map((child: SimpleBlock) => (
                <BlockRenderer key={child.id} block={child} media={media} bare />
              ))}
            </div>
            <div className="flex flex-col gap-8">
              {block.data.right.map((child: SimpleBlock) => (
                <BlockRenderer key={child.id} block={child} media={media} bare />
              ))}
            </div>
          </div>
        </Wrap>
      );
    }

    default: {
      // Exhaustiveness guard: a 17th `BlockType` that forgets a case here
      // fails the build instead of silently rendering nothing on the public site.
      const exhaustive: never = block;
      return exhaustive;
    }
  }
}
