import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/studio/PageHeader';
import { MediaDetailActions } from '@/components/media/MediaDetailActions';
import { MediaMetadataForm } from '@/components/media/MediaMetadataForm';
import { MediaUsagePanel } from '@/components/media/MediaUsagePanel';
import { mediaRepository } from '@/lib/db/repositories/media';
import { toMediaAssetDTO } from '@/lib/media/dto';
import { findMediaUsage } from '@/lib/media/usage';
import { formatBytes } from '@/lib/utils/format-bytes';
import { formatRelativeTime } from '@/lib/utils/relative-time';

export const metadata: Metadata = { title: 'Media — HubZero Studio' };

export default async function MediaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = await mediaRepository.findById(id);
  if (!record) {
    notFound();
  }

  const [usage, asset] = [await findMediaUsage(id), toMediaAssetDTO(record)];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={asset.originalFilename ?? asset.altText}
        description={`Uploaded ${formatRelativeTime(new Date(asset.createdAt))}`}
        actions={<MediaDetailActions asset={asset} usage={usage} />}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,360px)_1fr]">
        <div className="flex flex-col gap-4">
          <div className="bg-surface-default border-border-muted relative aspect-square w-full overflow-hidden rounded-[8px] border">
            {asset.width && asset.height ? (
              <Image
                src={asset.url}
                alt={asset.altText}
                fill
                sizes="360px"
                className="object-contain"
              />
            ) : null}
          </div>

          <dl className="border-border-muted divide-border-muted grid grid-cols-2 divide-y rounded-[4px] border text-sm [&>*]:px-3 [&>*]:py-2">
            <dt className="text-text-muted">Dimensions</dt>
            <dd className="text-text-secondary text-right">
              {asset.width && asset.height ? `${asset.width}×${asset.height}px` : 'Unknown'}
            </dd>
            <dt className="text-text-muted">File size</dt>
            <dd className="text-text-secondary text-right">
              {asset.fileSizeBytes ? formatBytes(asset.fileSizeBytes) : 'Unknown'}
            </dd>
            <dt className="text-text-muted">MIME type</dt>
            <dd className="text-text-secondary text-right">{asset.mimeType ?? 'Unknown'}</dd>
            <dt className="text-text-muted">Folder</dt>
            <dd className="text-text-secondary text-right font-mono text-xs uppercase">
              {asset.folder}
            </dd>
            <dt className="text-text-muted">Uploaded</dt>
            <dd className="text-text-secondary text-right">
              {new Date(asset.createdAt).toLocaleString()}
            </dd>
            <dt className="text-text-muted">Last updated</dt>
            <dd className="text-text-secondary text-right">
              {new Date(asset.updatedAt).toLocaleString()}
            </dd>
          </dl>
        </div>

        <div className="flex flex-col gap-8">
          <section className="flex flex-col gap-3">
            <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">
              Metadata
            </h2>
            <MediaMetadataForm asset={asset} />
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">
              Used in {usage.length > 0 ? `(${usage.length})` : ''}
            </h2>
            <MediaUsagePanel usage={usage} />
          </section>
        </div>
      </div>
    </div>
  );
}
