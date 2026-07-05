"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { MediaBrowseGrid } from "@/components/admin/media/media-browse-grid";
import { MediaUploadForm } from "@/components/admin/media/media-upload-form";
import { cn } from "@/lib/utils";
import type { ClientMedia } from "@/lib/cms/media";

export interface MediaPickerModalProps {
  trigger: ReactNode;
  onSelect: (media: ClientMedia) => void;
}

/**
 * The shared "choose existing or upload new" modal every `image`/
 * `imageArray` field opens (`ARCHITECTURE/19_CMS_FOUNDATION.md` §8) — one
 * implementation, reused by `<MediaPicker>` (single) and `<MediaPickerList>`
 * (multi), matching the `<ConfirmDialog>` precedent of one shared modal
 * parameterized by what it's doing rather than one modal per collection.
 * Deliberately two plain toggle buttons rather than a Radix Tabs primitive —
 * this is the only tabbed UI in the app, so adding a new dependency for it
 * isn't warranted yet.
 */
export function MediaPickerModal({ trigger, onSelect }: MediaPickerModalProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"browse" | "upload">("browse");
  const [refreshKey, setRefreshKey] = useState(0);

  function handleSelect(media: ClientMedia) {
    onSelect(media);
    setOpen(false);
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setTab("browse");
      }}
    >
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="z-overlay bg-bg-dark/60 fixed inset-0 backdrop-blur-sm" />
        <Dialog.Content
          className={cn(
            "z-modal bg-bg-light border-border-muted fixed top-1/2 left-1/2 flex max-h-[85vh] w-[min(40rem,90vw)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg border p-6 shadow-xl focus:outline-none",
          )}
        >
          <Dialog.Title className="text-h3 text-text font-medium">Choose media</Dialog.Title>
          <Dialog.Description className="text-body text-text-muted mt-1">
            Browse existing files or upload a new one.
          </Dialog.Description>

          <div className="border-border-muted mt-4 flex gap-2 border-b pb-3">
            <button
              type="button"
              onClick={() => setTab("browse")}
              className={cn(
                "text-caption rounded-full px-3 py-1.5 font-medium transition-colors",
                tab === "browse" ? "bg-accent text-accent-foreground" : "text-text-muted hover:text-text",
              )}
            >
              Choose existing
            </button>
            <button
              type="button"
              onClick={() => setTab("upload")}
              className={cn(
                "text-caption rounded-full px-3 py-1.5 font-medium transition-colors",
                tab === "upload" ? "bg-accent text-accent-foreground" : "text-text-muted hover:text-text",
              )}
            >
              Upload new
            </button>
          </div>

          <div className="mt-4 overflow-y-auto">
            {tab === "browse" ? (
              <MediaBrowseGrid onSelect={handleSelect} refreshKey={refreshKey} />
            ) : (
              <MediaUploadForm
                onUploaded={(media) => {
                  handleSelect(media);
                  setRefreshKey((key) => key + 1);
                }}
              />
            )}
          </div>

          <Dialog.Close asChild>
            <Button variant="ghost" type="button" className="mt-4 self-end">
              Cancel
            </Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
