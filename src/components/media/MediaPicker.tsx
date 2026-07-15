'use client';

import { useEffect, useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import type { MediaAssetDTO } from '@/lib/media/dto';
import { searchMediaAction } from '@/lib/studio/actions/media';
import { cn } from '@/lib/utils/cn';
import { MEDIA_FOLDERS } from '@/lib/validation/media';
import type { MediaFolder } from '@/types/studio';
import { MediaGrid } from './MediaGrid';
import { MediaUploadDropzone } from './MediaUploadDropzone';

/**
 * The one reusable Media Picker every collection consumes
 * (CMS_PRODUCT_DESIGN.md §5/§6 — "the Document Engine should consume this
 * component rather than implementing its own media UI... future
 * collections should reuse it without modification"). Search/filter/
 * preview/upload/select, all in one dialog; selecting an asset (existing
 * or freshly uploaded) always just calls `onSelect` and closes — the
 * caller decides what "selected" means for its own field (an image
 * block's `mediaId`, a hero image reference, a portrait).
 */
export function MediaPicker({
  open,
  onOpenChange,
  onSelect,
  defaultFolder = 'general',
  initialTab = 'browse',
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (asset: MediaAssetDTO) => void;
  defaultFolder?: MediaFolder;
  initialTab?: 'browse' | 'upload';
}) {
  const [tab, setTab] = useState<'browse' | 'upload'>(initialTab);
  const [query, setQuery] = useState('');
  const [folder, setFolder] = useState<MediaFolder | undefined>(undefined);
  const [results, setResults] = useState<MediaAssetDTO[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    setLoading(true);
    const timeout = setTimeout(() => {
      searchMediaAction({ query, folder })
        .then(setResults)
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 200);
    return () => clearTimeout(timeout);
  }, [open, query, folder]);

  useEffect(() => {
    if (open) {
      setTab(initialTab);
    }
  }, [open, initialTab]);

  function handleSelect(asset: MediaAssetDTO) {
    onSelect(asset);
    onOpenChange(false);
  }

  function handleUploaded(assets: MediaAssetDTO[]) {
    const [first] = assets;
    if (first) {
      handleSelect(first);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Media Library"
      description="Choose an existing asset or upload a new one."
      widthClassName="max-w-[720px]"
    >
      <div className="flex flex-col gap-4">
        <div
          role="tablist"
          aria-label="Media source"
          className="border-border-muted flex gap-1.5 border-b pb-3"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'browse'}
            onClick={() => setTab('browse')}
            className={tabClass(tab === 'browse')}
          >
            Browse
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'upload'}
            onClick={() => setTab('upload')}
            className={tabClass(tab === 'upload')}
          >
            Upload
          </button>
        </div>

        {tab === 'browse' ? (
          <div className="flex flex-col gap-3">
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by filename, alt text, or tag…"
              aria-label="Search media"
            />
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by folder">
              <button
                type="button"
                onClick={() => setFolder(undefined)}
                className={chipClass(!folder)}
              >
                All
              </button>
              {MEDIA_FOLDERS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFolder(option)}
                  className={chipClass(folder === option)}
                >
                  {option}
                </button>
              ))}
            </div>

            {loading ? (
              <p className="text-text-muted py-8 text-center text-sm">Searching…</p>
            ) : results.length === 0 ? (
              <EmptyState
                title="No media found."
                description="Try a different search term, or switch to Upload to add a new asset."
              />
            ) : (
              <MediaGrid assets={results} onSelect={handleSelect} />
            )}
          </div>
        ) : (
          <MediaUploadDropzone folder={defaultFolder} onUploaded={handleUploaded} />
        )}
      </div>
    </Dialog>
  );
}

function tabClass(active: boolean): string {
  return cn(
    'rounded-control duration-fast ease-standard px-3 py-1.5 text-sm font-medium transition-colors',
    active ? 'bg-surface-elevated text-text-primary' : 'text-text-muted hover:text-text-secondary',
  );
}

function chipClass(active: boolean): string {
  return cn(
    'duration-fast ease-standard inline-flex items-center rounded-full border px-3 py-1 font-mono text-[11px] tracking-[0.05em] uppercase transition-colors active:scale-95',
    active
      ? 'border-accent bg-accent-subtle text-accent'
      : 'border-border-default text-text-secondary hover:bg-surface-elevated',
  );
}
