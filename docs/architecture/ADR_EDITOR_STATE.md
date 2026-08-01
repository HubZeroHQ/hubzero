# ADR — Editor State Management, and the native-form-control invariant

**Status:** Accepted (HubZero v3.1 Phase 1). Supersedes nothing; establishes the editing contract every Studio editor now inherits.

**Read this before:** adding a field to a Studio editor, adding a new Studio editor, or changing how any editable Studio surface persists its values.

---

## The decision

Every editable Studio surface gets its unsaved-work behavior — dirty detection, save-state display, the sticky save bar, navigation protection, browser-unload protection, `Ctrl/Cmd+S`, and in-place discard — from one shared layer (`src/lib/studio/editor-state/`), not from per-collection code. An editor opts in by describing itself as an `EditorHandle` and registering; a metadata form gets all of it by being written inside `EditorForm`.

Dirty state is **derived from the form**, not tracked per field. `serializeForm` builds a canonical string from `new FormData(form)` — what the form *would submit* right now — and compares it against the last snapshot that was actually saved.

---

## The invariant this depends on

> **Every editable Studio field must ultimately submit through native form controls inside its editor's `<form>`.**

That means a real `<input>`, `<select>`, `<textarea>`, or `<input type="hidden">` carrying a `name`, rendered inside the form element. It is not a style preference. It is the load-bearing assumption of the entire editor-state layer.

The Studio already worked this way before this layer existed, and deliberately so — `RelationMultiSelect` is native checkboxes sharing one `name`; `MediaPickerField` and `MediaGalleryField` render hidden inputs; `SocialLinksField` uses parallel indexed fields; `ProgressTimelineField` renders real rows. Every one of those was written to submit through `formData.getAll()` rather than through client-side JSON, and none of them needed changing to gain dirty detection. This ADR promotes that existing convention from "how the forms happen to be written" to "the contract new fields must meet."

### What breaks if a field bypasses it

A field that keeps its value only in React state — or in a store, or a `contentEditable` surface — and posts it through a bespoke path is **invisible to `FormData`**. The consequences are silent and total for that field:

- **No dirty detection.** Editing it never marks the editor dirty.
- **No save state.** The indicator keeps reading "Saved" while the value is unsaved.
- **No sticky save bar.** It never appears.
- **No navigation protection.** Sidebar clicks, Back, and refresh all discard the edit without asking — which is precisely the class of data loss this system exists to prevent.
- **No future editor infrastructure.** Anything built on `EditorHandle` later (autosave, conflict resolution, version history) inherits the same blind spot.

There is no error, no warning, and no failing test. The form simply behaves as though the field were never edited. **This is the single most important failure mode to know about in this subsystem**, because its symptom is indistinguishable from "the guard is working and there was nothing to save."

### Why the invariant is a convention rather than an enforced rule

We considered enforcing it and rejected each option:

| Option | Why not |
| --- | --- |
| Dev-mode assertion that each declared field has a matching named control | The layer deliberately doesn't know what fields an editor *has* — that knowledge is exactly the per-collection duplication it removed. Reintroducing a field manifest to check against would cost more than it protects. |
| Lint rule banning `useState` in field components | Far too broad — every existing custom field legitimately holds React state; the requirement is that it *also* renders a named control, which a lint rule can't verify. |
| Per-field registration API | Restores the per-field wiring the derived-snapshot approach removed, for every field in the Studio, to catch a mistake made rarely. |

The trade made is explicit: **terser field code and automatic coverage of new field types, in exchange for a convention that fails silently when broken.** This document is the mitigation. If that trade stops paying — if a field is added that violates it and ships — reconsider the per-field registration option rather than patching around the specific field.

### The check to run when adding a field

Open the editor, change the field, and confirm the sticky save bar appears. If it doesn't, the field isn't submitting natively. That is a one-second test and it catches the entire failure class.

---

## Consequences already accepted

- **Metadata update actions return `{ ok: true }` instead of redirecting.** "✓ Saved" is only observable if the page that saved is still on screen. Create actions still redirect — there is no document to stay on. See `createEntryUpdateAction`.
- **`EditorForm` dispatches its action from `onSubmit` inside `startTransition`, not `<form action={fn}>`.** React 19 calls `requestFormReset` on every action passed to the `action` prop (`startHostTransition` → `requestFormReset`), which would snap every uncontrolled field back to its pre-save `defaultValue` on a form that stays put. Native constraint validation is unaffected. The cost is that Studio metadata forms no longer submit with JavaScript disabled — theoretical for an authenticated CMS whose media picker, relation pickers, and block editor were already JS-only.
- **Programmatic navigation must go through `useGuardedRouter`.** Anchor clicks are intercepted at the DOM level and need no cooperation; `router.push` from an event handler has no event to intercept. A new call site that uses `useRouter` directly is a hole in the guard.
- **The guard protects navigation, not intra-page unmount.** Unmounting an editor unregisters it. `DocumentRoleTabs` unmounting an inactive `BlockEditor` with a pending autosave is a pre-existing loss path this layer does not close.

---

## Deliberately not built

Autosave, collaborative editing, offline editing, conflict resolution, version history, live presence, multi-editor scoping. The layer is shaped not to preclude them — `save()` returns `Promise<boolean>` so a future conflict check can refuse; editors carry stable `id`/`label`; `savesAutomatically` distinguishes autosaving from manual editors without the shell naming the Document Engine.

Two of those are further away than that shape suggests, and should be planned as real work rather than configuration:

- **Autosave on a metadata form** would need a save path that does not go through `requestSubmit()`, because native constraint validation would pop a browser bubble on every tick over a half-typed URL field.
- **Version history / conflict resolution** needs a structured baseline and a server version token. The baseline here is an opaque string, `EntryActionState` carries no version, and `save()` returns a boolean rather than the saved record — all additive to change, but all changes to the contract.
