'use client';

import { ImageOff } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { MediaAssetDTO } from '@/lib/media/dto';
import { cn } from '@/lib/utils/cn';
import { formatBytes } from '@/lib/utils/format-bytes';

/**
 * CMS_PRODUCT_DESIGN.md §6 — "a grid picker... with hover metadata
 * (dimensions, reuse count) and inline upload," the one place Media departs
 * from the table-first convention (§4) because images are inherently
 * visual. Reused by both the Media Library's own grid view and
 * `MediaPicker` — a card either navigates (`href`) or selects
 * (`onSelect`), never both, so the two call sites don't have to fight over
 * what a click means.
 */
export function MediaCard({
  asset,
  href,
  onSelect,
  selected,
}: {
  asset: MediaAssetDTO;
  href?: string;
  onSelect?: (asset: MediaAssetDTO) => void;
  selected?: boolean;
}) {
  const body = (
    <>
      <div className="bg-surface-default relative aspect-square w-full overflow-hidden">
        {asset.width && asset.height ? (
          <Image
            src={asset.url}
            alt={asset.altText}
            fill
            sizes="(min-width: 1024px) 200px, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="text-text-muted flex h-full w-full items-center justify-center">
            <ImageOff className="h-6 w-6" aria-hidden />
          </div>
        )}
      </div>
      <div className="border-border-muted flex flex-col gap-0.5 border-t px-2.5 py-2 text-left">
        <p className="text-text-primary truncate text-xs font-medium">
          {asset.originalFilename ?? asset.altText}
        </p>
        <p className="text-text-muted font-mono text-[10px] tracking-[0.05em] uppercase">
          {asset.width && asset.height ? `${asset.width}×${asset.height}` : 'Unknown size'}
          {asset.fileSizeBytes ? ` · ${formatBytes(asset.fileSizeBytes)}` : ''}
        </p>
      </div>
    </>
  );

  const className = cn(
    'rounded-card border-border-default group flex flex-col overflow-hidden border text-left',
    'hover:border-border-strong duration-fast ease-standard transition-colors',
    selected ? 'border-accent ring-accent ring-1' : undefined,
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {body}
      </Link>
    );
  }

  return (
    <button type="button" onClick={() => onSelect?.(asset)} className={className}>
      {body}
    </button>
  );
}
