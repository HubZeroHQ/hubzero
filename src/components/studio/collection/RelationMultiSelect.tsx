/**
 * CMS_PRODUCT_DESIGN.md §4/§30 — "relationships are pickers, not IDs": a
 * searchable select showing real titles, never a raw ObjectId to paste in.
 * This ships the honest v1 of that principle — a plain checkbox list of
 * real titles + reference IDs, no search-as-you-type yet (today's content
 * volume doesn't need it) — reused for Work's technology/category tags and
 * related Build/Blueprint links alike, so a future collection's relation
 * field is a new `options` list, not a new picker component.
 *
 * No client JS required: checkboxes sharing one `name` submit as a native
 * multi-value field (`formData.getAll(name)`), consistent with the rest of
 * the Studio's native-`FormData` form pattern (no react-hook-form dependency).
 */
export function RelationMultiSelect({
  name,
  options,
  selectedIds,
  emptyMessage,
}: {
  name: string;
  options: Array<{ id: string; label: string; referenceId?: string }>;
  selectedIds: string[];
  emptyMessage: string;
}) {
  if (options.length === 0) {
    return <p className="text-text-muted text-sm">{emptyMessage}</p>;
  }

  return (
    <div className="border-border-default flex max-h-48 flex-col gap-0.5 overflow-y-auto rounded-[4px] border p-2">
      {options.map((option) => (
        <label
          key={option.id}
          className="hover:bg-surface-elevated duration-fast ease-standard rounded-control flex items-center gap-2 px-2 py-1.5 text-sm transition-colors"
        >
          <input
            type="checkbox"
            name={name}
            value={option.id}
            defaultChecked={selectedIds.includes(option.id)}
            className="accent-accent"
          />
          <span className="text-text-primary flex-1 truncate">{option.label}</span>
          {option.referenceId ? (
            <span className="text-text-muted font-mono text-[11px] tracking-[0.05em] uppercase">
              {option.referenceId}
            </span>
          ) : null}
        </label>
      ))}
    </div>
  );
}
