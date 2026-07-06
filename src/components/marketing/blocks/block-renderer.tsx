import { AlertTriangle, ArrowUpRight, CheckCircle2, Info, Pin } from "lucide-react";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Container } from "@/components/ui/container";
import { RichText } from "@/components/marketing/rich-text";
import type { ResolvedImage } from "@/lib/cms/public-content";
import type { Block, CalloutTone, ImageWidth, SimpleBlock } from "@/lib/cms/blocks/types";
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

const calloutToneClasses: Record<CalloutTone, string> = {
  note: "border-border-muted bg-bg-light text-text-muted",
  info: "border-info/30 bg-info/10 text-info",
  success: "border-success/30 bg-success/10 text-success",
  warning: "border-warning/30 bg-warning/10 text-warning",
};

/** Matches `components/ui/alert.tsx`'s tone→icon convention — color is never the only signal here either. */
const calloutToneIcons: Record<CalloutTone, LucideIcon> = {
  note: Pin,
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
};

const spacerHeight: Record<string, string> = {
  sm: "h-8",
  md: "h-16",
  lg: "h-28",
};

/** YouTube/Vimeo URLs become an embed; anything else falls back to a plain link — never a broken iframe. */
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
 */
export function BlockRenderer({ block, media, bare }: BlockRendererProps) {
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
          <blockquote className="border-accent relative border-l-2 pl-6">
            <span
              className="text-accent/20 font-serif text-6xl leading-none select-none"
              aria-hidden="true"
            >
              &ldquo;
            </span>
            <p className="text-h3 text-text -mt-4 font-serif italic">{block.data.text}</p>
            {(block.data.attribution || block.data.role) && (
              <footer className="text-caption text-text-muted mt-4 font-mono not-italic">
                {block.data.attribution}
                {block.data.attribution && block.data.role && " — "}
                {block.data.role}
              </footer>
            )}
          </blockquote>
        </Wrap>
      );

    case "callout": {
      const ToneIcon = calloutToneIcons[block.data.tone];
      return (
        <Wrap size="prose" bare={bare}>
          <div
            className={cn("flex gap-3 rounded-lg border p-5", calloutToneClasses[block.data.tone])}
          >
            <ToneIcon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
            <p className="text-body">{block.data.text}</p>
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
      return (
        <Wrap size={bare ? "prose" : containerSizeForWidth[block.data.width]} bare={bare}>
          <figure className={cn("w-full", block.data.width !== "full" && alignClass)}>
            <Image
              src={resolved.url}
              alt={resolved.alt}
              width={resolved.width ?? 1600}
              height={resolved.height ?? 900}
              sizes={block.data.width === "full" ? "100vw" : "(min-width: 1024px) 72rem, 92vw"}
              className="h-auto w-full"
            />
            {block.data.caption && (
              <figcaption className="text-caption text-text-muted mt-3">
                {block.data.caption}
              </figcaption>
            )}
          </figure>
        </Wrap>
      );
    }

    case "gallery": {
      const images = block.data.media
        .map((id) => media[id])
        .filter((img): img is ResolvedImage => Boolean(img));
      if (images.length === 0) return null;
      // A denser grid earns its keep once there's enough images to fill a
      // third column without starving any of them — below that, two large
      // images read better than three cramped ones.
      const gridColsClass = images.length >= 5 ? "sm:grid-cols-3" : "sm:grid-cols-2";
      return (
        <Wrap size="default" bare={bare}>
          <div className={cn("grid grid-cols-1 gap-4", gridColsClass)}>
            {images.map((image, index) => (
              <div key={`${image.url}-${index}`} className="overflow-hidden rounded-lg">
                <Image
                  src={image.url}
                  alt={image.alt}
                  width={image.width ?? 1200}
                  height={image.height ?? 800}
                  sizes="(min-width: 640px) 50vw, 92vw"
                  className="h-auto w-full transition-transform duration-300 hover:scale-[1.03]"
                />
              </div>
            ))}
          </div>
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
              className="text-accent inline-flex items-center gap-2 underline underline-offset-2"
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
            {block.data.items.map((item, index) => (
              <div key={index}>
                <p className="text-h2 text-text font-mono font-normal">{item.value}</p>
                <p className="text-caption text-text-muted mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </Wrap>
      );

    case "timeline":
      return (
        <Wrap size="prose" bare={bare}>
          <ol className="flex flex-col gap-8">
            {block.data.items.map((item, index) => (
              <li key={index} className="border-border-muted relative border-l-2 pl-6">
                <span
                  className="border-accent bg-bg absolute top-1 -left-[5px] size-2 rounded-full border-2"
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

    case "divider":
      return (
        <Wrap size="prose" bare={bare}>
          <hr className="border-border-muted" />
        </Wrap>
      );

    case "spacer":
      return <div className={spacerHeight[block.data.size]} aria-hidden="true" />;

    case "code":
      return (
        <Wrap size="default" bare={bare}>
          <div className="border-border-muted bg-bg-light overflow-hidden rounded-lg border">
            {block.data.filename && (
              <p className="text-caption text-text-muted border-border-muted border-b px-4 py-2 font-mono">
                {block.data.filename}
              </p>
            )}
            <pre className="overflow-x-auto p-4">
              <code className="text-caption text-text font-mono">{block.data.code}</code>
            </pre>
          </div>
        </Wrap>
      );

    case "html":
      return (
        <Wrap size="default" bare={bare}>
          {/* Admin-only in practice — publishing is blocked for non-admin authors while this block is present (`lib/cms/blocks/guard.ts`). Trusted internal-team content, not user-submitted input. */}
          <div dangerouslySetInnerHTML={{ __html: block.data.html }} />
        </Wrap>
      );

    case "twoColumn":
      return (
        <Wrap size="default" bare={bare}>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
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

    default: {
      // Exhaustiveness guard: a 16th `BlockType` that forgets a case here
      // fails the build instead of silently rendering nothing on the public site.
      const exhaustive: never = block;
      return exhaustive;
    }
  }
}
