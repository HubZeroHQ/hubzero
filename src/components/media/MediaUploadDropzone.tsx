'use client';

import { RefreshCw, Upload, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import type { MediaAssetDTO } from '@/lib/media/dto';
import { uploadToCloudinary, UploadError } from '@/lib/media/upload-client';
import {
  createMediaFromUploadAction,
  requestUploadSignatureAction,
  type CloudinaryUploadResult,
} from '@/lib/studio/actions/media';
import { cn } from '@/lib/utils/cn';
import { formatBytes } from '@/lib/utils/format-bytes';
import type { MediaFolder } from '@/types/studio';

interface QueueItem {
  key: string;
  file: File;
  previewUrl: string;
  status: 'uploading' | 'pendingMetadata' | 'saving' | 'error';
  progress: number;
  error?: string;
  upload?: CloudinaryUploadResult;
  altText: string;
}

/**
 * Upload — drag-drop or file picker, uploads directly to Cloudinary using
 * signed parameters issued by a Server Action (CMS_PRODUCT_DESIGN.md §6).
 * A native `<input type="file">` inside a `<label>` is the accessible base
 * (keyboard-operable, screen-reader-announced) with drag-and-drop layered
 * on top as a progressive enhancement, never a replacement for it.
 *
 * Alt text is requested immediately after each file's upload completes and
 * is required before "Add to library" enables — the editor should never be
 * able to reach a saved asset with no alt text (§6, echoing the same rule
 * already enforced for in-document image blocks).
 */
export function MediaUploadDropzone({
  folder,
  onUploaded,
}: {
  folder: MediaFolder;
  onUploaded: (assets: MediaAssetDTO[]) => void;
}) {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [dragging, setDragging] = useState(false);

  const startUpload = useCallback(
    async (file: File) => {
      const key = `${file.name}-${file.size}-${Date.now()}-${Math.random()}`;
      const previewUrl = URL.createObjectURL(file);
      setItems((prev) => [
        ...prev,
        { key, file, previewUrl, status: 'uploading', progress: 0, altText: '' },
      ]);

      try {
        const params = await requestUploadSignatureAction(folder);
        const upload = await uploadToCloudinary(file, params, (fraction) => {
          setItems((prev) =>
            prev.map((item) => (item.key === key ? { ...item, progress: fraction } : item)),
          );
        });
        setItems((prev) =>
          prev.map((item) =>
            item.key === key ? { ...item, status: 'pendingMetadata', upload, progress: 1 } : item,
          ),
        );
      } catch (error) {
        setItems((prev) =>
          prev.map((item) =>
            item.key === key
              ? {
                  ...item,
                  status: 'error',
                  error: error instanceof UploadError ? error.message : 'Upload failed.',
                }
              : item,
          ),
        );
      }
    },
    [folder],
  );

  function handleFiles(fileList: FileList | null) {
    if (!fileList) {
      return;
    }
    Array.from(fileList).forEach((file) => void startUpload(file));
  }

  function retry(key: string) {
    const item = items.find((entry) => entry.key === key);
    if (!item) {
      return;
    }
    setItems((prev) => prev.filter((entry) => entry.key !== key));
    void startUpload(item.file);
  }

  function remove(key: string) {
    setItems((prev) => prev.filter((entry) => entry.key !== key));
  }

  function updateAltText(key: string, altText: string) {
    setItems((prev) => prev.map((entry) => (entry.key === key ? { ...entry, altText } : entry)));
  }

  async function saveAll() {
    const ready = items.filter(
      (item) => item.status === 'pendingMetadata' && item.upload && item.altText.trim(),
    );
    if (ready.length === 0) {
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        ready.some((r) => r.key === item.key) ? { ...item, status: 'saving' } : item,
      ),
    );

    const saved: MediaAssetDTO[] = [];
    const failedKeys = new Set<string>();
    for (const item of ready) {
      const result = await createMediaFromUploadAction({
        upload: item.upload!,
        altText: item.altText.trim(),
        folder,
      });
      if (result.data) {
        saved.push(result.data);
      } else {
        failedKeys.add(item.key);
      }
    }

    setItems((prev) =>
      prev
        .filter((item) => !ready.some((r) => r.key === item.key) || failedKeys.has(item.key))
        .map((item) =>
          failedKeys.has(item.key)
            ? { ...item, status: 'error', error: 'Could not save this upload.' }
            : item,
        ),
    );

    if (saved.length > 0) {
      onUploaded(saved);
    }
  }

  const readyCount = items.filter(
    (item) => item.status === 'pendingMetadata' && item.altText.trim(),
  ).length;

  return (
    <div className="flex flex-col gap-4">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          handleFiles(event.dataTransfer.files);
        }}
        className={cn(
          'rounded-card border-border-default duration-fast ease-standard flex flex-col items-center justify-center gap-2 border border-dashed px-6 py-10 text-center transition-colors',
          dragging ? 'border-accent bg-accent-subtle' : undefined,
        )}
      >
        <Upload className="text-text-muted h-5 w-5" aria-hidden />
        <label className="cursor-pointer text-sm">
          <span className="text-text-primary underline">Choose files</span>
          <span className="text-text-muted"> or drag and drop</span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(event) => {
              handleFiles(event.target.files);
              event.target.value = '';
            }}
          />
        </label>
        <p className="text-text-muted text-xs">
          Images upload directly to Cloudinary — nothing is stored locally.
        </p>
      </div>

      {items.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <li
              key={item.key}
              className="border-border-muted rounded-card flex items-start gap-3 border p-3"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview, never rendered publicly */}
              <img
                src={item.previewUrl}
                alt=""
                className="h-12 w-12 shrink-0 rounded-[4px] object-cover"
              />
              <div className="flex flex-1 flex-col gap-1.5">
                <p className="text-text-primary truncate text-xs">
                  {item.file.name} · {formatBytes(item.file.size)}
                </p>
                {item.status === 'uploading' ? (
                  <div
                    role="progressbar"
                    aria-label={`Uploading ${item.file.name}`}
                    aria-valuenow={Math.round(item.progress * 100)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className="bg-surface-elevated h-1.5 w-full overflow-hidden rounded-full"
                  >
                    <div
                      className="bg-accent h-full transition-[width]"
                      style={{ width: `${Math.round(item.progress * 100)}%` }}
                    />
                  </div>
                ) : item.status === 'pendingMetadata' ? (
                  <Field
                    label="Alt text"
                    name={`alt-${item.key}`}
                    hint="Required — describes the image for screen readers."
                  >
                    <Input
                      value={item.altText}
                      onChange={(event) => updateAltText(item.key, event.target.value)}
                      placeholder="Describe the image"
                    />
                  </Field>
                ) : item.status === 'saving' ? (
                  <p className="text-text-muted text-xs">Adding to library…</p>
                ) : item.status === 'error' ? (
                  <p role="alert" className="text-danger text-xs">
                    {item.error}
                  </p>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {item.status === 'error' ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => retry(item.key)}
                    aria-label={`Retry upload for ${item.file.name}`}
                  >
                    <RefreshCw className="h-3.5 w-3.5" aria-hidden />
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => remove(item.key)}
                  aria-label={`Remove ${item.file.name}`}
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {items.some((item) => item.status === 'pendingMetadata' || item.status === 'saving') ? (
        <Button type="button" onClick={() => void saveAll()} disabled={readyCount === 0}>
          Add {readyCount > 0 ? readyCount : ''} to library
        </Button>
      ) : null}
    </div>
  );
}
