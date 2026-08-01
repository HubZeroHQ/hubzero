'use client';

import { EditorForm } from '@/components/studio/editor/EditorForm';
import { fieldClassName } from '@/components/ui/Input';
import type { EntryActionState } from '@/lib/studio/entry-actions';

/**
 * Not a content collection, but it *is* an editor — free text an author can
 * spend real time on and lose by clicking away. It opts into the shared
 * editor-state system exactly the way a collection form does, which is the
 * point of that system being platform-level: nothing in it is Lead-specific.
 */
export function LeadNotesForm({
  internalNotes,
  action,
}: {
  internalNotes?: string;
  action: (prevState: EntryActionState, formData: FormData) => Promise<EntryActionState>;
}) {
  return (
    <EditorForm
      action={action}
      submitLabel="Save notes"
      label="Lead notes"
      id="lead-notes"
      className="max-w-none gap-3"
    >
      {() => (
        <textarea
          id="internalNotes"
          name="internalNotes"
          defaultValue={internalNotes}
          rows={5}
          placeholder="Internal notes — never shown to the sender."
          className={fieldClassName}
        />
      )}
    </EditorForm>
  );
}
