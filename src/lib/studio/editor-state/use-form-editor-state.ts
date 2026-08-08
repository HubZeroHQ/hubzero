'use client';

import {
  startTransition,
  useActionState,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
} from 'react';
import { useRouter } from 'next/navigation';
import type { EntryActionState } from '@/lib/studio/entry-actions';
import { serializeForm, serializeFormEntries } from './form-snapshot';
import type { EditorSaveOptions, EditorSaveStatus } from './types';
import { useEditorRegistration } from './use-editor-registration';

const EMPTY_ACTION_STATE: EntryActionState = {};

/**
 * Throttle window for dirty-state recomputation. Measured, not guessed: the
 * serializer itself costs ~0.02ms even on the largest Studio form (Labs with
 * a 60-row progress timeline — 445 submitted entries), so this window is not
 * about CPU. It exists to bound how often the *DOM* half runs — `new
 * FormData(form)` walks every control in the form, several hundred of them on
 * the relation-heavy editors — during sustained typing.
 *
 * It never applies to the clean → dirty edge (see `scheduleRecompute`), and it
 * never gates a *decision*: the navigation guard probes `isDirtyNow()`
 * directly. Throttling what is rendered is a performance choice; throttling
 * what is decided would be a correctness bug, and was one.
 */
const RECOMPUTE_INTERVAL_MS = 120;

/**
 * Events after which the form's submitted values may differ. Native
 * `input`/`change` cover typing and toggling; `click`, `keyup`, `drop` and
 * `paste` are the coarse net that catches a custom field (a media picker, a
 * timeline row) committing a value through React state rather than through a
 * user edit of a form control.
 */
const RECHECK_EVENTS = [
  'input',
  'change',
  'click',
  'keyup',
  'drop',
  'paste',
  // The Media Picker and similar fields commit their value from inside a
  // portalled dialog, whose clicks never reach this form. Radix returns focus
  // to the trigger — which *is* inside the form — when the dialog closes, so
  // this is the event that reliably fires on the far side of that round trip.
  'focusin',
] as const;

export interface FormEditorState {
  formProps: {
    ref: React.RefObject<HTMLFormElement | null>;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  };
  /** The server action's last result — field errors, error message, success. */
  state: EntryActionState;
  status: EditorSaveStatus;
  isDirty: boolean;
  pending: boolean;
  lastSavedAt: Date | null;
  /** Bumped by `discard()`; use as a React `key` to remount the fields at their saved values. */
  resetKey: number;
  save: (options?: EditorSaveOptions) => Promise<boolean>;
  discard: () => void;
  canDiscard: boolean;
}

/**
 * Turns any Studio metadata form into a fully-featured editor: real dirty
 * detection, a save lifecycle, in-place discard, `Ctrl/Cmd+S`, and
 * registration with the shell's navigation guard — without the form giving
 * up the Server Action architecture it already uses.
 *
 * ## How dirty state is derived
 *
 * By snapshotting what the form *would submit* (`serializeForm`) and
 * comparing it against the last snapshot that was actually saved. Nothing
 * here enumerates fields, so a form gains correct dirty detection for a new
 * field type the day it's added, and "edit a value then put it back" clears
 * the dirty flag by construction rather than by a special case.
 *
 * Recomputation is driven by DOM events plus a `MutationObserver` over the
 * form, because the Studio's richer fields render *hidden inputs* from React
 * state — selecting a gallery image adds an `<input type="hidden">` and
 * fires no `input` event. The observer catches that; the event listeners
 * catch everything a user types. Both funnel into one recomputation that is
 * throttled only while the editor is already dirty, so the first keystroke is
 * never delayed.
 *
 * That published value drives rendering. It is deliberately *not* what the
 * navigation guard decides from — `isDirtyNow()` re-reads the DOM at the
 * instant a departure is attempted, which is the only way "type a character,
 * immediately click a link" can be caught every time.
 *
 * ## How discard works
 *
 * By remounting the field subtree under a changing `resetKey`, so every
 * uncontrolled input re-reads its `defaultValue` and every custom field
 * re-initializes from its `initial*` props. That is a local state reset, not
 * a page reload — the phase brief's §10 requirement — and it is why a
 * successful save also asks the router to refresh: the props the fields
 * remount from must be the freshly-saved server state, and `canDiscard`
 * stays false for as long as `useTransition` reports that refresh pending,
 * so discard can never restore a stale snapshot.
 *
 * ## Why the action is dispatched from `onSubmit`, not `<form action={…}>`
 *
 * React 19 automatically resets an uncontrolled form after an action passed
 * to the `action` prop resolves (`startHostTransition` → `requestFormReset`).
 * That was invisible while every update action ended in a `redirect`, but an
 * editor that stays on the page after saving would watch every field snap
 * back to its pre-save `defaultValue`. Calling the `useActionState`
 * dispatcher inside `startTransition` instead is the documented alternative
 * ("either call the returned function inside startTransition, or pass it to
 * an `action`/`formAction` prop") and does not reset the form. Native
 * constraint validation is unaffected: a browser only fires `submit` once
 * the form is valid, so `required`, `type="url"`, `minLength` and friends
 * still block a save exactly as before.
 */
export function useFormEditorState({
  action,
  label,
  id,
}: {
  action: (prevState: EntryActionState, formData: FormData) => Promise<EntryActionState>;
  /** Names this editor in the save bar and leave dialog. */
  label: string;
  /** Optional stable id; defaults to a generated one, which is enough for one editor per form. */
  id?: string;
}): FormEditorState {
  const generatedId = useId();
  const editorId = id ?? generatedId;

  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(action, EMPTY_ACTION_STATE);

  const [isDirty, setIsDirty] = useState(false);
  const [status, setStatus] = useState<EditorSaveStatus>('saved');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [resetKey, setResetKey] = useState(0);

  // React's own transition state, rather than a hand-rolled `refreshing`
  // flag. `router.refresh()` dispatched inside a transition keeps that
  // transition pending until the new RSC payload has arrived, so `isPending`
  // is the refresh lifecycle — a separate boolean set on the line after the
  // `refresh()` call only *looked* like it tracked the same thing, and
  // whether it actually did depended on React internals rather than on
  // anything this file states.
  const [isRefreshing, startRefresh] = useTransition();

  /** The last snapshot known to be persisted. `null` until the form has mounted. */
  const baselineRef = useRef<string | null>(null);
  /** What was in the form at the moment the in-flight submission left the browser. */
  const submittedSnapshotRef = useRef<string | null>(null);
  /**
   * The single in-flight save. Every caller of `save()` — the submit button,
   * `Ctrl/Cmd+S`, the sticky bar, "Save & Leave" — shares this one promise
   * rather than starting a second submission, which is what stops a
   * concurrent caller from replacing an earlier caller's resolver and leaving
   * that earlier promise pending forever.
   */
  const inFlightSaveRef = useRef<{
    promise: Promise<boolean>;
    resolve: (saved: boolean) => void;
    refresh: boolean;
  } | null>(null);
  /** Set by the submit handler, so `save()` can tell a submit that never happened from one that did. */
  const submitObservedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRecomputeRef = useRef(0);
  /** Mirrors `isDirty` for synchronous reads inside event-time code paths. */
  const isDirtyRef = useRef(false);

  /**
   * Settles the shared save promise exactly once and clears it. Every exit
   * path from a save — the action's result, a submit that never fired,
   * unmount — goes through here, so there is no path that leaves a promise
   * pending.
   */
  const settleSave = useCallback((saved: boolean) => {
    const inFlight = inFlightSaveRef.current;
    inFlightSaveRef.current = null;
    inFlight?.resolve(saved);
  }, []);

  const readSnapshot = useCallback((): string | null => {
    const form = formRef.current;
    return form ? serializeForm(form) : null;
  }, []);

  /**
   * The guard's live dirty probe: reads the DOM and compares it against the
   * last saved snapshot *at call time*, bypassing React state and the
   * recomputation throttle entirely.
   *
   * Safe to call on every navigation attempt — it costs one `FormData` walk
   * (~0.2ms on the largest Studio form, measured) and runs only when someone
   * tries to leave, not per keystroke. That is precisely the trade this
   * separation buys: the throttle keeps the *rendered* state cheap, and the
   * probe keeps the *decision* exact.
   *
   * Returns `false` before the baseline exists (the form hasn't mounted yet),
   * because at that point there is nothing the author could have changed.
   */
  const isDirtyNow = useCallback((): boolean => {
    if (baselineRef.current === null) {
      return false;
    }
    const snapshot = readSnapshot();
    return snapshot !== null && snapshot !== baselineRef.current;
  }, [readSnapshot]);

  const recompute = useCallback(() => {
    const snapshot = readSnapshot();
    if (snapshot === null || baselineRef.current === null) {
      return;
    }
    const next = snapshot !== baselineRef.current;
    isDirtyRef.current = next;
    setIsDirty(next);
    setStatus((previous) => {
      if (previous === 'saving') {
        return previous;
      }
      // A failed save stays visible as a failure until the next save
      // attempt — clearing it the moment the author edits a character would
      // hide the reason they need in order to fix it.
      if (previous === 'error') {
        return previous;
      }
      return next ? 'dirty' : 'saved';
    });
  }, [readSnapshot]);

  /**
   * Leading-edge throttle with a trailing run. The first event after a quiet
   * period recomputes immediately — so the save bar appears on the keystroke
   * that dirtied the form, not a beat later — and sustained typing then costs
   * one recomputation per window instead of one per animation frame, with a
   * final trailing pass that always observes the last keystroke.
   *
   * Leading-edge matters more than the throttle itself here: a plain trailing
   * debounce would delay the *first* "Unsaved changes" by the full interval,
   * which is the one transition an author actually watches for.
   */
  const scheduleRecompute = useCallback(() => {
    if (typeof window === 'undefined' || timerRef.current !== null) {
      return;
    }
    // The clean → dirty edge is never throttled. It is the transition that
    // arms the unload handler and raises the save bar, and delaying it is what
    // made "type, then immediately click away" a data-loss path. Throttling
    // only applies once the editor is *already* known to be dirty — which is
    // also where the cost actually lives, since that is the state sustained
    // typing spends all its time in.
    const elapsed = Date.now() - lastRecomputeRef.current;
    if (!isDirtyRef.current || elapsed >= RECOMPUTE_INTERVAL_MS) {
      lastRecomputeRef.current = Date.now();
      recompute();
      return;
    }
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      lastRecomputeRef.current = Date.now();
      recompute();
    }, RECOMPUTE_INTERVAL_MS - elapsed);
  }, [recompute]);

  // Baseline capture + change detection. Runs once per mount of the *form*;
  // `resetKey` is intentionally in the dependency list so a discard re-reads
  // the baseline from the freshly remounted fields.
  useEffect(() => {
    const form = formRef.current;
    if (!form) {
      return;
    }

    baselineRef.current = serializeForm(form);
    isDirtyRef.current = false;
    setIsDirty(false);

    const observer = new MutationObserver(scheduleRecompute);
    observer.observe(form, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['value', 'checked', 'disabled', 'name'],
    });

    for (const eventName of RECHECK_EVENTS) {
      form.addEventListener(eventName, scheduleRecompute, true);
    }

    return () => {
      observer.disconnect();
      for (const eventName of RECHECK_EVENTS) {
        form.removeEventListener(eventName, scheduleRecompute, true);
      }
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [resetKey, scheduleRecompute]);

  useEffect(() => {
    if (pending) {
      setStatus('saving');
    }
  }, [pending]);

  // The action's result: the only authority on whether the work is persisted.
  useEffect(() => {
    if (state === EMPTY_ACTION_STATE) {
      return;
    }

    if (state.ok) {
      // The baseline becomes what was actually sent, not what is in the form
      // now — those can differ if the author kept typing during the round
      // trip, and treating the later text as saved would lose it silently.
      baselineRef.current = submittedSnapshotRef.current ?? readSnapshot();
      setStatus('saved');
      setLastSavedAt(new Date());
      // Re-read the server state after an ordinary in-place save so a later
      // discard restores the saved version. Save & Leave supplies
      // `refresh: false`: its next route is the authoritative fresh read,
      // and starting a competing refresh here can strand its leave dialog.
      const refresh = inFlightSaveRef.current?.refresh ?? true;
      if (refresh) {
        startRefresh(() => {
          router.refresh();
        });
      }
      scheduleRecompute();
      settleSave(true);
      return;
    }

    setStatus('error');
    settleSave(false);
  }, [state, readSnapshot, router, scheduleRecompute, settleSave]);

  // A save promise must never outlive the form it belongs to — a create
  // action redirects on success, unmounting this hook mid-flight.
  useEffect(() => () => settleSave(false), [settleSave]);

  /**
   * Saves, and resolves `true` only once the change is persisted.
   *
   * Concurrent callers are coalesced onto the one in-flight save rather than
   * each starting a submission of their own. Without that, a second caller
   * would overwrite the first's resolver and strand the first promise
   * forever — and since "Save & Leave" awaits exactly such a promise, a
   * `Ctrl/Cmd+S` pressed while it was in flight could leave the leave-dialog
   * waiting on a result that would never arrive.
   */
  const save = useCallback(
    (options: EditorSaveOptions = {}): Promise<boolean> => {
      if (inFlightSaveRef.current) {
        return inFlightSaveRef.current.promise;
      }

      const form = formRef.current;
      if (!form) {
        return Promise.resolve(false);
      }
      // Native constraint validation first: `requestSubmit` would silently do
      // nothing on an invalid form, leaving the caller waiting forever for a
      // result that is never coming.
      if (!form.reportValidity()) {
        return Promise.resolve(false);
      }

      let resolve!: (saved: boolean) => void;
      const promise = new Promise<boolean>((resolveFn) => {
        resolve = resolveFn;
      });
      inFlightSaveRef.current = { promise, resolve, refresh: options.refresh !== false };

      // `requestSubmit` dispatches the submit event synchronously, so if the
      // handler hasn't run by the time it returns, no submission happened and
      // no action result is ever coming. Settling here rather than waiting is
      // the difference between a save that reports failure and one that hangs.
      submitObservedRef.current = false;
      form.requestSubmit();
      if (!submitObservedRef.current) {
        settleSave(false);
      }

      return promise;
    },
    [settleSave],
  );

  const discard = useCallback(() => {
    submittedSnapshotRef.current = null;
    baselineRef.current = null;
    setStatus('saved');
    isDirtyRef.current = false;
    setIsDirty(false);
    setResetKey((key) => key + 1);
  }, []);

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      submitObservedRef.current = true;
      const formData = new FormData(event.currentTarget);
      submittedSnapshotRef.current = serializeFormEntries(formData);
      setStatus('saving');
      startTransition(() => {
        formAction(formData);
      });
    },
    [formAction],
  );

  // `Ctrl/Cmd+S` (phase brief §8). Listening at the document rather than the
  // form means the shortcut works wherever focus is on the page, and
  // deferring to `defaultPrevented` means an editor that already handles the
  // chord for its own document — the Document Engine — keeps winning inside
  // its own surface instead of both editors saving at once.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented) {
        return;
      }
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 's') {
        return;
      }
      event.preventDefault();
      void save();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [save]);

  useEditorRegistration({
    id: editorId,
    label,
    isDirty,
    isDirtyNow,
    status,
    error: state.error,
    save,
    discard,
    savesAutomatically: false,
    showsSaveBar: true,
    canDiscard: !isRefreshing && !pending,
  });

  return {
    formProps: { ref: formRef, onSubmit: handleSubmit },
    state,
    status,
    isDirty,
    pending,
    lastSavedAt,
    resetKey,
    save,
    discard,
    canDiscard: !isRefreshing && !pending,
  };
}
