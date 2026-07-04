"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { Workflow } from "@/types/cms";

type SimpleResult = { status: "success" } | { status: "error"; message: string };

export interface WorkflowActionsProps {
  id: string;
  status: string;
  workflow: Workflow;
  canSubmitForReview: boolean;
  canPublish: boolean;
  canDelete: boolean;
  /** Omitted for a `"draft-publish"` collection — `createCrudActions`'s `submitForReview` would throw for one anyway (`crud-actions.ts`), and this component never renders the button unless `workflow === "draft-review-publish"`. */
  submitForReview?: (id: string) => Promise<SimpleResult>;
  publish: (id: string) => Promise<SimpleResult>;
  remove: (id: string) => Promise<SimpleResult>;
  /** The collection's own list screen — where Delete redirects to. */
  listHref: string;
  /** Singular, lowercase — "case study", "team member" — used in confirm-dialog copy. */
  itemLabel: string;
  /** Override the default publish/republish confirm-dialog body — e.g. Case Study's "It goes live at /work immediately." Defaults deliberately make no "goes live" claim, since most collections have no public page yet (`ARCHITECTURE` §14 Phase G is unstarted for them). */
  publishDescription?: string;
  republishDescription?: string;
}

/**
 * The workflow-transition controls for one document — submit for review,
 * publish, delete — each routed through the exact generic Server Action
 * `createCrudActions()` produced for that collection, never a bespoke
 * mutation (`ARCHITECTURE/19_CMS_FOUNDATION.md` §5). One component for every
 * collection rather than a copy per collection (previously duplicated
 * verbatim as `case-study-workflow-actions.tsx`; extracted here once a
 * second collection needed the identical component — the same "genuine
 * repetition, generalize once" test `ARCHITECTURE/19` itself applies to the
 * engine, applied here to a shared UI component).
 *
 * Visibility here is a UX nicety only: the real enforcement already happened
 * server-side inside `submitForReview`/`publish`/`remove` via
 * `requirePermission()` — a user who forged a request past a hidden button
 * still gets rejected there.
 */
export function WorkflowActions({
  id,
  status,
  workflow,
  canSubmitForReview,
  canPublish,
  canDelete,
  submitForReview,
  publish,
  remove,
  listHref,
  itemLabel,
  publishDescription = "This records a version of the current content.",
  republishDescription = "This records the current content as a new version.",
}: WorkflowActionsProps) {
  const router = useRouter();
  const [isSubmitting, startSubmitTransition] = useTransition();
  // Every action below returned `{ status: "error", message }` on a guard/
  // permission failure with nothing rendering it — found during Phase D's
  // manual testing via Blueprint's `publishGuard` (`demoStatus !== "live"`):
  // the confirm dialog closed, the document silently stayed a draft, and an
  // editor had no way to tell why. Not new to this component (the same gap
  // existed in the Case Study-only predecessor this generalizes), but this
  // is the one place to fix it once for every collection.
  const [actionError, setActionError] = useState<string | null>(null);

  function handleSubmitForReview() {
    if (!submitForReview) return;
    setActionError(null);
    startSubmitTransition(async () => {
      const result = await submitForReview(id);
      if (result.status === "success") router.refresh();
      else setActionError(result.message);
    });
  }

  async function handlePublish() {
    setActionError(null);
    const result = await publish(id);
    if (result.status === "success") router.refresh();
    else setActionError(result.message);
  }

  async function handleDelete() {
    setActionError(null);
    const result = await remove(id);
    if (result.status === "success") router.push(listHref);
    else setActionError(result.message);
  }

  if (!canSubmitForReview && !canPublish && !canDelete) return null;

  return (
    <div className="flex flex-col gap-3">
      {actionError && <Alert variant="danger">{actionError}</Alert>}
      <div className="flex flex-wrap gap-3">
        {workflow === "draft-review-publish" && canSubmitForReview && status === "draft" && (
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
            title={
              status === "published" ? `Republish this ${itemLabel}?` : `Publish this ${itemLabel}?`
            }
            description={status === "published" ? republishDescription : publishDescription}
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
            title={`Delete this ${itemLabel}?`}
            description="This can't be undone."
            destructive
            confirmLabel="Delete"
            onConfirm={handleDelete}
          />
        )}
      </div>
    </div>
  );
}
