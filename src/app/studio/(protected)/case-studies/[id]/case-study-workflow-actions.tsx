"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { publish, remove, submitForReview } from "@/actions/studio/case-studies";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";

export interface CaseStudyWorkflowActionsProps {
  id: string;
  status: string;
  canSubmitForReview: boolean;
  canPublish: boolean;
  canDelete: boolean;
}

/**
 * The workflow-transition controls for one document — submit for review,
 * publish, delete — each routed through the exact generic Server Action
 * `createCrudActions()` produced, never a Case-Study-specific mutation
 * (`ARCHITECTURE/19_CMS_FOUNDATION.md` §5). Visibility here is a UX nicety
 * only: the real enforcement already happened server-side inside
 * `submitForReview`/`publish`/`remove` via `requirePermission()` — a user
 * who forged a request past a hidden button still gets rejected there.
 */
export function CaseStudyWorkflowActions({
  id,
  status,
  canSubmitForReview,
  canPublish,
  canDelete,
}: CaseStudyWorkflowActionsProps) {
  const router = useRouter();
  const [isSubmitting, startSubmitTransition] = useTransition();

  function handleSubmitForReview() {
    startSubmitTransition(async () => {
      const result = await submitForReview(id);
      if (result.status === "success") router.refresh();
    });
  }

  async function handlePublish() {
    const result = await publish(id);
    if (result.status === "success") router.refresh();
  }

  async function handleDelete() {
    const result = await remove(id);
    if (result.status === "success") router.push("/studio/case-studies");
  }

  if (!canSubmitForReview && !canPublish && !canDelete) return null;

  return (
    <div className="flex flex-wrap gap-3">
      {canSubmitForReview && status === "draft" && (
        <Button
          variant="secondary"
          isLoading={isSubmitting}
          onClick={handleSubmitForReview}
          type="button"
        >
          Submit for review
        </Button>
      )}
      {canPublish && (
        <ConfirmDialog
          trigger={
            <Button variant="secondary" type="button">
              {status === "published" ? "Republish" : "Publish"}
            </Button>
          }
          title={status === "published" ? "Republish this case study?" : "Publish this case study?"}
          description={
            status === "published"
              ? "This records the current live content as a new version, then updates /work immediately."
              : "It goes live at /work immediately."
          }
          confirmLabel={status === "published" ? "Republish" : "Publish"}
          onConfirm={handlePublish}
        />
      )}
      {canDelete && (
        <ConfirmDialog
          trigger={
            <Button variant="secondary" className="text-danger" type="button">
              Delete
            </Button>
          }
          title="Delete this case study?"
          description="This can't be undone."
          destructive
          confirmLabel="Delete"
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
