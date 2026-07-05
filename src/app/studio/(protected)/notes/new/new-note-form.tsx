"use client";

import { create } from "@/actions/studio/notes";
import { CmsCreateForm } from "@/components/admin/form/cms-create-form";
import { noteFormFields, type NoteInput } from "@/lib/cms/collections/note-fields";

export function NewNoteForm() {
  return (
    <CmsCreateForm<NoteInput>
      fields={noteFormFields}
      action={create}
      redirectTo={(id) => `/studio/notes/${id}`}
    />
  );
}
