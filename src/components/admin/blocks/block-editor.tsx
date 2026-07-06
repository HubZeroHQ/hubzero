"use client";

import { BlockList } from "@/components/admin/blocks/block-list";
import { FieldMessage } from "@/components/ui/_field-shell";
import { Label } from "@/components/ui/label";
import type { Block } from "@/lib/cms/blocks/types";

export interface BlockEditorProps {
  name: string;
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  value: Block[];
  onChange: (value: Block[]) => void;
}

/**
 * The `"blocks"` field type's control (`ARCHITECTURE/20_CONTENT_BLOCKS.md`) —
 * the generic, reusable block editor every narrative collection's `content`
 * field renders through `CmsField`. Nothing here names a collection: the
 * same component backs Case Study/Build/Labs Project/Blueprint/Note's
 * editors, and would back any future collection's `"blocks"` field with zero
 * new code, exactly the genericity bar `19_CMS_FOUNDATION.md` set for every
 * other field type.
 *
 * Submits the whole tree as one hidden `<input>` carrying a JSON string —
 * `crud-actions.ts`'s `rawFromFormData` needs no new case for this (it
 * already falls through to reading a single string field), and
 * `lib/cms/blocks/schema.ts`'s `blocksField()` parses it back on the server,
 * the same wire contract `"json"` already established for `TeamMember`.
 */
export function BlockEditor({
  name,
  label,
  hint,
  error,
  required,
  value,
  onChange,
}: BlockEditorProps) {
  return (
    <div>
      {label && <Label required={required}>{label}</Label>}
      <input type="hidden" name={name} value={JSON.stringify(value)} />
      <div className="mt-2">
        <BlockList
          blocks={value}
          onChange={onChange}
          emptyLabel="No content yet — add the first block below."
        />
      </div>
      <FieldMessage hint={hint} error={error} />
    </div>
  );
}
