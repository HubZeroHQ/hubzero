'use client';

import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { useEditorRegistry } from '@/lib/studio/editor-state/context';
import { useEditorGuardState } from '@/lib/studio/editor-state/use-editor-guard-state';

/**
 * The confirmation every blocked navigation goes through (phase brief §5/§7).
 * Rendered once by `EditorGuardProvider`; every interception point — anchor
 * clicks, Back/Forward, the command palette, keyboard jumps — resolves
 * through this same dialog, so the three answers mean the same thing
 * everywhere.
 *
 * Built on the shared `Dialog` primitive, which is Radix underneath: focus
 * is trapped and restored, and Escape closes — and Escape closing maps to
 * "Stay Editing", the only answer that is safe to give by accident. The
 * navigation itself never proceeds until one of the three is chosen
 * (Escape/scrim included, since staying *is* one of them).
 *
 * "Save & Leave" navigates only after `save()` resolves true. A failed save
 * keeps the dialog open with the reason and leaves the editor untouched
 * behind it, which is why the primary button re-enables rather than the
 * dialog closing optimistically.
 */
export function UnsavedChangesDialog() {
  const registry = useEditorRegistry();
  const { pendingIntent, resolving, resolveError, editors } = useEditorGuardState();

  if (!registry) {
    return null;
  }

  const open = pendingIntent !== null;
  const dirty = editors.filter((editor) => editor.isDirty);
  const canDiscard = dirty.every((editor) => editor.canDiscard);

  return (
    <Dialog
      open={open}
      // Escape, the ✕, and the scrim stay live even mid-save — see
      // `cancelNavigation`. Gating them on `resolving` meant a save that never
      // came back left no way out of this dialog at all.
      onOpenChange={(next) => {
        if (!next) {
          registry.cancelNavigation();
        }
      }}
      title="Leave page?"
      description="You have unsaved changes. If you leave now your edits will be lost."
    >
      <div className="flex flex-col gap-4">
        {dirty.length > 1 ? (
          <ul className="text-text-secondary flex list-disc flex-col gap-1 pl-5 text-sm">
            {dirty.map((editor) => (
              <li key={editor.id}>{editor.label}</li>
            ))}
          </ul>
        ) : null}

        {resolveError ? (
          <p role="alert" className="text-danger text-sm">
            {resolveError}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          {/* Never disabled. Whatever else is happening — a save in flight, a
              request that has stopped responding — returning to the page must
              stay reachable, or a stalled save becomes a trap. */}
          <Button type="button" variant="secondary" onClick={() => registry.cancelNavigation()}>
            Stay Editing
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => registry.discardAndProceed()}
            disabled={resolving || !canDiscard}
          >
            Discard Changes
          </Button>
          <Button type="button" onClick={() => void registry.saveAndProceed()} disabled={resolving}>
            {resolving ? 'Saving' : 'Save & Leave'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
