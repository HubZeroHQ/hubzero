'use client';

import { RefreshCw, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import type { MediaAssetDTO } from '@/lib/media/dto';
import type { MediaUsageRef } from '@/lib/media/usage';
import { uploadToCloudinary } from '@/lib/media/upload-client';
import {
  deleteMediaAction,
  replaceMediaAssetFileAction,
  requestUploadSignatureAction,
} from '@/lib/studio/actions/media';

/**
 * Replace and delete — the two destructive-adjacent actions that need a
 * usage warning first (CMS_PRODUCT_DESIGN.md §6, Appendix B.2). "Replace
 * file everywhere" is deliberately separate from a block-level image swap
 * (which never touches this Media record, see `lib/studio/actions/media.ts`'s
 * `replaceMediaAssetFileAction` comment) — this is the rare, explicit
 * global operation that lives on the asset itself.
 */
export function MediaDetailActions({
  asset,
  usage,
}: {
  asset: MediaAssetDTO;
  usage: MediaUsageRef[];
}) {
  const router = useRouter();
  const [replaceOpen, setReplaceOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [replaceProgress, setReplaceProgress] = useState<number | null>(null);
  const [replaceError, setReplaceError] = useState<string>();
  const [deleting, startDeleteTransition] = useTransition();
  const [deleteError, setDeleteError] = useState<string>();

  async function handleReplaceFile(file: File) {
    setReplaceError(undefined);
    setReplaceProgress(0);
    try {
      const params = await requestUploadSignatureAction(asset.folder);
      const upload = await uploadToCloudinary(file, params, (fraction) =>
        setReplaceProgress(fraction),
      );
      const result = await replaceMediaAssetFileAction(asset.id, upload);
      if (result.error) {
        setReplaceError(result.error);
      } else {
        setReplaceOpen(false);
        router.refresh();
      }
    } catch (error) {
      setReplaceError(error instanceof Error ? error.message : 'Could not replace this asset.');
    } finally {
      setReplaceProgress(null);
    }
  }

  function handleDelete() {
    setDeleteError(undefined);
    startDeleteTransition(async () => {
      const result = await deleteMediaAction(asset.id, { force: usage.length > 0 });
      if (result.error) {
        setDeleteError(result.error);
      } else {
        router.push('/studio/library/media');
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" variant="secondary" onClick={() => setReplaceOpen(true)}>
        <RefreshCw className="h-3.5 w-3.5" aria-hidden />
        Replace file everywhere
      </Button>
      <Button type="button" variant="secondary" onClick={() => setDeleteOpen(true)}>
        <Trash2 className="h-3.5 w-3.5" aria-hidden />
        Delete
      </Button>

      <Dialog
        open={replaceOpen}
        onOpenChange={setReplaceOpen}
        title="Replace file everywhere"
        description={`Swaps the underlying file for every one of the ${usage.length} place${usage.length === 1 ? '' : 's'} this asset is used — no Document or field needs to change.`}
      >
        <div className="flex flex-col gap-3">
          <label className="cursor-pointer text-sm">
            <span className="text-text-primary underline">Choose a replacement file</span>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void handleReplaceFile(file);
                }
              }}
            />
          </label>
          {replaceProgress !== null ? (
            <div
              role="progressbar"
              aria-label="Replacement upload progress"
              aria-valuenow={Math.round(replaceProgress * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
              className="bg-surface-elevated h-1.5 w-full overflow-hidden rounded-full"
            >
              <div
                className="bg-accent h-full transition-[width]"
                style={{ width: `${Math.round(replaceProgress * 100)}%` }}
              />
            </div>
          ) : null}
          {replaceError ? (
            <p role="alert" className="text-danger text-xs">
              {replaceError}
            </p>
          ) : null}
        </div>
      </Dialog>

      <Dialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this asset?"
        description="This permanently removes the file from Cloudinary and the library."
      >
        <div className="flex flex-col gap-3">
          {usage.length > 0 ? (
            <p role="alert" className="text-danger text-sm">
              This asset is used in {usage.length} place{usage.length === 1 ? '' : 's'}. Deleting it
              will leave those references broken.
            </p>
          ) : (
            <p className="text-text-secondary text-sm">
              This asset isn&rsquo;t used anywhere — safe to delete.
            </p>
          )}
          {deleteError ? (
            <p role="alert" className="text-danger text-xs">
              {deleteError}
            </p>
          ) : null}
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting…' : 'Delete permanently'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
