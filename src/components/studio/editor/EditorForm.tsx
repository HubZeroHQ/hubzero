'use client';

import { Fragment, useEffect, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { useFormEditorState } from '@/lib/studio/editor-state/use-form-editor-state';
import type { EntryActionState } from '@/lib/studio/entry-actions';
import { cn } from '@/lib/utils/cn';
import { SaveStateIndicator } from './SaveStateIndicator';

const EMPTY_STATE: EntryActionState = {};

/**
 * The shell every Studio metadata form is written inside — the single place
 * the editor-state system is wired up, so a collection's form contains only
 * its fields.
 *
 * Replacing a form's own `useActionState` + `<form action>` + submit button
 * with this component is the whole opt-in: dirty detection, the save-state
 * chip, the sticky save bar, navigation protection, unload protection,
 * `Ctrl/Cmd+S`, and in-place discard all follow. A new collection's form is
 * therefore fields plus this wrapper, with no per-collection editor logic to
 * copy — which is the point of doing this once at the platform level rather
 * than eleven times.
 *
 * **Before adding a field here, read `docs/architecture/ADR_EDITOR_STATE.md`.**
 * Everything above depends on one invariant — every field submits through a
 * native form control inside this `<form>` — and a field that bypasses it
 * silently loses dirty detection and navigation protection with no error and
 * no failing test.
 *
 * `children` is a render prop rather than plain nodes because every existing
 * form reads `state.fieldErrors?.<name>` inline next to the field it belongs
 * to. Passing the action state down that way keeps each form's field markup
 * byte-for-byte what it already was.
 */
export function EditorForm({
  action,
  submitLabel,
  label,
  id,
  className,
  children,
  footer,
}: {
  action: (prevState: EntryActionState, formData: FormData) => Promise<EntryActionState>;
  submitLabel: string;
  /** Names this editor in the save bar and leave dialog — e.g. "Work metadata". */
  label: string;
  /** Only needed when a screen hosts more than one `EditorForm`. */
  id?: string;
  className?: string;
  children: (state: EntryActionState) => ReactNode;
  /** Extra controls rendered beside the submit button. */
  footer?: ReactNode;
}) {
  const editor = useFormEditorState({ action, label, id });
  const { state, resetKey } = editor;

  // A discard clears the previous attempt's error banner and field errors
  // along with the values they described — leaving them up would annotate
  // fields that no longer hold the text that failed validation.
  const [displayState, setDisplayState] = useState<EntryActionState>(state);
  useEffect(() => {
    setDisplayState(state);
  }, [state]);
  useEffect(() => {
    if (resetKey > 0) {
      setDisplayState(EMPTY_STATE);
    }
  }, [resetKey]);

  return (
    <form
      {...editor.formProps}
      className={cn('flex max-w-2xl flex-col gap-6', className)}
      aria-busy={editor.pending || undefined}
    >
      {displayState.error ? (
        <p role="alert" className="text-danger text-sm">
          {displayState.error}
        </p>
      ) : null}

      <Fragment key={resetKey}>{children(displayState)}</Fragment>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={editor.pending}>
          {editor.pending ? 'Saving' : submitLabel}
        </Button>
        {/* No inline Discard: while there is anything to discard, the sticky
            save bar is on screen offering exactly that, and two live Discard
            controls at once is one more than an author should have to
            reconcile. */}
        <SaveStateIndicator
          status={editor.status}
          lastSavedAt={editor.lastSavedAt}
          error={displayState.error}
        />
        {footer}
      </div>

      {/* The sticky save bar is viewport-fixed, so without this the form's own
          controls sit underneath it exactly when they matter most. */}
      {editor.isDirty ? <div aria-hidden className="h-24" /> : null}
    </form>
  );
}
