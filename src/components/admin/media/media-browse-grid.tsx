"use client";

import { useEffect, useState, useTransition } from "react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { MediaThumbnail } from "@/components/admin/media/media-thumbnail";
import { searchMediaAction } from "@/actions/studio/media";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import type { MediaSort } from "@/lib/cms/media";
import type { ClientMedia } from "@/lib/cms/media";
import type { MediaResourceType } from "@/lib/cms/storage/adapter";
import { cn } from "@/lib/utils";

export interface MediaBrowseGridProps {
  /** Clicking a thumbnail selects it — the picker modal's "choose existing" tab. Mutually exclusive with `onOpenDetail`. */
  onSelect?: (media: ClientMedia) => void;
  /** Clicking a thumbnail opens the detail drawer instead — the `/studio/media` library's browsing mode. */
  onOpenDetail?: (media: ClientMedia) => void;
  /** Extra controls rendered under each item (e.g. the library page's delete button). */
  renderItemActions?: (media: ClientMedia) => ReactNode;
  /** Bump this to force a refetch from page 1 — e.g. right after an upload, delete, or bulk action. */
  refreshKey?: number;
  /** Library-only: checkbox-based multi-select for bulk actions. */
  selectedIds?: Set<string>;
  onToggleSelected?: (id: string) => void;
  /** Library-only: folder filter, provided by the parent's folder picker so the toolbar and the grid share one source of truth. */
  folder?: string;
  showFilters?: boolean;
}

const sortOptions = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "largest", label: "Largest first" },
  { value: "name", label: "Name (A–Z)" },
];

const resourceTypeOptions = [
  { value: "all", label: "All types" },
  { value: "image", label: "Images" },
  { value: "raw", label: "Documents" },
];

/**
 * The searchable media grid shared by `<MediaPickerModal>`'s "choose
 * existing" tab and the `/studio/media` library page — one fetch/search/
 * pagination implementation, not two, since both screens need the identical
 * "browse what's already uploaded" behavior. Library-only features (sort,
 * type filter, multi-select) are opt-in via props so the picker's simpler
 * usage doesn't have to think about them.
 */
export function MediaBrowseGrid({
  onSelect,
  onOpenDetail,
  renderItemActions,
  refreshKey,
  selectedIds,
  onToggleSelected,
  folder,
  showFilters = false,
}: MediaBrowseGridProps) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<MediaSort>("newest");
  const [resourceType, setResourceType] = useState<string>("all");
  const [items, setItems] = useState<ClientMedia[]>([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const debouncedQuery = useDebouncedValue(query, 300);

  function load(targetPage: number, append = false) {
    startTransition(async () => {
      try {
        const result = await searchMediaAction({
          q: debouncedQuery || undefined,
          folder,
          resourceType: resourceType === "all" ? undefined : (resourceType as MediaResourceType),
          sort,
          page: targetPage,
        });
        setItems((prev) => (append ? [...prev, ...result.items] : result.items));
        setHasNext(result.hasNext);
        setPage(result.page);
        setHasLoadedOnce(true);
        setError(null);
      } catch {
        setError("Couldn't load media. Please try again.");
        setHasLoadedOnce(true);
      }
    });
  }

  useEffect(() => {
    load(1);
    // Re-runs on every debounced keystroke, filter change, and when the
    // caller bumps `refreshKey` (e.g. right after an upload).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, sort, resourceType, folder, refreshKey]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Search by alt text, caption, or filename"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="sm:flex-1"
        />
        {showFilters && (
          <div className="flex gap-2">
            <Select
              options={sortOptions}
              value={sort}
              onValueChange={(value) => setSort(value as MediaSort)}
              className="w-40"
            />
            <Select
              options={resourceTypeOptions}
              value={resourceType}
              onValueChange={setResourceType}
              className="w-36"
            />
          </div>
        )}
      </div>

      {error && <EmptyState title="Something went wrong" description={error} />}

      {!error && !hasLoadedOnce && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="aspect-square w-full rounded-md" />
          ))}
        </div>
      )}

      {!error && hasLoadedOnce && items.length === 0 && (
        <EmptyState
          title="No media found"
          description={
            query || folder ? "Nothing matches these filters." : "Upload a file to get started."
          }
        />
      )}

      {!error && items.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {items.map((media) => {
            const isSelected = selectedIds?.has(media.id) ?? false;
            return (
              <div key={media.id} className="flex flex-col gap-1.5">
                <div className="relative">
                  {onToggleSelected && (
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onToggleSelected(media.id)}
                      aria-label={`Select "${media.alt}"`}
                      className="bg-bg absolute top-1.5 left-1.5 z-10"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => (onSelect ? onSelect(media) : onOpenDetail?.(media))}
                    className={cn(
                      "focus-visible:ring-accent block w-full rounded-md text-left focus-visible:ring-2 focus-visible:outline-none",
                      isSelected && "ring-accent ring-2",
                    )}
                  >
                    <MediaThumbnail media={media} className="aspect-square w-full" />
                  </button>
                </div>
                <Text size="caption" tone="muted" className="truncate" title={media.alt}>
                  {media.alt}
                </Text>
                {renderItemActions?.(media)}
              </div>
            );
          })}
        </div>
      )}

      {hasNext && (
        <Button variant="secondary" isLoading={isPending} onClick={() => load(page + 1, true)}>
          Load more
        </Button>
      )}
    </div>
  );
}
