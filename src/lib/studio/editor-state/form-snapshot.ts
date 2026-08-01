/**
 * Value-level dirty detection for the Studio's native-`FormData` forms
 * (phase brief §2: "changing a value then changing it back clears the dirty
 * state — do not rely on 'field touched'").
 *
 * The Studio has one form convention and every editor follows it: plain
 * uncontrolled inputs with `defaultValue`/`defaultChecked`, and richer
 * fields (`RelationMultiSelect`'s checkboxes, `MediaPickerField` /
 * `MediaGalleryField`'s hidden inputs, `SocialLinksField`'s indexed rows,
 * `ProgressTimelineField`) that all submit as real form controls rather
 * than through client-side state a form library owns. That convention is
 * exactly why dirty state can be derived from the form itself instead of
 * from per-field wiring — one serializer covers every existing field type
 * and every field type added later, with no per-editor code.
 *
 * Serializing `FormData` (rather than reading `.value` off each element)
 * also gives the *right* definition of dirty for free: an unchecked
 * checkbox is absent from `FormData`, a disabled field is absent, and a
 * multi-value field is a list — so "dirty" means precisely "what would be
 * submitted now differs from what was submitted (or loaded) last", which is
 * the only definition that can't disagree with what the server ends up
 * storing.
 */

/** Keys the guard must ignore — React injects its own fields into Server Action submissions. */
const IGNORED_KEY_PREFIX = '$ACTION_';

/**
 * Files can't be compared by value without reading them, and re-selecting
 * the identical file should not read as a change; identity + size + mtime is
 * the strongest comparison available synchronously.
 */
function serializeValue(value: FormDataEntryValue): string {
  if (typeof value === 'string') {
    return value;
  }
  return `file:${value.name}:${value.size}:${value.lastModified}`;
}

/**
 * Canonical, comparable text for a set of form entries.
 *
 * Keys are sorted so that DOM order changes which don't change the
 * submitted data (a field re-rendering into a different position) never read
 * as an edit. Values *within* one key keep their document order, because for
 * an ordered multi-value field — a Media gallery, a progress timeline's
 * rows — reordering genuinely is an edit.
 */
export function serializeFormEntries(entries: Iterable<[string, FormDataEntryValue]>): string {
  const grouped = new Map<string, string[]>();

  for (const [key, value] of entries) {
    if (key.startsWith(IGNORED_KEY_PREFIX)) {
      continue;
    }
    const existing = grouped.get(key);
    if (existing) {
      existing.push(serializeValue(value));
    } else {
      grouped.set(key, [serializeValue(value)]);
    }
  }

  const sortedKeys = [...grouped.keys()].sort();
  return JSON.stringify(sortedKeys.map((key) => [key, grouped.get(key)]));
}

/** The browser-side entry point: the snapshot of what this form would submit right now. */
export function serializeForm(form: HTMLFormElement): string {
  return serializeFormEntries(new FormData(form));
}
