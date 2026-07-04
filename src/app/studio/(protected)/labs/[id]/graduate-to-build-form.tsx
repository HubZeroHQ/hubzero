"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState, useTransition } from "react";

import { graduateToBuild } from "@/actions/studio/labs-projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";

export interface GraduateToBuildFormProps {
  labsProjectId: string;
}

/**
 * The UI for the one bespoke action this collection has
 * (`actions/studio/labs-projects.ts`'s `graduateToBuild`) — a plain Build-ID
 * input, the same placeholder-picker precedent the `reference` field type
 * already establishes (`ARCHITECTURE/19_CMS_FOUNDATION.md` §6: "a
 * searchable picker lands in a later phase").
 */
export function GraduateToBuildForm({ labsProjectId }: GraduateToBuildFormProps) {
  const router = useRouter();
  const [buildId, setBuildId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await graduateToBuild(labsProjectId, buildId.trim());
      if (result.status === "success") router.refresh();
      else setError(result.message);
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-border-muted flex flex-wrap items-end gap-3 rounded-lg border p-4"
    >
      <Input
        label="Mark as graduated — Build ID"
        hint="Paste the target Build's ID. Links both records and sets this project's stage to graduated."
        value={buildId}
        onChange={(event) => setBuildId(event.target.value)}
        required
        className="min-w-[20rem]"
      />
      <Button type="submit" variant="secondary" isLoading={isPending}>
        Graduate to Build
      </Button>
      {error && (
        <Text size="caption" className="text-danger w-full">
          {error}
        </Text>
      )}
    </form>
  );
}
