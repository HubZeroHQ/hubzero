"use client";

import { useActionState, useEffect, useRef } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadMediaAction, type MediaUploadActionState } from "@/actions/studio/media";
import type { ClientMedia } from "@/lib/cms/media";

export interface MediaUploadFormProps {
  onUploaded: (media: ClientMedia) => void;
}

const initialState: MediaUploadActionState = { status: "idle" };

/**
 * The upload half of `<MediaPickerModal>` — a file, required alt text, and
 * an optional caption (`ARCHITECTURE/19_CMS_FOUNDATION.md` §8's metadata
 * requirements). On success, hands the newly created `Media` straight to the
 * caller (which selects it) rather than requiring a second "now find it in
 * the grid" step.
 */
export function MediaUploadForm({ onUploaded }: MediaUploadFormProps) {
  const [state, formAction, isPending] = useActionState(uploadMediaAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success" && state.media) {
      onUploaded(state.media);
      formRef.current?.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <Input
        name="file"
        type="file"
        label="File"
        required
        accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
        error={state.fieldErrors?.file}
      />
      <Input
        name="alt"
        label="Alt text"
        required
        hint="Describes the image for screen readers — required for every upload."
        placeholder="e.g. Jane Doe smiling in the HubZero workshop"
        error={state.fieldErrors?.alt}
      />
      <Input name="caption" label="Caption" hint="Optional." />

      {state.formError && <Alert variant="danger">{state.formError}</Alert>}

      <Button type="submit" isLoading={isPending}>
        Upload
      </Button>
    </form>
  );
}
