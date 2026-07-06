"use client";

import { ImageOff } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export type MediaImageProps = ComponentProps<typeof Image>;

/**
 * A `next/image` wrapper for CMS-sourced media on public pages. A `Media`
 * document resolving successfully doesn't guarantee its bytes are still on
 * disk — local storage isn't shared across environments or deploys
 * (`lib/cms/storage/local-adapter.ts`), so a stale reference 404s at request
 * time. `onError` degrades that to a quiet placeholder that preserves the
 * image's aspect ratio instead of a broken-image icon plus a repeating
 * server-side error, and logs once for whoever's watching the console.
 */
export function MediaImage({ className, style, alt, width, height, ...props }: MediaImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={cn(
          "bg-bg-light border-border-muted flex items-center justify-center border",
          className,
        )}
        style={{ ...style, aspectRatio: width && height ? `${width} / ${height}` : undefined }}
        role="img"
        aria-label={typeof alt === "string" && alt ? alt : "Image unavailable"}
      >
        <ImageOff aria-hidden="true" className="text-text-muted size-6" />
      </div>
    );
  }

  return (
    <Image
      {...props}
      width={width}
      height={height}
      alt={alt}
      className={className}
      style={style}
      onError={() => {
        console.warn(
          `[MediaImage] Failed to load "${typeof props.src === "string" ? props.src : "image"}" — the Media record may reference a file missing from storage.`,
        );
        setFailed(true);
      }}
    />
  );
}
