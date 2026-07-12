"use client";

import { autosaveDraft, update } from "@/actions/studio/notes";
import { CmsEditForm } from "@/components/admin/form/cms-edit-form";
import { noteFormFields, type NoteInput } from "@/lib/cms/collections/note-fields";

export interface EditNoteFormProps {
  id: string;
  initialValues: Partial<NoteInput>;
  isDraft: boolean;
}

export function EditNoteForm({ id, initialValues, isDraft }: EditNoteFormProps) {
  return (
    <CmsEditForm<NoteInput>
      fields={noteFormFields}
      initialValues={initialValues}
      updateAction={update.bind(null, id)}
      autosaveAction={(values) => autosaveDraft(id, values)}
      isDraft={isDraft}
    />
  );
}
