"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type SimpleResult = { status: "success" } | { status: "error"; message: string };

export interface LeadNoteFormProps {
  id: string;
  addNote: (id: string, message: string) => Promise<SimpleResult>;
}

/** Appends one `timeline` entry (`type: "note"`) — the one write path notes actually have, per `models/lead.ts`'s unified timeline/notes mechanism. */
export function LeadNoteForm({ id, addNote }: LeadNoteFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await addNote(id, message);
      if (result.status === "success") {
        setMessage("");
        router.refresh();
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <Textarea
        label="Add a note"
        placeholder="Internal note — visible only in the Studio."
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        rows={3}
      />
      {error && <Alert variant="danger">{error}</Alert>}
      <Button
        type="button"
        variant="secondary"
        size="sm"
        isLoading={isPending}
        disabled={!message.trim()}
        onClick={handleSubmit}
        className="self-start"
      >
        Add note
      </Button>
    </div>
  );
}
