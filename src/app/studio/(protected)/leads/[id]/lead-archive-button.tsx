"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type SimpleResult = { status: "success" } | { status: "error"; message: string };

export interface LeadArchiveButtonProps {
  id: string;
  status: string;
  updateStatus: (
    id: string,
    status: "new" | "contacted" | "closed" | "archived",
  ) => Promise<SimpleResult>;
}

/**
 * Archive/restore as a dedicated action rather than a fourth option in
 * `LeadStatusForm`'s plain triage dropdown (Phase F) — "archived" is a
 * distinct, deliberate action, not one more triage state alongside
 * New/Contacted/Closed, even though it's stored
 * in the same `status` field (`models/lead.ts`'s own comment). Restoring
 * always lands on `"new"` — the identical "sensible default, not whatever it
 * was before" rule `restoreArchive` (Phase B) already established.
 */
export function LeadArchiveButton({ id, status, updateStatus }: LeadArchiveButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isArchived = status === "archived";

  function handleClick() {
    startTransition(async () => {
      await updateStatus(id, isArchived ? "new" : "archived");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {isArchived && (
        <Alert variant="info">This lead is archived. Filter by status to find it again.</Alert>
      )}
      <Button
        type="button"
        variant="secondary"
        className={isArchived ? undefined : "text-danger"}
        isLoading={isPending}
        onClick={handleClick}
      >
        {isArchived ? "Restore" : "Archive"}
      </Button>
    </div>
  );
}
