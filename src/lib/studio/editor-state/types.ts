/**
 * The Studio's platform-level editor-state contract (v3.1 Phase 1).
 *
 * Every editable surface in the Studio — a collection's metadata form, the
 * Document Engine's block editor, and any editor added later — describes
 * itself to the shell through exactly this one shape. Nothing in the shell
 * (the navigation guard, the sticky save bar, the unload protection) knows
 * what collection it is looking at; it only reads `EditorHandle`. That is
 * what makes "a future editor opts in with minimal code" true rather than
 * aspirational: implement this interface, register it, and every behavior
 * in this phase applies automatically.
 *
 * Deliberately *not* modelled here, per the phase brief's "future
 * compatibility" requirement: autosave cadence, conflict resolution,
 * presence, and version history. The shape below is nonetheless compatible
 * with all four — `save()` returning a `Promise<boolean>` rather than
 * `void` is what lets a future conflict-resolution step refuse a save; the
 * per-editor `id`/`label` pair is what a future presence indicator would
 * key on; and `savesAutomatically` already distinguishes an autosaving
 * editor from a manually-saved one without the shell special-casing the
 * Document Engine by name.
 */

/**
 * The lifecycle a Studio editor moves through (phase brief §9). Kept
 * deliberately smaller than the Document Engine's own `AutosaveStatus` —
 * `invalid` is not a distinct state here because a metadata form surfaces
 * validation through native constraint validation and per-field errors, not
 * through the save-state chip.
 */
export type EditorSaveStatus = 'saved' | 'dirty' | 'saving' | 'error';

export interface EditorSaveOptions {
  /** Skip an in-place refresh when an approved navigation immediately follows the save. */
  refresh?: boolean;
}

export interface EditorHandle {
  /** Stable within a screen. Two editors on one page (metadata + Document) must not collide. */
  id: string;
  /** Shown in the save bar and the leave dialog when more than one editor is dirty. */
  label: string;
  /**
   * True when the editor's current values differ from its last successfully
   * saved snapshot — a *value* comparison, never "a field was touched".
   *
   * This is the value the guard *renders* from (the save bar, the leave
   * dialog's list). It is published through React, so it can trail the DOM by
   * a frame or by a throttle window. It must never be what a navigation
   * decision is made from — see `isDirtyNow`.
   */
  isDirty: boolean;
  /**
   * Live, synchronous dirty check, evaluated at the instant a decision is
   * taken rather than read from whatever was last published.
   *
   * This exists because the two questions have different requirements.
   * "What should the save bar show?" tolerates a frame of lag. "May this
   * navigation proceed?" tolerates none: an author who types a character and
   * immediately clicks a sidebar link would otherwise be judged against dirty
   * state computed *before* they typed, and would leave with their edit
   * silently discarded.
   *
   * Optional: an editor whose dirty state is already derived synchronously
   * during render (the Document Engine, where it is a reference comparison on
   * `blocks`) can omit it and the guard falls back to `isDirty`.
   */
  isDirtyNow?: () => boolean;
  status: EditorSaveStatus;
  /** The user-facing reason the last save attempt failed, when `status === 'error'`. */
  error?: string;
  /**
   * Persists the editor. Resolves `true` only once the change is actually
   * stored; resolves `false` for a validation failure or a server error, in
   * which case the caller must not navigate.
   */
  save: (options?: EditorSaveOptions) => Promise<boolean>;
  /** Restores the last successfully saved snapshot in place. Never a page reload. */
  discard: () => void;
  /**
   * `true` for an editor that persists on its own (the Document Engine's
   * debounced autosave). The guard flushes those silently on navigation
   * instead of interrupting the editor with a dialog, and only prompts if
   * the flush itself fails.
   */
  savesAutomatically: boolean;
  /**
   * `false` for an editor that already renders its own save controls, so the
   * shared sticky bar doesn't duplicate them. Such an editor still
   * participates in navigation protection.
   */
  showsSaveBar: boolean;
  /**
   * `false` while the editor's saved snapshot is still being re-fetched from
   * the server, during which "restore the last saved snapshot" would restore
   * a stale one.
   */
  canDiscard: boolean;
}

/** What the guard was asked to do once the user resolves their unsaved changes. */
export interface NavigationIntent {
  /** Runs only after every blocking editor is saved or discarded. */
  perform: () => void;
  /** Describes the destination for telemetry/debugging; not shown to the user. */
  description?: string;
}

export interface EditorGuardSnapshot {
  editors: EditorHandle[];
  /** Non-null while the leave dialog is open and a navigation is waiting on the user. */
  pendingIntent: NavigationIntent | null;
  /** True while "Save & Leave" (or a silent autosave flush) is in flight. */
  resolving: boolean;
  /** Why the last "Save & Leave" attempt did not navigate. */
  resolveError: string | null;
}
