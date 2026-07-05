"use client";

import { type FormEvent, useState, useTransition } from "react";

import { graduateToBuild } from "@/actions/studio/labs-projects";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { ReferencePicker } from "@/components/admin/form/reference-picker";

export interface GraduateToBuildFormProps {
  labsProjectId: string;
}

/**
 * The UI for the one bespoke action this collection has
 * (`actions/studio/labs-projects.ts`'s `graduateToBuild`) — reuses
 * `<ReferencePicker>` directly (rather than through `CmsField`/`FieldConfig`,
 * since this isn't a regular form field) for the same reason every other
 * `reference` field does: searching for a Build by title beats knowing its
 * Mongo ID.
 */
export function GraduateToBuildForm({ labsProjectId }: GraduateToBuildFormProps) {
  const [buildId, setBuildId] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!buildId) return;
    setError(null);
    startTransition(async () => {
      const result = await graduateToBuild(labsProjectId, buildId);
      if (result.status === "success") {
        // A full reload, not `router.refresh()`: this action mutates the
        // same `LabsProject` document the sibling `<CmsEditForm>` on this
        // page is editing, but that form's `values` state is initialized
        // once from `initialValues` and never resyncs on a prop change
        // (`cms-form.tsx`) — a `router.refresh()` here would leave the form
        // holding the pre-graduation `stage` value, and the next autosave
        // tick would silently write it back, undoing the graduation. A hard
        // reload remounts the form with the server's post-graduation state.
        window.location.reload();
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-border-muted flex flex-wrap items-end gap-3 rounded-lg border p-4"
    >
      <ReferencePicker
        name="buildId"
        label="Mark as graduated — target Build"
        hint="Links both records and sets this project's stage to graduated."
        resource="build"
        labelField="title"
        value={buildId}
        onChange={setBuildId}
        required
      />
      <Button type="submit" variant="secondary" isLoading={isPending} disabled={!buildId}>
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
