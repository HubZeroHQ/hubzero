"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { restoreVersion } from "@/actions/studio/version-history";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button, Text } from "@/components/ui";
import type { Resource } from "@/types/cms";

export interface RestoreVersionButtonProps {
  resource: Resource;
  documentId: string;
  versionId: string;
  /** The collection's real edit page when known (`config.studioBasePath`); falls back to this same history screen when it isn't. */
  redirectTo: string;
  label?: string;
}

/**
 * Restore's one UI entry point — parameterizes the same `<ConfirmDialog>`
 * used for delete/publish (`confirm-dialog.tsx`'s own doc comment already
 * earmarks it for exactly this) rather than a bespoke modal, since "a
 * state-changing action needs an explicit second click" doesn't vary by what
 * that action is (`ARCHITECTURE/19_CMS_FOUNDATION.md` §5).
 */
export function RestoreVersionButton({
  resource,
  documentId,
  versionId,
  redirectTo,
  label = "Restore this version",
}: RestoreVersionButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleRestore() {
    setError(null);
    const result = await restoreVersion(resource, documentId, versionId);
    if (result.status === "success") {
      router.push(redirectTo);
      router.refresh();
    } else {
      setError(result.message);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <ConfirmDialog
        trigger={
          <Button variant="secondary" type="button">
            {label}
          </Button>
        }
        title="Restore this version?"
        description="This creates a new draft from this version's content — it won't go live until it's submitted for review and published again."
        confirmLabel="Restore"
        onConfirm={handleRestore}
      />
      {error && (
        <Text size="caption" className="text-danger">
          {error}
        </Text>
      )}
    </div>
  );
}
