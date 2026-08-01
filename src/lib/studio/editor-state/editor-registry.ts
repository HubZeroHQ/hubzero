import type { EditorGuardSnapshot, EditorHandle, NavigationIntent } from './types';

/**
 * The one place that knows which editors on the current screen hold unsaved
 * work, and what should happen when something tries to navigate away from
 * them.
 *
 * Implemented as a plain external store (subscribe / getSnapshot, consumed
 * through `useSyncExternalStore`) rather than React state on a provider, for
 * two reasons. First, correctness: the click/`popstate`/`beforeunload`
 * listeners that guard navigation are DOM listeners, and they need to read
 * *current* dirty state at the moment the event fires — not the value
 * captured when the listener was attached. Second, cost: the provider sits
 * above the entire Studio shell, so putting per-keystroke dirty state in its
 * React state would re-render the sidebar, top bar, and command palette on
 * every character typed into a form. Only the guard's own surface (the
 * sticky bar and the leave dialog) subscribes.
 *
 * All navigation orchestration lives here, not in a component, so the
 * decision table — "no dirty editors → go; only autosaving editors dirty →
 * flush then go; otherwise → ask" — is plain, testable TypeScript.
 */
export class EditorRegistry {
  private readonly handles = new Map<string, EditorHandle>();
  private readonly listeners = new Set<() => void>();

  private pendingIntent: NavigationIntent | null = null;
  private resolving = false;
  private resolveError: string | null = null;

  /**
   * Incremented every time the author resolves — or abandons — the current
   * question. An async resolution (a silent flush, "Save & Leave") captures
   * this value up front and checks it again before navigating, so a save that
   * completes *after* the author pressed "Stay Editing" can no longer carry
   * out the navigation they just cancelled.
   */
  private resolutionId = 0;

  /**
   * Set while an approved navigation is being performed, so the unload and
   * history guards stand down for the departure they themselves authorized.
   */
  private bypassing = false;

  private snapshot: EditorGuardSnapshot = {
    editors: [],
    pendingIntent: null,
    resolving: false,
    resolveError: null,
  };

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = (): EditorGuardSnapshot => this.snapshot;

  /**
   * Registers an editor, or replaces its previously published handle. Editors
   * call this on every meaningful state change; the snapshot is only
   * rebuilt (and subscribers only notified) when something the guard
   * actually reads has changed.
   */
  publish(handle: EditorHandle): void {
    const previous = this.handles.get(handle.id);
    this.handles.set(handle.id, handle);
    if (
      previous &&
      previous.isDirty === handle.isDirty &&
      previous.status === handle.status &&
      previous.error === handle.error &&
      previous.label === handle.label &&
      previous.canDiscard === handle.canDiscard &&
      previous.showsSaveBar === handle.showsSaveBar &&
      previous.savesAutomatically === handle.savesAutomatically
    ) {
      // Only the callbacks changed identity (a re-render). The stored handle
      // is updated above so `save()`/`discard()` stay current, but there is
      // nothing for a subscriber to re-render for.
      return;
    }
    this.emit();
  }

  unregister(id: string): void {
    if (this.handles.delete(id)) {
      this.emit();
    }
  }

  /**
   * Editors holding work that would be lost right now — emphasis on *now*.
   *
   * Every safety decision in this class routes through here, and every one of
   * them asks the editor to evaluate itself at this instant rather than
   * reading the last value it published. Published state is a render input; it
   * legitimately lags by a frame or a throttle window. A guard that consults
   * it is guessing about the past, and the gap is exactly wide enough for
   * "type a character, immediately click a link" to slip through and lose the
   * edit.
   */
  private isEditorDirty(editor: EditorHandle): boolean {
    if (!editor.isDirtyNow) {
      return editor.isDirty;
    }
    try {
      return editor.isDirtyNow();
    } catch {
      // A probe that throws must never be read as "safe to discard".
      return true;
    }
  }

  dirtyEditors(): EditorHandle[] {
    return [...this.handles.values()].filter((editor) => this.isEditorDirty(editor));
  }

  hasUnsavedWork(): boolean {
    return !this.bypassing && this.dirtyEditors().length > 0;
  }

  isBypassing(): boolean {
    return this.bypassing;
  }

  /**
   * The single funnel every navigation attempt goes through — link clicks,
   * the command palette, keyboard jumps, and Back/Forward alike.
   *
   * An editor that saves itself is flushed silently rather than prompted
   * for: interrupting an author with "you have unsaved changes" about an
   * editor that was about to save on its own 800ms from now would be a
   * dialog they can only answer one way. If that flush fails, the normal
   * dialog opens, because at that point the work really is at risk.
   */
  requestNavigation(intent: NavigationIntent): void {
    // A question is already on screen (or a silent flush is deciding). Every
    // further navigation attempt until it resolves is dropped rather than
    // replacing the pending one: holding Back with the dialog open used to
    // swap in a new intent whose `history.go(-2)` no longer described the
    // stack it was built for, sending the author somewhere they never asked
    // to go.
    if (this.pendingIntent || this.resolving) {
      return;
    }

    const dirty = this.dirtyEditors();

    if (dirty.length === 0) {
      this.runIntent(intent);
      return;
    }

    if (dirty.every((editor) => editor.savesAutomatically)) {
      const resolutionId = ++this.resolutionId;
      this.resolving = true;
      this.resolveError = null;
      this.emit();
      void Promise.all(dirty.map((editor) => this.safeSave(editor))).then((results) => {
        if (resolutionId !== this.resolutionId) {
          // The author cancelled while the flush was in flight.
          return;
        }
        this.resolving = false;
        if (results.every(Boolean)) {
          this.emit();
          this.runIntent(intent);
          return;
        }
        this.pendingIntent = intent;
        this.resolveError = this.firstEditorError(dirty) ?? 'Your changes could not be saved.';
        this.emit();
      });
      return;
    }

    this.pendingIntent = intent;
    this.resolveError = null;
    this.emit();
  }

  /**
   * "Stay Editing", Escape, and the dialog's close control all land here.
   *
   * Always available, including mid-save: there is no state in which refusing
   * to let an author return to their own page is the right answer, and a save
   * that never resolves (a hung request, a dropped connection) must not be
   * able to lock them inside a modal. Bumping `resolutionId` is what makes a
   * late-arriving save result harmless rather than a surprise navigation.
   */
  cancelNavigation(): void {
    if (!this.pendingIntent && !this.resolveError && !this.resolving) {
      return;
    }
    this.resolutionId += 1;
    this.pendingIntent = null;
    this.resolveError = null;
    this.resolving = false;
    this.emit();
  }

  /** "Discard Changes" — every dirty editor returns to its last saved snapshot, then the navigation proceeds. */
  discardAndProceed(): void {
    const intent = this.pendingIntent;
    for (const editor of this.dirtyEditors()) {
      editor.discard();
    }
    this.pendingIntent = null;
    this.resolveError = null;
    this.emit();
    if (intent) {
      this.runIntent(intent);
    }
  }

  /**
   * "Save & Leave" — saves, waits for real completion, and navigates only on
   * success. A failure leaves the dialog open with the reason, and the
   * editor untouched behind it (phase brief §7).
   */
  async saveAndProceed(): Promise<void> {
    const intent = this.pendingIntent;
    const dirty = this.dirtyEditors();
    const resolutionId = ++this.resolutionId;

    this.resolving = true;
    this.resolveError = null;
    this.emit();

    const results = await Promise.all(dirty.map((editor) => this.safeSave(editor)));

    if (resolutionId !== this.resolutionId) {
      // "Stay Editing" was pressed while this save was in flight. The save
      // itself still counted — the editor's own state reflects it — but the
      // navigation it was going to authorize no longer applies.
      return;
    }
    this.resolving = false;

    if (!results.every(Boolean)) {
      this.resolveError =
        this.firstEditorError(this.dirtyEditors()) ??
        'Your changes could not be saved. Check the highlighted fields.';
      this.emit();
      return;
    }

    this.pendingIntent = null;
    this.emit();
    if (intent) {
      this.runIntent(intent);
    }
  }

  /** Discards everything without navigating — the sticky bar's own Discard control. */
  discardAll(): void {
    for (const editor of this.dirtyEditors()) {
      editor.discard();
    }
  }

  /** Saves everything without navigating — the sticky bar's own Save control. */
  async saveAll(): Promise<void> {
    await Promise.all(this.dirtyEditors().map((editor) => this.safeSave(editor)));
  }

  private async safeSave(editor: EditorHandle): Promise<boolean> {
    try {
      return await editor.save();
    } catch {
      return false;
    }
  }

  private firstEditorError(editors: EditorHandle[]): string | null {
    return editors.find((editor) => editor.error)?.error ?? null;
  }

  /**
   * Performs an approved navigation with the guards suppressed, so a
   * `beforeunload` or `popstate` triggered *by* the navigation the user just
   * authorized doesn't prompt them a second time. The flag is released on the
   * next task rather than synchronously, because a client-side route change
   * is asynchronous.
   */
  private runIntent(intent: NavigationIntent): void {
    this.bypassing = true;
    try {
      intent.perform();
    } finally {
      setTimeout(() => {
        this.bypassing = false;
        this.emit();
      }, 0);
    }
  }

  private emit(): void {
    this.snapshot = {
      editors: [...this.handles.values()],
      pendingIntent: this.pendingIntent,
      resolving: this.resolving,
      resolveError: this.resolveError,
    };
    for (const listener of this.listeners) {
      listener();
    }
  }
}
