"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Alert } from "@/components/ui/alert";
import { Select } from "@/components/ui/select";

type SimpleResult = { status: "success" } | { status: "error"; message: string };

const statusOptions = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "closed", label: "Closed" },
];

export interface LeadStatusFormProps {
  id: string;
  status: string;
  updateStatus: (id: string, status: "new" | "contacted" | "closed") => Promise<SimpleResult>;
}

/** Changing status writes a `timeline` entry server-side (`actions/studio/leads.ts`) — this control just picks the new value and refreshes. */
export function LeadStatusForm({ id, status, updateStatus }: LeadStatusFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleChange(value: string) {
    setError(null);
    startTransition(async () => {
      const result = await updateStatus(id, value as "new" | "contacted" | "closed");
      if (result.status === "success") router.refresh();
      else setError(result.message);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <Select
        label="Status"
        options={statusOptions}
        value={status}
        onValueChange={handleChange}
        disabled={isPending}
      />
      {error && <Alert variant="danger">{error}</Alert>}
    </div>
  );
}
