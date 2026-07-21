import { LayoutGrid, TableProperties } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { EntryTable, type EntryTableColumn } from '@/components/studio/collection/EntryTable';
import { FilterChip } from '@/components/studio/collection/FilterChip';
import { Pagination } from '@/components/studio/collection/Pagination';
import { PageHeader } from '@/components/studio/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { MediaGrid } from '@/components/media/MediaGrid';
import { MediaUploadLauncher } from '@/components/media/MediaUploadLauncher';
import { mediaRepository } from '@/lib/db/repositories/media';
import { toMediaAssetDTO, type MediaAssetDTO } from '@/lib/media/dto';
import { buildListHref, filterAndPaginate, parsePage } from '@/lib/studio/list-query';
import { formatBytes } from '@/lib/utils/format-bytes';
import { formatRelativeTime } from '@/lib/utils/relative-time';
import { MEDIA_FOLDERS } from '@/lib/validation/media';
import type { MediaFolder } from '@/types/studio';

export const metadata: Metadata = { title: 'Media — HubZero Studio' };

const MEDIA_LIST_PATH = '/studio/library/media';
type MediaSort = 'updated' | 'name' | 'size';

interface MediaSearchParams {
  q?: string;
  folder?: string;
  sort?: string;
  view?: string;
  page?: string;
  [key: string]: string | undefined;
}

const SORTERS: Record<MediaSort, (a: MediaAssetDTO, b: MediaAssetDTO) => number> = {
  updated: (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  name: (a, b) => (a.originalFilename ?? a.altText).localeCompare(b.originalFilename ?? b.altText),
  size: (a, b) => (b.fileSizeBytes ?? 0) - (a.fileSizeBytes ?? 0),
};

export default async function MediaLibraryPage({
  searchParams,
}: {
  searchParams: Promise<MediaSearchParams>;
}) {
  const params = await searchParams;
  const view = params.view === 'list' ? 'list' : 'grid';
  const sort: MediaSort =
    params.sort === 'name' || params.sort === 'size' ? params.sort : 'updated';

  const allAssets = await mediaRepository.list();
  const allDTOs = allAssets.map(toMediaAssetDTO);

  const result = filterAndPaginate<MediaAssetDTO>({
    entries: allDTOs,
    query: params.q,
    searchFields: (asset) => [asset.altText, asset.originalFilename ?? '', ...asset.reuseTags],
    predicates: [(asset) => (params.folder ? asset.folder === params.folder : true)],
    sort: SORTERS[sort],
    page: parsePage(params),
    pageSize: 30,
  });

  const hasAnyEntries = allDTOs.length > 0;
  const hasFiltersApplied = Boolean(params.q || params.folder);

  const columns: EntryTableColumn<MediaAssetDTO>[] = [
    {
      key: 'name',
      header: 'Asset',
      render: (asset) => asset.originalFilename ?? asset.altText,
    },
    {
      key: 'folder',
      header: 'Folder',
      render: (asset) => <span className="font-mono text-[11px] uppercase">{asset.folder}</span>,
    },
    {
      key: 'dimensions',
      header: 'Dimensions',
      render: (asset) => (asset.width && asset.height ? `${asset.width}×${asset.height}` : '—'),
    },
    {
      key: 'size',
      header: 'Size',
      render: (asset) => (asset.fileSizeBytes ? formatBytes(asset.fileSizeBytes) : '—'),
    },
    {
      key: 'updatedAt',
      header: 'Updated',
      render: (asset) => (
        <span className="text-text-muted text-xs">
          {formatRelativeTime(new Date(asset.updatedAt))}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Media"
        description="The central asset library every collection reuses — Cloudinary-backed, searchable, and tracked wherever it's used."
        actions={<MediaUploadLauncher />}
      />

      <form action={MEDIA_LIST_PATH} method="GET" className="flex flex-wrap gap-2">
        <input type="hidden" name="folder" value={params.folder ?? ''} />
        <input type="hidden" name="sort" value={sort} />
        <input type="hidden" name="view" value={view} />
        <Input
          type="search"
          name="q"
          defaultValue={params.q}
          placeholder="Search by filename, alt text, or tag…"
          className="max-w-sm"
        />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <FilterChip
            href={buildListHref(MEDIA_LIST_PATH, params, { folder: undefined, page: undefined })}
            active={!params.folder}
          >
            All folders
          </FilterChip>
          {MEDIA_FOLDERS.map((folder: MediaFolder) => (
            <FilterChip
              key={folder}
              href={buildListHref(MEDIA_LIST_PATH, params, { folder, page: undefined })}
              active={params.folder === folder}
            >
              {folder}
            </FilterChip>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs">
            <span className="text-text-muted font-mono tracking-[0.05em] uppercase">Sort</span>
            {(['updated', 'name', 'size'] as const).map((option) => (
              <FilterChip
                key={option}
                href={buildListHref(MEDIA_LIST_PATH, params, { sort: option, page: undefined })}
                active={sort === option}
              >
                {option}
              </FilterChip>
            ))}
          </div>

          <div
            className="border-border-default flex items-center overflow-hidden rounded-[4px] border"
            role="group"
            aria-label="View"
          >
            <Link
              href={buildListHref(MEDIA_LIST_PATH, params, { view: 'grid' })}
              aria-current={view === 'grid' ? 'true' : undefined}
              aria-label="Grid view"
              className={`flex h-8 w-8 items-center justify-center ${view === 'grid' ? 'bg-surface-elevated text-text-primary' : 'text-text-muted'}`}
            >
              <LayoutGrid className="h-3.5 w-3.5" aria-hidden />
            </Link>
            <Link
              href={buildListHref(MEDIA_LIST_PATH, params, { view: 'list' })}
              aria-current={view === 'list' ? 'true' : undefined}
              aria-label="List view"
              className={`flex h-8 w-8 items-center justify-center ${view === 'list' ? 'bg-surface-elevated text-text-primary' : 'text-text-muted'}`}
            >
              <TableProperties className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>

      {result.items.length === 0 ? (
        hasAnyEntries ? (
          <EmptyState
            title="No media match your filters."
            description="Try a different search term or clear the filters above."
            action={
              hasFiltersApplied ? (
                <Link
                  href={MEDIA_LIST_PATH}
                  className="text-text-secondary hover:text-text-primary text-sm underline"
                >
                  Clear filters
                </Link>
              ) : undefined
            }
          />
        ) : (
          <EmptyState
            title="No media uploaded yet."
            description="Upload the first asset to start building the library."
            action={<MediaUploadLauncher />}
          />
        )
      ) : view === 'grid' ? (
        <MediaGrid assets={result.items} getHref={(asset) => `${MEDIA_LIST_PATH}/${asset.id}`} />
      ) : (
        <EntryTable
          entries={result.items}
          columns={columns}
          getRowHref={(asset) => `${MEDIA_LIST_PATH}/${asset.id}`}
          getRowKey={(asset) => asset.id}
        />
      )}

      <Pagination
        page={result.page}
        totalPages={result.totalPages}
        buildHref={(page) => buildListHref(MEDIA_LIST_PATH, params, { page })}
      />
    </div>
  );
}
