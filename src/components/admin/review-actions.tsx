"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type SimpleResult = { status: "success" } | { status: "error"; message: string };

export interface ReviewActionsProps {
  id: string;
  status: string;
  canReview: boolean;
  approve: (id: string) => Promise<SimpleResult>;
  requestChanges: (id: string, message: string) => Promise<SimpleResult>;
  reject: (id: string, message: string) => Promise<SimpleResult>;
  itemLabel: string;
}

/**
 * The three reviewer decisions on a document currently `"review"` (Phase C)
 * — approve, request changes, reject — rendered alongside (not inside)
 * `WorkflowActions`, since these are a distinct "reviewer" role's controls,
 * not the author's publish/schedule/archive controls, and only ever apply
 * to one status. All three route through the generic engine
 * (`crud-actions.ts`'s `approve`/`requestChanges`/`reject`), same "no
 * bespoke mutation" discipline `WorkflowActions` already follows.
 */
export function ReviewActions({
  id,
  status,
  canReview,
  approve,
  requestChanges,
  reject,
  itemLabel,
}: ReviewActionsProps) {
  const router = useRouter();
  const [actionError, setActionError] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  if (!canReview || status !== "review") return null;

  async function handleApprove() {
    setActionError(null);
    const result = await approve(id);
    if (result.status === "success") router.refresh();
    else setActionError(result.message);
  }

  async function handleRequestChanges() {
    setActionError(null);
    const result = await requestChanges(id, message);
    if (result.status === "success") {
      setMessage("");
      router.refresh();
    } else setActionError(result.message);
  }

  async function handleReject() {
    setActionError(null);
    const result = await reject(id, message);
    if (result.status === "success") {
      setMessage("");
      router.refresh();
    } else setActionError(result.message);
  }

  return (
    <div className="border-border-muted flex flex-col gap-3 rounded-md border p-4">
      {actionError && <Alert variant="danger">{actionError}</Alert>}
      <div className="flex flex-wrap gap-3">
        <ConfirmDialog
          trigger={
            <Button variant="secondary" type="button">
              Approve
            </Button>
          }
          title={`Approve this ${itemLabel}?`}
          description="It's ready to publish, but publishing is still a separate step."
          confirmLabel="Approve"
          onConfirm={handleApprove}
        />
        <ConfirmDialog
          trigger={
            <Button variant="secondary" type="button">
              Request changes…
            </Button>
          }
          title={`Request changes on this ${itemLabel}`}
          description="Sends it back to the author with your comment. They can resubmit once it's addressed."
          confirmLabel="Request changes"
          confirmDisabled={!message.trim()}
          onConfirm={handleRequestChanges}
        >
          <div className="mt-4">
            <Textarea
              label="What needs to change?"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={4}
            />
          </div>
        </ConfirmDialog>
        <ConfirmDialog
          trigger={
            <Button variant="secondary" className="text-danger" type="button">
              Reject…
            </Button>
          }
          title={`Reject this ${itemLabel}?`}
          description="Sends it back to draft, outside the review queue entirely — for content that needs substantial rework, not a light revision."
          confirmLabel="Reject"
          destructive
          confirmDisabled={!message.trim()}
          onConfirm={handleReject}
        >
          <div className="mt-4">
            <Textarea
              label="Why is this being rejected?"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={4}
            />
          </div>
        </ConfirmDialog>
      </div>
    </div>
  );
}
