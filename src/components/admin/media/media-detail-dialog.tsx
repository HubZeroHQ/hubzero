"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Check, Copy } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { MediaThumbnail } from "@/components/admin/media/media-thumbnail";
import {
  deleteMediaAction,
  getMediaUsageAction,
  renameMediaAction,
  replaceMediaAction,
} from "@/actions/studio/media";
import { formatBytes } from "@/lib/utils";
import type { ClientMedia, MediaUsage } from "@/lib/cms/media";

export interface MediaDetailDialogProps {
  media: ClientMedia | null;
  canEdit: boolean;
  canDelete: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (media: ClientMedia) => void;
  onDeleted: (id: string) => void;
}

/**
 * The Media Library's per-file drill-down (`ARCHITECTURE/19_CMS_FOUNDATION.md`
 * §8) — a thin shell around `<MediaDetailContent>`, which is remounted (via
 * `key={media.id}`) whenever a different file is opened, so its editable
 * fields/usage-check initialize fresh from the new `media` without an effect
 * synchronizing prop changes into state.
 */
export function MediaDetailDialog({
  media,
  canEdit,
  canDelete,
  onOpenChange,
  onUpdated,
  onDeleted,
}: MediaDetailDialogProps) {
  return (
    <Dialog.Root open={Boolean(media)} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="z-overlay bg-bg-dark/60 fixed inset-0 backdrop-blur-sm" />
        <Dialog.Content className="z-modal bg-bg-light border-border-muted fixed top-1/2 left-1/2 flex max-h-[85vh] w-[min(36rem,92vw)] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 overflow-y-auto rounded-lg border p-6 shadow-xl focus:outline-none">
          <Dialog.Title className="text-h3 text-text font-medium">File details</Dialog.Title>
          <Dialog.Description className="sr-only">
            View, rename, replace, or delete this media file.
          </Dialog.Description>

          {media && (
            <MediaDetailContent
              key={media.id}
              media={media}
              canEdit={canEdit}
              canDelete={canDelete}
              onUpdated={onUpdated}
              onDeleted={onDeleted}
            />
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

interface MediaDetailContentProps {
  media: ClientMedia;
  canEdit: boolean;
  canDelete: boolean;
  onUpdated: (media: ClientMedia) => void;
  onDeleted: (id: string) => void;
}

/**
 * Dimensions/size/format at a glance, rename metadata, replace the underlying
 * asset without breaking any reference, copy the delivery URL, see exactly
 * which collections use it (reusing `getMediaUsage` — the same check
 * `deleteMedia` itself already enforces, surfaced here instead of only
 * discovered via a failed delete), and delete once nothing references it.
 */
function MediaDetailContent({
  media,
  canEdit,
  canDelete,
  onUpdated,
  onDeleted,
}: MediaDetailContentProps) {
  const [originalName, setOriginalName] = useState(media.originalName);
  const [alt, setAlt] = useState(media.alt);
  const [caption, setCaption] = useState(media.caption ?? "");
  const [usage, setUsage] = useState<MediaUsage[] | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, startSaving] = useTransition();
  const [isReplacing, startReplacing] = useTransition();
  const [isLoadingUsage, startLoadingUsage] = useTransition();

  useEffect(() => {
    startLoadingUsage(async () => {
      setUsage(await getMediaUsageAction(media.id));
    });
    // Runs once per mount — this component remounts (`key={media.id}`)
    // whenever a different file is opened, so `media.id` never changes here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSave() {
    setError(null);
    startSaving(async () => {
      const result = await renameMediaAction(media.id, { originalName, alt, caption });
      if (result.status === "error") setError(result.message);
      else onUpdated(result.media);
    });
  }

  function handleReplace(file: File) {
    setError(null);
    const formData = new FormData();
    formData.set("file", file);
    startReplacing(async () => {
      const result = await replaceMediaAction(media.id, formData);
      if (result.status === "error") setError(result.message);
      else onUpdated(result.media);
    });
  }

  async function handleCopyUrl() {
    await navigator.clipboard.writeText(media.secureUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <MediaThumbnail media={media} className="h-48 w-full" />

      <div className="flex flex-wrap gap-2">
        <Badge>{media.format.toUpperCase()}</Badge>
        <Badge>{formatBytes(media.bytes)}</Badge>
        {media.width && media.height && (
          <Badge>
            {media.width}×{media.height}
          </Badge>
        )}
        <Badge tone={media.provider === "cloudinary" ? "accent" : "default"}>
          {media.provider === "cloudinary" ? "Cloudinary" : "Local storage"}
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        <Input readOnly value={media.secureUrl} className="flex-1 font-mono text-xs" />
        <Button type="button" variant="secondary" size="sm" onClick={handleCopyUrl}>
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? "Copied" : "Copy URL"}
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Input
        label="File name"
        value={originalName}
        onChange={(event) => setOriginalName(event.target.value)}
        disabled={!canEdit}
      />
      <Input
        label="Alt text"
        value={alt}
        onChange={(event) => setAlt(event.target.value)}
        disabled={!canEdit}
      />
      <Input
        label="Caption"
        value={caption}
        onChange={(event) => setCaption(event.target.value)}
        disabled={!canEdit}
      />

      {canEdit && (
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" isLoading={isSaving} onClick={handleSave}>
            Save changes
          </Button>
          <label className="text-caption text-accent-text cursor-pointer font-medium hover:underline">
            {isReplacing ? "Replacing…" : "Replace file…"}
            <input
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
              disabled={isReplacing}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) handleReplace(file);
                event.target.value = "";
              }}
            />
          </label>
        </div>
      )}

      <div>
        <Text weight="medium" size="caption">
          Used in
        </Text>
        {isLoadingUsage ? (
          <Spinner size="sm" label="Checking usage…" className="mt-2" />
        ) : usage && usage.length > 0 ? (
          <ul className="mt-1 flex flex-col gap-0.5">
            {usage.map((entry) => (
              <li key={entry.resource}>
                <Text size="caption" tone="muted">
                  {entry.label} ({entry.count})
                </Text>
              </li>
            ))}
          </ul>
        ) : (
          <Text size="caption" tone="muted" className="mt-1">
            Not referenced anywhere — safe to delete.
          </Text>
        )}
      </div>

      <div className="mt-2 flex justify-between">
        {canDelete && (
          <ConfirmDialog
            trigger={
              <Button type="button" variant="ghost" className="text-danger">
                Delete
              </Button>
            }
            title="Delete this file?"
            description={`"${media.alt}" will be removed from the library if no collection still references it.`}
            confirmLabel="Delete"
            destructive
            onConfirm={async () => {
              const result = await deleteMediaAction(media.id);
              if (result.status === "error") setError(result.message);
              else onDeleted(media.id);
            }}
          />
        )}
        <Dialog.Close asChild>
          <Button type="button" variant="secondary" className="ml-auto">
            Close
          </Button>
        </Dialog.Close>
      </div>
    </>
  );
}
