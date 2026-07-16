'use client';

import { useRouter } from 'next/navigation';
import { buildListHref, type ListSearchParams } from '@/lib/studio/list-query';
import { Combobox, type ComboboxOption } from './Combobox';

interface ComboboxFilterProps {
  basePath: string;
  params: ListSearchParams;
  paramKey: string;
  options: ComboboxOption[];
  multiple?: boolean;
  placeholder: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  ariaLabel: string;
}

/**
 * Wires the generic `Combobox` to a Studio list page's existing URL-driven
 * filtering convention (`lib/studio/list-query.ts`'s `buildListHref` —
 * every `FilterChip` across every collection already navigates this way).
 * A multi-select facet encodes its selection as one comma-joined value in
 * a single query param rather than repeated keys, so this needs no change
 * to `buildListHref`, `ListSearchParams`, or any single-select `FilterChip`
 * sharing the same page (e.g. Blueprints' status filter). A new
 * collection's Combobox-backed filter is a `paramKey` + an `options` list
 * passed to this component, not a new wiring implementation.
 */
export function ComboboxFilter({
  basePath,
  params,
  paramKey,
  options,
  multiple = false,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  ariaLabel,
}: ComboboxFilterProps) {
  const router = useRouter();
  const rawValue = params[paramKey];
  const selectedIds = rawValue ? rawValue.split(',').filter(Boolean) : [];

  function handleChange(next: string[]) {
    const nextValue = next.length > 0 ? next.join(',') : undefined;
    router.push(buildListHref(basePath, params, { [paramKey]: nextValue, page: undefined }));
  }

  return (
    <Combobox
      options={options}
      selectedIds={selectedIds}
      onChange={handleChange}
      multiple={multiple}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      emptyMessage={emptyMessage}
      ariaLabel={ariaLabel}
    />
  );
}
