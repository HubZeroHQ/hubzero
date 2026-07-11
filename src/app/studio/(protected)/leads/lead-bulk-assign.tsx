"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import type { AssignableUser } from "@/actions/studio/leads";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import type { BulkActionResult } from "@/types/cms";

export interface LeadBulkAssignProps {
  selectedIds: string[];
  onDone: () => void;
  assignableUsers: AssignableUser[];
  bulkAssign: (ids: string[], assigneeId: string | null) => Promise<BulkActionResult>;
}

/** Leads' bulk-assign control — the one bulk action that needs more than a single confirm click (an assignee picker), so it plugs into `<DataTable>`'s `extraBulkActions` slot rather than living inside that generic component. */
export function LeadBulkAssign({
  selectedIds,
  onDone,
  assignableUsers,
  bulkAssign,
}: LeadBulkAssignProps) {
  const router = useRouter();
  const [assigneeId, setAssigneeId] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleAssign() {
    if (!assigneeId) return;
    startTransition(async () => {
      await bulkAssign(selectedIds, assigneeId);
      onDone();
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        options={assignableUsers.map((user) => ({ value: user.id, label: user.name }))}
        placeholder="Assign to…"
        value={assigneeId}
        onValueChange={setAssigneeId}
        className="w-40"
      />
      <Button
        size="sm"
        variant="secondary"
        isLoading={isPending}
        disabled={!assigneeId}
        onClick={handleAssign}
      >
        Assign
      </Button>
    </div>
  );
}
