import { FileText, ImageOff } from "lucide-react";
import Image from "next/image";

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
 */
export function MediaThumbnail({ media, className }: MediaThumbnailProps) {
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
      />
    </div>
  );
}
