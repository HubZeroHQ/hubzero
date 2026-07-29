import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';

/**
 * The shared labeled-field shell — label, optional hint, optional error,
 * correctly wired `aria-describedby`/`aria-invalid` on the control inside.
 * Originally local to `WorkForm`; extracted so every collection's metadata
 * form and the Document Engine's block field editors (`components/documents/
 * editor/fields/`) share one implementation instead of each hand-rolling
 * the same label/hint/error wiring.
 */
export function Field({
  label,
  name,
  error,
  hint,
  children,
  asFieldset,
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  /** For a group of checkboxes (relation pickers) rather than one input — `<label htmlFor>` can't correctly target a group of controls, so this renders a `<fieldset>/<legend>` instead. */
  asFieldset?: boolean;
}) {
  // Associates the hint/error text with the field the way a sighted user
  // already reads it visually — without `aria-describedby`, a screen-reader
  // user who tabs into the input hears only the label, not "Must be a
  // lowercase, hyphen-separated slug," and would have to go hunting for it.
  const hintId = hint ? `${name}-hint` : undefined;
  const errorId = error ? `${name}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  const hintAndError = (
    <>
      {hint ? (
        <p id={hintId} className="text-text-muted text-xs">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-danger text-xs">
          {error}
        </p>
      ) : null}
    </>
  );

  if (asFieldset) {
    return (
      <fieldset aria-describedby={describedBy} className="flex flex-col gap-1.5">
        <legend className="text-text-secondary text-sm">{label}</legend>
        {children}
        {hintAndError}
      </fieldset>
    );
  }

  const input = isValidElement(children)
    ? cloneElement(children as ReactElement<Record<string, unknown>>, {
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined,
      })
    : children;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-text-secondary text-sm">
        {label}
      </label>
      {input}
      {hintAndError}
    </div>
  );
}
