import type { MediaAssetDTO } from '@/lib/media/dto';
import { MediaCard } from './MediaCard';

/** DESIGN_SYSTEM.md §4 Grid — `auto-fit`/`minmax()` so the grid reflows naturally from 1 to N columns. */
export function MediaGrid({
  assets,
  getHref,
  onSelect,
  selectedId,
}: {
  assets: MediaAssetDTO[];
  getHref?: (asset: MediaAssetDTO) => string;
  onSelect?: (asset: MediaAssetDTO) => void;
  selectedId?: string;
}) {
  return (
    <div
      className="grid gap-3"
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}
    >
      {assets.map((asset) => (
        <MediaCard
          key={asset.id}
          asset={asset}
          href={getHref?.(asset)}
          onSelect={onSelect}
          selected={selectedId === asset.id}
        />
      ))}
    </div>
  );
}
