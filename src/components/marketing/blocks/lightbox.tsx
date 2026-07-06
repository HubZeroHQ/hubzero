"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import type { ReactNode } from "react";

import { cloudinaryImageLoader, isCloudinaryUrl } from "@/lib/cms/media-url";

export interface LightboxImage {
  url: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface LightboxProps {
  images: LightboxImage[];
  initialIndex: number;
  trigger: ReactNode;
}

/**
 * Click-to-enlarge for the `image`/`gallery` blocks
 * (`ARCHITECTURE/20_CONTENT_BLOCKS.md`) — a single shared implementation,
 * parameterized by the full image list plus which one was clicked, so a
 * single `image` block and a multi-image `gallery` block both get
 * next/previous navigation between every image in their own set, not just a
 * one-off enlarge-this-one-image view.
 */
export function Lightbox({ images, initialIndex, trigger }: LightboxProps) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(initialIndex);
  const current = images[index];

  if (!current) return <>{trigger}</>;

  function show(next: number) {
    setIndex((next + images.length) % images.length);
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setIndex(initialIndex);
      }}
    >
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="z-overlay bg-bg-dark/95 fixed inset-0" />
        <Dialog.Content
          className="z-modal fixed inset-0 flex items-center justify-center p-6 focus:outline-none"
          onKeyDown={(event) => {
            if (images.length < 2) return;
            if (event.key === "ArrowLeft") show(index - 1);
            if (event.key === "ArrowRight") show(index + 1);
          }}
        >
          <Dialog.Title className="sr-only">{current.alt || "Image preview"}</Dialog.Title>
          <Dialog.Close
            aria-label="Close"
            className="text-bg absolute top-4 right-4 rounded-full p-2 hover:opacity-70"
          >
            <X className="size-6" aria-hidden="true" />
          </Dialog.Close>

          {images.length > 1 && (
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => show(index - 1)}
              className="text-bg absolute top-1/2 left-4 -translate-y-1/2 rounded-full p-2 hover:opacity-70"
            >
              <ChevronLeft className="size-8" aria-hidden="true" />
            </button>
          )}

          <div className="relative max-h-[85vh] max-w-[90vw]">
            <Image
              src={current.url}
              alt={current.alt}
              width={current.width ?? 1600}
              height={current.height ?? 900}
              loader={isCloudinaryUrl(current.url) ? cloudinaryImageLoader : undefined}
              sizes="90vw"
              className="max-h-[85vh] w-auto object-contain"
            />
          </div>

          {images.length > 1 && (
            <button
              type="button"
              aria-label="Next image"
              onClick={() => show(index + 1)}
              className="text-bg absolute top-1/2 right-4 -translate-y-1/2 rounded-full p-2 hover:opacity-70"
            >
              <ChevronRight className="size-8" aria-hidden="true" />
            </button>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
