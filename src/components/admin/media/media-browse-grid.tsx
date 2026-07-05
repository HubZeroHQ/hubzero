"use client";

import { useEffect, useState, useTransition } from "react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { MediaThumbnail } from "@/components/admin/media/media-thumbnail";
import { searchMediaAction } from "@/actions/studio/media";
import type { ClientMedia } from "@/lib/cms/media";

export interface MediaBrowseGridProps {
  /** Clicking a thumbnail selects it — the picker modal's "choose existing" tab. Omit for a pure browsing library. */
  onSelect?: (media: ClientMedia) => void;
  /** Extra controls rendered under each item (e.g. the library page's delete button). */
  renderItemActions?: (media: ClientMedia) => ReactNode;
  /** Bump this to force a refetch from the first page — e.g. right after an upload or a delete. */
  refreshKey?: number;
}

/**
 * The searchable media grid shared by `<MediaPickerModal>`'s "choose
 * existing" tab and the `/studio/media` library page — one fetch/search/
 * pagination implementation, not two, since both screens need the identical
 * "browse what's already uploaded" behavior.
 */
export function MediaBrowseGrid({ onSelect, renderItemActions, refreshKey }: MediaBrowseGridProps) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<ClientMedia[]>([]);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [hasNext, setHasNext] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [isPending, startTransition] = useTransition();

  function load(q: string, nextCursor?: string, append = false) {
    startTransition(async () => {
      const result = await searchMediaAction({ q: q || undefined, cursor: nextCursor });
      setItems((prev) => (append ? [...prev, ...result.items] : result.items));
      setHasNext(result.hasNext);
      setCursor(result.nextCursor);
      setHasLoadedOnce(true);
    });
  }

  useEffect(() => {
    load(query);
    // Only re-runs on mount and when the caller bumps `refreshKey` — an
    // in-progress search query shouldn't reset itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  return (
    <div className="flex flex-col gap-4">
      <Input
        placeholder="Search by alt text, caption, or filename"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            load(query);
          }
        }}
        onBlur={() => load(query)}
      />

      {hasLoadedOnce && items.length === 0 ? (
        <EmptyState
          title="No media found"
          description={query ? "No files match that search." : "Upload a file to get started."}
        />
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {items.map((media) => (
            <div key={media.id} className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => onSelect?.(media)}
                disabled={!onSelect}
                className="focus-visible:ring-accent block rounded-md text-left focus-visible:ring-2 focus-visible:outline-none disabled:cursor-default"
              >
                <MediaThumbnail media={media} className="aspect-square w-full" />
              </button>
              <Text size="caption" tone="muted" className="truncate" title={media.alt}>
                {media.alt}
              </Text>
              {renderItemActions?.(media)}
            </div>
          ))}
        </div>
      )}

      {hasNext && (
        <Button variant="secondary" isLoading={isPending} onClick={() => load(query, cursor, true)}>
          Load more
        </Button>
      )}
    </div>
  );
}
