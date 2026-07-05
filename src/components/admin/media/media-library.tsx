"use client";

import { useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { MediaBrowseGrid } from "@/components/admin/media/media-browse-grid";
import { deleteMediaAction } from "@/actions/studio/media";
import type { ClientMedia } from "@/lib/cms/media";

export interface MediaLibraryProps {
  canDelete: boolean;
}

/**
 * The `/studio/media` library screen. Media is a deliberate exception to the
 * generic `DataTable`/`CollectionConfig` shape (`ARCHITECTURE/19_CMS_FOUNDATION.md`
 * §11's precedent for `SiteSettings`) — a grid of files with a usage-guarded
 * delete, not a workflow document list, so it isn't forced through
 * machinery built for a different shape.
 */
export function MediaLibrary({ canDelete }: MediaLibraryProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(media: ClientMedia) {
    setError(null);
    const result = await deleteMediaAction(media.id);
    if (result.status === "error") {
      setError(result.message);
    } else {
      setRefreshKey((key) => key + 1);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <Alert variant="danger">{error}</Alert>}
      <MediaBrowseGrid
        refreshKey={refreshKey}
        renderItemActions={
          canDelete
            ? (media) => (
                <ConfirmDialog
                  trigger={
                    <Button type="button" variant="ghost" size="sm" className="text-danger">
                      Delete
                    </Button>
                  }
                  title="Delete this file?"
                  description={`"${media.alt}" will be removed from the library if no collection still references it.`}
                  confirmLabel="Delete"
                  destructive
                  onConfirm={() => handleDelete(media)}
                />
              )
            : undefined
        }
      />
    </div>
  );
}
