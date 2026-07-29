'use client';

import { X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Row {
  platform: string;
  url: string;
}

/**
 * A small, genuinely new dynamic-rows field — Team's "Social links"
 * requirement (Team completion sprint, Part 2) has no existing multi-row
 * form primitive to reuse (`RelationMultiSelect` is a fixed checkbox list,
 * not free-text rows). Submits as two same-named, parallel-indexed fields
 * (`${name}.platform`, `${name}.url`) — the same native multi-value
 * `FormData` convention `RelationMultiSelect` already uses, so the action
 * zips them back together with `formData.getAll()` rather than needing
 * client-side JSON serialization.
 */
export function SocialLinksField({
  name,
  initialValues = [],
}: {
  name: string;
  initialValues?: Row[];
}) {
  const [rows, setRows] = useState<Row[]>(initialValues);

  function addRow() {
    setRows((current) => [...current, { platform: '', url: '' }]);
  }
  function removeRow(index: number) {
    setRows((current) => current.filter((_, i) => i !== index));
  }
  function updateRow(index: number, key: keyof Row, value: string) {
    setRows((current) => current.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  }

  return (
    <div className="flex flex-col gap-2">
      {rows.map((row, index) => (
        <div key={index} className="flex gap-2">
          <Input
            name={`${name}.platform`}
            value={row.platform}
            onChange={(event) => updateRow(index, 'platform', event.target.value)}
            placeholder="Platform (e.g. GitHub)"
            className="max-w-[180px]"
          />
          <Input
            name={`${name}.url`}
            value={row.url}
            onChange={(event) => updateRow(index, 'url', event.target.value)}
            placeholder="https://…"
            type="url"
            className="flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            aria-label="Remove social link"
            onClick={() => removeRow(index)}
          >
            <X className="h-3.5 w-3.5" aria-hidden />
          </Button>
        </div>
      ))}
      <Button type="button" variant="secondary" onClick={addRow} className="self-start">
        Add social link
      </Button>
    </div>
  );
}
