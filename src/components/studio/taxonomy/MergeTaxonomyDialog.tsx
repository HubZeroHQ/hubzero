'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Field } from '@/components/ui/Field';
import type { EntryActionState } from '@/lib/studio/entry-actions';
import type { TaxonomyKind } from '@/types/studio';

interface Option {
  id: string;
  label: string;
  kind: TaxonomyKind;
}

const emptyActionState: EntryActionState = {};

/** Kind-grouped so a same-kind mistake is visually unlikely before it's even a server-side rejection. */
function KindGroupedSelect({ name, options, id }: { name: string; options: Option[]; id: string }) {
  const byKind = new Map<TaxonomyKind, Option[]>();
  for (const option of options) {
    byKind.set(option.kind, [...(byKind.get(option.kind) ?? []), option]);
  }

  return (
    <select
      id={id}
      name={name}
      required
      defaultValue=""
      className="bg-surface-default text-text-primary focus-visible:border-accent duration-fast ease-standard rounded-[4px] border border-[#2a2a2a] px-3 py-2 text-sm transition-colors focus-visible:outline-none"
    >
      <option value="" disabled>
        Choose an entry…
      </option>
      {Array.from(byKind.entries()).map(([kind, entries]) => (
        <optgroup key={kind} label={kind}>
          {entries.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {entry.label}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

export function MergeTaxonomyDialog({
  options,
  action,
}: {
  options: Option[];
  action: (prevState: EntryActionState, formData: FormData) => Promise<EntryActionState>;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(action, emptyActionState);
  const submittedRef = useRef(false);

  useEffect(() => {
    if (pending) {
      submittedRef.current = true;
    } else if (submittedRef.current && !state.error) {
      submittedRef.current = false;
      setOpen(false);
    }
  }, [pending, state]);

  return (
    <>
      <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
        Merge entries
      </Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Merge Taxonomy entries"
        description="Every reference to the source entry is reassigned to the target, then the source entry is removed. Only entries of the same kind can be merged."
      >
        <form action={formAction} className="flex flex-col gap-4">
          {state.error ? (
            <p role="alert" className="text-danger text-sm">
              {state.error}
            </p>
          ) : null}
          <Field label="Merge from (removed)" name="sourceId">
            <KindGroupedSelect id="sourceId" name="sourceId" options={options} />
          </Field>
          <Field label="Merge into (kept)" name="targetId">
            <KindGroupedSelect id="targetId" name="targetId" options={options} />
          </Field>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Merging…' : 'Merge'}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
