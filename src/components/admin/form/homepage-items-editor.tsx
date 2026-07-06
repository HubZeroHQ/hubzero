"use client";

import { ChevronDown, ChevronUp, Star, Trash2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { IconButton } from "@/components/ui/icon-button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { FieldMessage } from "@/components/ui/_field-shell";
import { ReferencePickerModal } from "@/components/admin/form/reference-picker-modal";
import { resolveReferenceOptionsAction } from "@/actions/studio/references";
import {
  HOMEPAGE_RESOURCES,
  HOMEPAGE_RESOURCE_LABELS,
  HOMEPAGE_RESOURCE_LABEL_FIELDS,
  type HomepageResource,
} from "@/lib/cms/homepage-resources";
import type { FieldOption } from "@/types/cms";

export interface HomepageItem {
  resource: HomepageResource;
  id: string;
  visible: boolean;
  isHero: boolean;
}

export interface HomepageItemsEditorProps {
  name: string;
  label?: string;
  hint?: string;
  error?: string;
  value: HomepageItem[];
  onChange: (value: HomepageItem[]) => void;
}

const resourceOptions = HOMEPAGE_RESOURCES.map((resource) => ({
  value: resource,
  label: HOMEPAGE_RESOURCE_LABELS[resource],
}));

/**
 * The homepage content configuration's control
 * (`ARCHITECTURE/20_CONTENT_BLOCKS.md` §6, replacing the old single
 * `featuredCaseStudyIds` field): an ordered, cross-collection list of
 * `{resource, id, visible, isHero}` — one item may reference any of the five
 * homepage-featurable collections (`lib/cms/homepage-resources.ts`), array
 * order is the display order, and exactly the item marked `isHero` (if any)
 * becomes the homepage's large hero treatment
 * (`lib/cms/public-content.ts`'s `getHomepageContent`).
 *
 * Submits as one hidden `<input>` carrying a JSON string — the same wire
 * contract `<BlockEditor>` established for `"blocks"`, reused here via
 * `lib/cms/json-field.ts`'s `jsonArray()` on the server side.
 */
export function HomepageItemsEditor({
  name,
  label,
  hint,
  error,
  value,
  onChange,
}: HomepageItemsEditorProps) {
  function update(index: number, patch: Partial<HomepageItem>) {
    const items = [...value];
    const current = items[index];
    if (!current) return;
    items[index] = { ...current, ...patch };
    onChange(items);
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;
    const items = [...value];
    const temp = items[index]!;
    items[index] = items[target]!;
    items[target] = temp;
    onChange(items);
  }

  function setHero(index: number) {
    onChange(value.map((item, i) => ({ ...item, isHero: i === index })));
  }

  function addItem() {
    onChange([...value, { resource: "caseStudy", id: "", visible: true, isHero: false }]);
  }

  return (
    <div>
      {label && <Label>{label}</Label>}
      <input type="hidden" name={name} value={JSON.stringify(value)} />
      <div className="flex flex-col gap-3">
        {value.map((item, index) => (
          <HomepageItemRow
            key={index}
            item={item}
            isFirst={index === 0}
            isLast={index === value.length - 1}
            onChange={(patch) => update(index, patch)}
            onRemove={() => remove(index)}
            onMoveUp={() => move(index, -1)}
            onMoveDown={() => move(index, 1)}
            onSetHero={() => setHero(index)}
          />
        ))}
      </div>
      <Button type="button" variant="secondary" size="sm" className="mt-3" onClick={addItem}>
        Add featured item
      </Button>
      <FieldMessage hint={hint} error={error} />
    </div>
  );
}

function HomepageItemRow({
  item,
  isFirst,
  isLast,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  onSetHero,
}: {
  item: HomepageItem;
  isFirst: boolean;
  isLast: boolean;
  onChange: (patch: Partial<HomepageItem>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onSetHero: () => void;
}) {
  const [option, setOption] = useState<FieldOption | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!item.id || option?.value === item.id) return;
    startTransition(async () => {
      const [resolved] = await resolveReferenceOptionsAction(
        item.resource,
        HOMEPAGE_RESOURCE_LABEL_FIELDS[item.resource],
        [item.id],
      );
      setOption(resolved ?? null);
    });
    // Only re-resolve when the referenced document itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.resource, item.id]);

  // `item.id` (not `option`) is the source of truth for whether anything is
  // selected — the same reasoning `<ReferencePicker>` documents for its own
  // `selected` — so clearing `item.id` (e.g. switching `resource`) hides the
  // stale label immediately instead of waiting on this effect.
  const selected = item.id ? option : null;

  return (
    <div className="border-border-muted flex flex-col gap-3 rounded-lg border p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={item.resource}
          onValueChange={(value) => onChange({ resource: value as HomepageResource, id: "" })}
          options={resourceOptions}
          className="w-40"
        />
        {item.id && (
          <span className="text-body text-text bg-bg border-border-muted rounded-md border px-3 py-2">
            {isPending && !selected ? "Loading…" : (selected?.label ?? item.id)}
          </span>
        )}
        <ReferencePickerModal
          resource={item.resource}
          labelField={HOMEPAGE_RESOURCE_LABEL_FIELDS[item.resource]}
          trigger={
            <Button type="button" variant="secondary" size="sm">
              {item.id ? "Change" : "Choose…"}
            </Button>
          }
          onSelect={(picked) => onChange({ id: picked.value })}
        />
        <IconButton
          aria-label="Remove featured item"
          icon={<Trash2 className="size-4" />}
          size="sm"
          className="ml-auto"
          onClick={onRemove}
        />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Checkbox
          label="Visible"
          checked={item.visible}
          onCheckedChange={(checked) => onChange({ visible: checked === true })}
        />
        <button
          type="button"
          onClick={onSetHero}
          className={
            item.isHero
              ? "text-accent text-caption inline-flex items-center gap-1.5 font-medium"
              : "text-text-muted text-caption hover:text-text inline-flex items-center gap-1.5"
          }
        >
          <Star
            className="size-4"
            fill={item.isHero ? "currentColor" : "none"}
            aria-hidden="true"
          />
          {item.isHero ? "Hero" : "Make hero"}
        </button>
        <div className="ml-auto flex gap-1">
          <IconButton
            aria-label="Move up"
            icon={<ChevronUp className="size-4" />}
            size="sm"
            disabled={isFirst}
            onClick={onMoveUp}
          />
          <IconButton
            aria-label="Move down"
            icon={<ChevronDown className="size-4" />}
            size="sm"
            disabled={isLast}
            onClick={onMoveDown}
          />
        </div>
      </div>
    </div>
  );
}
