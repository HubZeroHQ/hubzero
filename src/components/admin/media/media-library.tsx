"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { UploadCloud } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Select } from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import { MediaBrowseGrid } from "@/components/admin/media/media-browse-grid";
import { MediaDetailDialog } from "@/components/admin/media/media-detail-dialog";
import { MediaUploadForm } from "@/components/admin/media/media-upload-form";
import {
  bulkDeleteMediaAction,
  listMediaFoldersAction,
  moveMediaToFolderAction,
  uploadMediaBatchAction,
} from "@/actions/studio/media";
import type { ClientMedia } from "@/lib/cms/media";
import { cn } from "@/lib/utils";

export interface MediaLibraryProps {
  canDelete: boolean;
  canEdit: boolean;
}

const ALL_FOLDERS = "__all__";
const UNFILED = "__unfiled__";

/**
 * The `/studio/media` library screen. Media is a deliberate exception to the
 * generic `DataTable`/`CollectionConfig` shape (`ARCHITECTURE/19_CMS_FOUNDATION.md`
 * §11's precedent for `SiteSettings`) — a grid of files with a usage-guarded
 * delete, not a workflow document list, so it isn't forced through
 * machinery built for a different shape.
 */
export function MediaLibrary({ canDelete, canEdit }: MediaLibraryProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [folders, setFolders] = useState<string[]>([]);
  const [activeFolder, setActiveFolder] = useState(ALL_FOLDERS);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailMedia, setDetailMedia] = useState<ClientMedia | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploadingBatch, startBatchUpload] = useTransition();
  const [isBulkActing, startBulkAction] = useTransition();

  useEffect(() => {
    listMediaFoldersAction().then(setFolders);
  }, [refreshKey]);

  // The command palette's "Upload Media" action (Phase F) links here with
  // `?upload=1` to open the upload dialog immediately — the URL param is
  // consumed once, then stripped, so refreshing/bookmarking the plain
  // `/studio/media` URL never force-opens it.
  useEffect(() => {
    if (searchParams.get("upload") !== "1") return;
    Promise.resolve().then(() => {
      setUploadOpen(true);
      router.replace("/studio/media");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function refresh() {
    setRefreshKey((key) => key + 1);
    setSelectedIds(new Set());
  }

  function toggleSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragActive(false);
    const files = Array.from(event.dataTransfer.files);
    if (files.length === 0) return;
    uploadFiles(files);
  }

  function uploadFiles(files: File[]) {
    setError(null);
    startBatchUpload(async () => {
      const payload = await Promise.all(
        files.map(async (file) => ({
          name: file.name,
          type: file.type,
          buffer: await file.arrayBuffer(),
        })),
      );
      const folder =
        activeFolder === ALL_FOLDERS || activeFolder === UNFILED ? undefined : activeFolder;
      const results = await uploadMediaBatchAction(payload, folder);
      const failures = results.filter((result) => result.status === "error");
      if (failures.length > 0) {
        setError(
          `${failures.length} of ${files.length} file(s) failed: ${failures
            .map((f) => `"${f.fileName}" (${f.message})`)
            .join(", ")}`,
        );
      }
      refresh();
    });
  }

  async function handleBulkDelete() {
    const ids = [...selectedIds];
    const result = await bulkDeleteMediaAction(ids);
    if (result.blocked.length > 0) {
      setError(
        `${result.blocked.length} file(s) couldn't be deleted — still referenced: ${result.blocked
          .map((b) => b.message)
          .join("; ")}`,
      );
    }
    refresh();
  }

  function handleBulkMove(folder: string) {
    startBulkAction(async () => {
      await moveMediaToFolderAction([...selectedIds], folder === UNFILED ? null : folder);
      refresh();
    });
  }

  const folderOptions = [
    { value: ALL_FOLDERS, label: "All folders" },
    { value: UNFILED, label: "Unfiled" },
    ...folders.map((folder) => ({ value: folder, label: folder })),
  ];

  return (
    <div className="flex flex-col gap-4">
      {error && <Alert variant="danger">{error}</Alert>}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select
          options={folderOptions}
          value={activeFolder}
          onValueChange={setActiveFolder}
          className="w-48"
        />
        <Dialog.Root open={uploadOpen} onOpenChange={setUploadOpen}>
          <Dialog.Trigger asChild>
            <Button type="button">Upload file</Button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="z-overlay bg-bg-dark/60 fixed inset-0 backdrop-blur-sm" />
            <Dialog.Content className="z-modal bg-bg-light border-border-muted fixed top-1/2 left-1/2 w-[min(28rem,90vw)] -translate-x-1/2 -translate-y-1/2 rounded-lg border p-6 shadow-xl focus:outline-none">
              <Dialog.Title className="text-h3 text-text font-medium">Upload a file</Dialog.Title>
              <Dialog.Description className="sr-only">Upload a new media file.</Dialog.Description>
              <div className="mt-4">
                <MediaUploadForm
                  defaultFolder={
                    activeFolder === ALL_FOLDERS || activeFolder === UNFILED
                      ? undefined
                      : activeFolder
                  }
                  onUploaded={() => {
                    setUploadOpen(false);
                    refresh();
                  }}
                />
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      {selectedIds.size > 0 && (
        <div className="bg-bg-light border-border-muted flex flex-wrap items-center gap-3 rounded-md border p-3">
          <Text size="caption" weight="medium">
            {selectedIds.size} selected
          </Text>
          <Select
            options={[
              { value: UNFILED, label: "Unfiled" },
              ...folders.map((f) => ({ value: f, label: f })),
            ]}
            placeholder="Move to folder…"
            onValueChange={handleBulkMove}
            className="w-40"
            disabled={isBulkActing}
          />
          {canDelete && (
            <ConfirmDialog
              trigger={
                <Button type="button" variant="ghost" size="sm" className="text-danger">
                  Delete selected
                </Button>
              }
              title={`Delete ${selectedIds.size} file(s)?`}
              description="Any file still referenced by a collection will be skipped, not force-deleted."
              confirmLabel="Delete"
              destructive
              onConfirm={handleBulkDelete}
            />
          )}
          <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
            Clear selection
          </Button>
        </div>
      )}

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragActive(true);
        }}
        onDragLeave={() => setIsDragActive(false)}
        onDrop={handleDrop}
        className={cn(
          "rounded-lg border-2 border-dashed p-4 transition-colors",
          isDragActive ? "border-accent bg-accent/5" : "border-transparent",
        )}
      >
        {(isDragActive || isUploadingBatch) && (
          <div className="border-accent/40 text-accent mb-4 flex items-center justify-center gap-2 rounded-md border border-dashed py-6">
            <UploadCloud className="size-5" aria-hidden="true" />
            <Text size="caption" weight="medium">
              {isUploadingBatch ? "Uploading…" : "Drop files to upload"}
            </Text>
          </div>
        )}

        <MediaBrowseGrid
          refreshKey={refreshKey}
          folder={
            activeFolder === ALL_FOLDERS ? undefined : activeFolder === UNFILED ? "" : activeFolder
          }
          showFilters
          onOpenDetail={setDetailMedia}
          selectedIds={selectedIds}
          onToggleSelected={toggleSelected}
        />
      </div>

      <MediaDetailDialog
        media={detailMedia}
        canEdit={canEdit}
        canDelete={canDelete}
        onOpenChange={(open) => !open && setDetailMedia(null)}
        onUpdated={(media) => {
          setDetailMedia(media);
          refresh();
        }}
        onDeleted={() => {
          setDetailMedia(null);
          refresh();
        }}
      />
    </div>
  );
}
