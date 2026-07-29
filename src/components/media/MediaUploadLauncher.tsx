'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import type { MediaFolder } from '@/types/studio';
import { MediaPicker } from './MediaPicker';

/** The Media Library list page's "Upload media" entry point — opens the shared picker straight to its Upload tab. */
export function MediaUploadLauncher({ folder = 'general' }: { folder?: MediaFolder }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        Upload media
      </Button>
      <MediaPicker
        open={open}
        onOpenChange={setOpen}
        defaultFolder={folder}
        initialTab="upload"
        onSelect={(asset) => router.push(`/studio/library/media/${asset.id}`)}
      />
    </>
  );
}
