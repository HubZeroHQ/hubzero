"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import type { LeadDetailsInput } from "@/actions/studio/leads";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type SimpleResult = { status: "success" } | { status: "error"; message: string };

const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export interface LeadDetailsFormProps {
  id: string;
  initialValues: LeadDetailsInput;
  updateDetails: (id: string, input: LeadDetailsInput) => Promise<SimpleResult>;
}

/** Priority, internal labels, reminder date, and estimated value (Phase F) — one form, one save, since none of these are meaningful timeline events on their own (`actions/studio/leads.ts`'s `updateLeadDetails`). */
export function LeadDetailsForm({ id, initialValues, updateDetails }: LeadDetailsFormProps) {
  const router = useRouter();
  const [priority, setPriority] = useState(initialValues.priority);
  const [labels, setLabels] = useState(initialValues.internalLabels);
  const [labelDraft, setLabelDraft] = useState("");
  const [reminderAt, setReminderAt] = useState(initialValues.reminderAt?.slice(0, 10) ?? "");
  const [estimatedValue, setEstimatedValue] = useState(
    initialValues.estimatedValue != null ? String(initialValues.estimatedValue) : "",
  );
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function addLabel() {
    const trimmed = labelDraft.trim();
    if (!trimmed || labels.includes(trimmed)) {
      setLabelDraft("");
      return;
    }
    setLabels((prev) => [...prev, trimmed]);
    setLabelDraft("");
  }

  function removeLabel(label: string) {
    setLabels((prev) => prev.filter((entry) => entry !== label));
  }

  function handleSave() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateDetails(id, {
        priority,
        internalLabels: labels,
        reminderAt: reminderAt || null,
        estimatedValue: estimatedValue.trim() ? Number(estimatedValue) : null,
      });
      if (result.status === "success") {
        setSaved(true);
        router.refresh();
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <Alert variant="danger">{error}</Alert>}
      <Select
        label="Priority"
        options={priorityOptions}
        value={priority}
        onValueChange={(value) => setPriority(value as LeadDetailsInput["priority"])}
      />

      <div className="flex flex-col gap-2">
        <span className="text-caption text-text-muted">Labels</span>
        <div className="flex flex-wrap gap-1.5">
          {labels.map((label) => (
            <Chip key={label} onRemove={() => removeLabel(label)}>
              {label}
            </Chip>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={labelDraft}
            onChange={(event) => setLabelDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addLabel();
              }
            }}
            placeholder="Add a label…"
            className="flex-1"
          />
          <Button type="button" variant="secondary" size="sm" onClick={addLabel}>
            Add
          </Button>
        </div>
      </div>

      <Input
        type="date"
        label="Reminder date"
        value={reminderAt}
        onChange={(event) => setReminderAt(event.target.value)}
      />

      <Input
        type="number"
        label="Estimated value ($)"
        min={0}
        value={estimatedValue}
        onChange={(event) => setEstimatedValue(event.target.value)}
      />

      <div className="flex items-center gap-3">
        <Button type="button" isLoading={isPending} onClick={handleSave}>
          Save details
        </Button>
        {saved && !isPending && <span className="text-caption text-text-muted">Saved.</span>}
      </div>
    </div>
  );
}
