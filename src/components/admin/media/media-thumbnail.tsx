"use client";

import { FileText, ImageOff } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import type { ClientMedia } from "@/lib/cms/media";

export interface MediaThumbnailProps {
  /** `undefined` renders a loading spinner (the id is set but the record hasn't resolved yet); `null` renders the "no image" state (nothing is set). */
  media: ClientMedia | null | undefined;
  className?: string;
}

/**
 * The one place a `Media` document becomes a rendered thumbnail — used by
 * the picker field, the picker modal's browse grid, and the library page
 * alike, so "which variant to render" (smallest available, falling back to
 * the original) is decided once.
 *
 * A `Media` document resolving successfully doesn't guarantee its bytes are
 * still on disk (local storage isn't shared across environments/deploys —
 * see `lib/cms/storage/local-adapter.ts`) — `onError` catches that case so a
 * stale reference degrades to a "missing asset" indicator instead of a
 * broken-image icon plus a repeating server-side 404/`next/image` error.
 */
export function MediaThumbnail({ media, className }: MediaThumbnailProps) {
  const [loadFailed, setLoadFailed] = useState(false);

  if (media === undefined) {
    return (
      <div
        className={cn(
          "bg-bg-light border-border-muted flex items-center justify-center rounded-md border",
          className,
        )}
      >
        <Spinner size="sm" label="Loading image…" />
      </div>
    );
  }

  if (!media) {
    return (
      <div
        className={cn(
          "bg-bg-light border-border-muted flex items-center justify-center rounded-md border",
          className,
        )}
      >
        <ImageOff aria-hidden="true" className="text-text-muted h-6 w-6" />
      </div>
    );
  }

  if (!media.mimeType.startsWith("image/")) {
    return (
      <div
        className={cn(
          "bg-bg-light border-border-muted flex flex-col items-center justify-center gap-1 rounded-md border",
          className,
        )}
      >
        <FileText aria-hidden="true" className="text-text-muted h-6 w-6" />
      </div>
    );
  }

  if (loadFailed) {
    return (
      <div
        className={cn(
          "bg-bg-light border-border-muted flex flex-col items-center justify-center gap-1 rounded-md border",
          className,
        )}
        title="This file's bytes are missing from storage — the Media record still exists, but the upload can't be found."
      >
        <ImageOff aria-hidden="true" className="text-text-muted h-6 w-6" />
        <span className="text-caption text-text-muted">Missing asset</span>
      </div>
    );
  }

  const smallestVariant = [...media.variants].sort((a, b) => a.width - b.width)[0];

  return (
    <div
      className={cn(
        "bg-bg-light border-border-muted relative overflow-hidden rounded-md border",
        className,
      )}
    >
      <Image
        src={smallestVariant?.url ?? media.url}
        alt={media.alt}
        fill
        sizes="200px"
        className="object-cover"
        unoptimized={media.mimeType === "image/gif"}
        onError={() => {
          console.warn(
            `[MediaThumbnail] "${media.originalName}" (${media.id}) has a Media record but its file is missing from storage — check the storage adapter's backing path.`,
          );
          setLoadFailed(true);
        }}
      />
    </div>
  );
}
