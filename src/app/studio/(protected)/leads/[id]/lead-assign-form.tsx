"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Alert } from "@/components/ui/alert";
import { Select } from "@/components/ui/select";
import type { AssignableUser } from "@/actions/studio/leads";

type SimpleResult = { status: "success" } | { status: "error"; message: string };

const UNASSIGNED_VALUE = "__unassigned__";

export interface LeadAssignFormProps {
  id: string;
  assignedTo: string | null;
  assignableUsers: AssignableUser[];
  assignLead: (id: string, assigneeId: string | null) => Promise<SimpleResult>;
}

/** Assignment is real, not a placeholder: the dropdown lists actual Admin/Head Admin accounts (`getAssignableUsers`), and picking one writes a `timeline` entry server-side. */
export function LeadAssignForm({ id, assignedTo, assignableUsers, assignLead }: LeadAssignFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const options = [
    { value: UNASSIGNED_VALUE, label: "Unassigned" },
    ...assignableUsers.map((user) => ({ value: user.id, label: `${user.name} (${user.email})` })),
  ];

  function handleChange(value: string) {
    setError(null);
    startTransition(async () => {
      const result = await assignLead(id, value === UNASSIGNED_VALUE ? null : value);
      if (result.status === "success") router.refresh();
      else setError(result.message);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <Select
        label="Assigned to"
        options={options}
        value={assignedTo ?? UNASSIGNED_VALUE}
        onValueChange={handleChange}
        disabled={isPending}
      />
      {error && <Alert variant="danger">{error}</Alert>}
    </div>
  );
}
