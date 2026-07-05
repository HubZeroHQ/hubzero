"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

type SimpleResult = { status: "success" } | { status: "error"; message: string };

export interface LeadDeleteButtonProps {
  id: string;
  remove: (id: string) => Promise<SimpleResult>;
}

export function LeadDeleteButton({ id, remove }: LeadDeleteButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setError(null);
    const result = await remove(id);
    if (result.status === "success") router.push("/studio/leads");
    else setError(result.message);
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <Alert variant="danger">{error}</Alert>}
      <ConfirmDialog
        trigger={
          <Button variant="secondary" className="text-danger" type="button">
            Delete this lead
          </Button>
        }
        title="Delete this lead?"
        description="This permanently removes the submission and its timeline. This can't be undone."
        destructive
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </div>
  );
}
