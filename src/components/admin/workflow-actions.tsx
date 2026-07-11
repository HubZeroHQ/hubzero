"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
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
  /** ISO string or `undefined` — when set, a "Scheduled to publish at …" notice + Cancel control render instead of the Schedule button. */
  scheduledPublishAt?: string;
  /** ISO string or `undefined` — same, for a pending unpublish on an already-`"published"` document. */
  scheduledUnpublishAt?: string;
  /** All five (Phase B, `crud-actions.ts`) are optional so this component still renders for any caller mid-migration — omit any one and its control simply doesn't render. */
  schedulePublish?: (id: string, at: Date) => Promise<SimpleResult>;
  scheduleUnpublish?: (id: string, at: Date) => Promise<SimpleResult>;
  cancelSchedule?: (id: string) => Promise<SimpleResult>;
  archive?: (id: string) => Promise<SimpleResult>;
  restoreArchive?: (id: string) => Promise<SimpleResult>;
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
  scheduledPublishAt,
  scheduledUnpublishAt,
  schedulePublish,
  scheduleUnpublish,
  cancelSchedule,
  archive,
  restoreArchive,
}: WorkflowActionsProps) {
  const router = useRouter();
  const [isSubmitting, startSubmitTransition] = useTransition();
  const [isCanceling, startCancelTransition] = useTransition();
  const [isRestoring, startRestoreTransition] = useTransition();
  // Every action below returned `{ status: "error", message }` on a guard/
  // permission failure with nothing rendering it — found during Phase D's
  // manual testing via Blueprint's `publishGuard` (`demoStatus !== "live"`):
  // the confirm dialog closed, the document silently stayed a draft, and an
  // editor had no way to tell why. Not new to this component (the same gap
  // existed in the Case Study-only predecessor this generalizes), but this
  // is the one place to fix it once for every collection.
  const [actionError, setActionError] = useState<string | null>(null);
  const [scheduleValue, setScheduleValue] = useState("");

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

  async function handleSchedulePublish() {
    if (!schedulePublish || !scheduleValue) return;
    setActionError(null);
    const result = await schedulePublish(id, new Date(scheduleValue));
    if (result.status === "success") router.refresh();
    else setActionError(result.message);
  }

  async function handleScheduleUnpublish() {
    if (!scheduleUnpublish || !scheduleValue) return;
    setActionError(null);
    const result = await scheduleUnpublish(id, new Date(scheduleValue));
    if (result.status === "success") router.refresh();
    else setActionError(result.message);
  }

  async function handleArchive() {
    if (!archive) return;
    setActionError(null);
    const result = await archive(id);
    if (result.status === "success") router.refresh();
    else setActionError(result.message);
  }

  function handleCancelSchedule() {
    if (!cancelSchedule) return;
    setActionError(null);
    startCancelTransition(async () => {
      const result = await cancelSchedule(id);
      if (result.status === "success") router.refresh();
      else setActionError(result.message);
    });
  }

  function handleRestoreArchive() {
    if (!restoreArchive) return;
    setActionError(null);
    startRestoreTransition(async () => {
      const result = await restoreArchive(id);
      if (result.status === "success") router.refresh();
      else setActionError(result.message);
    });
  }

  if (!canSubmitForReview && !canPublish && !canDelete) return null;

  const pendingSchedule =
    status === "scheduled"
      ? scheduledPublishAt
      : status === "published"
        ? scheduledUnpublishAt
        : undefined;

  // An archived document's only way back into the workflow is `restoreArchive`
  // (`crud-actions.ts`'s own "never straight back to published" rule) — so
  // Submit-for-review/Publish/Schedule/Archive controls all stay hidden here,
  // Restore takes their place, and Delete remains available alongside it.
  if (status === "archived") {
    return (
      <div className="flex flex-col gap-3">
        {actionError && <Alert variant="danger">{actionError}</Alert>}
        <div className="flex flex-wrap items-center gap-3">
          <Text size="caption" tone="muted">
            Archived — no longer visible on the public site.
          </Text>
          {canPublish && restoreArchive && (
            <Button
              variant="secondary"
              isLoading={isRestoring}
              onClick={handleRestoreArchive}
              type="button"
            >
              Restore as draft
            </Button>
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

  return (
    <div className="flex flex-col gap-3">
      {actionError && <Alert variant="danger">{actionError}</Alert>}
      {pendingSchedule && (
        <div className="bg-bg-light border-border-muted flex flex-wrap items-center gap-3 rounded-md border p-3">
          <Text size="caption">
            {status === "scheduled" ? "Scheduled to publish" : "Scheduled to unpublish"} at{" "}
            {new Date(pendingSchedule).toLocaleString()}.
          </Text>
          {cancelSchedule && (
            <Button
              variant="ghost"
              size="sm"
              isLoading={isCanceling}
              onClick={handleCancelSchedule}
              type="button"
            >
              Cancel schedule
            </Button>
          )}
        </div>
      )}
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
        {canPublish && schedulePublish && status !== "published" && (
          <ConfirmDialog
            trigger={
              <Button variant="secondary" type="button">
                Schedule publish…
              </Button>
            }
            title={`Schedule this ${itemLabel} to publish`}
            description="It will publish automatically at the date and time below."
            confirmLabel="Schedule"
            confirmDisabled={!scheduleValue}
            onConfirm={handleSchedulePublish}
          >
            <div className="mt-4">
              <Input
                type="datetime-local"
                label="Publish at"
                value={scheduleValue}
                onChange={(event) => setScheduleValue(event.target.value)}
              />
            </div>
          </ConfirmDialog>
        )}
        {canPublish && scheduleUnpublish && status === "published" && (
          <ConfirmDialog
            trigger={
              <Button variant="secondary" type="button">
                Schedule unpublish…
              </Button>
            }
            title={`Schedule this ${itemLabel} to unpublish`}
            description="It will be archived (removed from the public site) automatically at the date and time below."
            confirmLabel="Schedule"
            confirmDisabled={!scheduleValue}
            onConfirm={handleScheduleUnpublish}
          >
            <div className="mt-4">
              <Input
                type="datetime-local"
                label="Unpublish at"
                value={scheduleValue}
                onChange={(event) => setScheduleValue(event.target.value)}
              />
            </div>
          </ConfirmDialog>
        )}
        {canPublish && archive && status === "published" && (
          <ConfirmDialog
            trigger={
              <Button variant="secondary" className="text-danger" type="button">
                Archive
              </Button>
            }
            title={`Archive this ${itemLabel}?`}
            description="It's removed from the public site immediately. It isn't deleted — you can restore it as a draft later."
            confirmLabel="Archive"
            onConfirm={handleArchive}
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
