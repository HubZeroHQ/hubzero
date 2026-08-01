'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useEditorRegistry } from '@/lib/studio/editor-state/context';
import { useEditorGuardState } from '@/lib/studio/editor-state/use-editor-guard-state';
import { SaveStateIndicator } from './SaveStateIndicator';

/**
 * The persistent "you have unsaved changes" bar (phase brief §4). Rendered
 * once by `EditorGuardProvider` rather than by each editor, so two dirty
 * editors on one screen produce one bar instead of two overlapping ones —
 * and so an editor gains the bar by registering, with no layout work of its
 * own.
 *
 * It is bound to dirty state, not to a dismissible flag: there is no control
 * that hides it, and it disappears on exactly two events — a save that
 * succeeded, or a discard. A failed save leaves it up, showing why.
 *
 * Editors that already render their own save controls (the Document Engine's
 * header) set `showsSaveBar: false` and are filtered out here; they still
 * participate in navigation protection.
 */
export function StickySaveBar() {
  const registry = useEditorRegistry();
  const { editors } = useEditorGuardState();
  const [busy, setBusy] = useState(false);

  const dirty = editors.filter((editor) => editor.isDirty && editor.showsSaveBar);
  if (!registry || dirty.length === 0) {
    return null;
  }

  const single = dirty.length === 1 ? dirty[0] : null;
  const saving = busy || dirty.some((editor) => editor.status === 'saving');
  const failed = dirty.find((editor) => editor.status === 'error');
  const canDiscard = dirty.every((editor) => editor.canDiscard);

  async function handleSave() {
    setBusy(true);
    try {
      await registry!.saveAll();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      role="region"
      aria-label="Unsaved changes"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center p-4"
    >
      <div className="border-border-default bg-surface-overlay rounded-overlay pointer-events-auto flex w-full max-w-2xl flex-col gap-3 border p-4 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.7)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="text-text-primary text-sm font-semibold">
            {single ? 'Unsaved changes' : `${dirty.length} sections have unsaved changes`}
          </p>
          <p className="text-text-secondary text-xs">
            {failed?.error
              ? failed.error
              : single
                ? `You have changes to ${single.label} that haven't been saved.`
                : "You have changes that haven't been saved."}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <SaveStateIndicator
            status={saving ? 'saving' : failed ? 'error' : 'dirty'}
            className="mr-1 hidden sm:flex"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => registry.discardAll()}
            disabled={saving || !canDiscard}
          >
            Discard
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
}
