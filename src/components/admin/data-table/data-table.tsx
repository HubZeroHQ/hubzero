"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useCmsTable } from "@/hooks/use-cms-table";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { cn } from "@/lib/utils";
import type { BulkActionResult, FilterConfig, TableColumn } from "@/types/cms";

/**
 * A search/text-filter input that commits to the URL (via `onCommit`) 300ms
 * after typing stops, instead of only on blur — one instance per text
 * control (the search box, each `type: "text"` filter), each managing its
 * own in-progress keystrokes independently. Syncs back from `value` so
 * "Clear filters" or browser back/forward still visibly resets the input.
 */
function DebouncedTextInput({
  label,
  value,
  onCommit,
  className,
}: {
  label: string;
  value: string | undefined;
  onCommit: (value: string | undefined) => void;
  className?: string;
}) {
  const [draft, setDraft] = useState(value ?? "");
  // Tracks the last external `value` seen so an external change (e.g. "Clear
  // filters", browser back/forward) can reset `draft` during render — the
  // React-docs-recommended alternative to syncing props into state inside an
  // effect, which would cascade an extra render for no benefit here.
  const [syncedValue, setSyncedValue] = useState(value);
  if (value !== syncedValue) {
    setSyncedValue(value);
    setDraft(value ?? "");
  }
  const debounced = useDebouncedValue(draft, 300);

  useEffect(() => {
    if (debounced !== (value ?? "")) onCommit(debounced || undefined);
    // Only reacts to the debounced draft settling, not to every keystroke or
    // to `value`/`onCommit` (`value`'s own sync is the effect above).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <Input
      label={label}
      placeholder={label === "Search" ? "Search…" : undefined}
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      className={className}
    />
  );
}

export interface DataTableProps<T extends { _id: string }> {
  columns: TableColumn<T>[];
  filters?: FilterConfig<T>[];
  searchable?: boolean;
  items: T[];
  hasNext: boolean;
  hasPrev: boolean;
  nextCursor?: string;
  emptyStateMessage: string;
  isFiltered: boolean;
  rowHref?: (doc: T) => string;
  bulkDelete?: (ids: string[]) => Promise<BulkActionResult>;
  bulkPublish?: (ids: string[]) => Promise<BulkActionResult>;
}

/**
 * One table component for every collection's list screen
 * (`ARCHITECTURE/19_CMS_FOUNDATION.md` §7), parameterized entirely by
 * `columns`/`filters`. Sort, filter, search, and pagination cursor all live
 * in the URL via `useCmsTable` — a bookmarked list-view URL reproduces the
 * exact same view.
 */
export function DataTable<T extends { _id: string }>({
  columns,
  filters = [],
  searchable = true,
  items,
  hasNext,
  hasPrev,
  nextCursor,
  emptyStateMessage,
  isFiltered,
  rowHref,
  bulkDelete,
  bulkPublish,
}: DataTableProps<T>) {
  const router = useRouter();
  const { state, setParams, toggleSort, goToPreviousPage, isPending } = useCmsTable();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkPending, setBulkPending] = useState(false);
  // Every other action in this system (`WorkflowActions`, `ConfirmDialog`
  // consumers) surfaces a failure rather than silently swallowing it — bulk
  // actions were the one place that didn't: `bulkRemove`/`bulkPublish`
  // (`crud-actions.ts`) already return a real `{succeeded, failed}` count
  // (some rows can legitimately fail a permission check or a `publishGuard`
  // without the whole batch failing), but nothing read it.
  const [bulkError, setBulkError] = useState<string | null>(null);

  const allSelected = items.length > 0 && items.every((item) => selected.has(item._id));
  const hasActiveFilters = Boolean(state.q) || Object.keys(state.filters ?? {}).length > 0;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(items.map((item) => item._id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function runBulk(action: (ids: string[]) => Promise<BulkActionResult>) {
    setBulkPending(true);
    setBulkError(null);
    try {
      const result = await action([...selected]);
      setSelected(new Set());
      if (result.failed > 0) {
        setBulkError(
          `${result.succeeded} succeeded, ${result.failed} failed — a failed item may be blocked by a permission or publish guard.`,
        );
      }
      router.refresh();
    } finally {
      setBulkPending(false);
    }
  }

  function clearFilters() {
    setParams({
      sort: undefined,
      dir: undefined,
      q: undefined,
      ...Object.fromEntries(filters.map((filter) => [filter.name, undefined])),
    });
  }

  return (
    <div className="space-y-4">
      {(filters.length > 0 || searchable) && (
        <div className="flex flex-wrap items-end gap-3">
          {searchable && (
            <DebouncedTextInput
              label="Search"
              value={state.q}
              onCommit={(value) => setParams({ q: value })}
              className="max-w-xs"
            />
          )}
          {filters.map((filter) =>
            filter.type === "select" ? (
              <Select
                key={filter.name}
                label={filter.label}
                placeholder="All"
                options={filter.options}
                // Always pass a defined `value` (`""` renders the
                // placeholder) rather than switching between a string and
                // `undefined` across renders — Radix `Select.Root` treats
                // that transition as controlled→uncontrolled and stops
                // reflecting prop updates, which is exactly the "still
                // showing the old filter after Clear filters" bug this
                // fixes.
                value={state.filters?.[filter.name] ?? ""}
                onValueChange={(value) => setParams({ [filter.name]: value })}
                className="min-w-[10rem]"
              />
            ) : filter.type === "text" ? (
              <DebouncedTextInput
                key={filter.name}
                label={filter.label}
                value={state.filters?.[filter.name]}
                onCommit={(value) => setParams({ [filter.name]: value })}
              />
            ) : null,
          )}
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} type="button">
              Clear filters
            </Button>
          )}
        </div>
      )}

      {bulkError && <Alert variant="danger">{bulkError}</Alert>}

      {selected.size > 0 && (bulkDelete || bulkPublish) && (
        <div className="bg-bg-light border-border-muted flex items-center gap-3 rounded-md border p-3">
          <span className="text-body text-text">{selected.size} selected</span>
          {bulkPublish && (
            <Button
              size="sm"
              variant="secondary"
              isLoading={bulkPending}
              onClick={() => runBulk(bulkPublish)}
            >
              Publish
            </Button>
          )}
          {bulkDelete && (
            <ConfirmDialog
              trigger={
                <Button size="sm" variant="secondary" className="text-danger">
                  Delete
                </Button>
              }
              title={`Delete ${selected.size} item${selected.size === 1 ? "" : "s"}?`}
              description="This can't be undone."
              destructive
              confirmLabel="Delete"
              onConfirm={() => runBulk(bulkDelete)}
            />
          )}
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState
          title={isFiltered ? "No matches" : "Nothing here yet"}
          description={isFiltered ? "No items match this filter." : emptyStateMessage}
        />
      ) : (
        <>
          <div className="border-border-muted hidden overflow-x-auto rounded-lg border md:block">
            <table className="w-full text-left">
              <thead className="bg-bg-light">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={toggleAll}
                      aria-label="Select all rows"
                    />
                  </th>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className="text-caption text-text-muted px-4 py-3 font-medium"
                    >
                      {column.sortable ? (
                        <button
                          type="button"
                          onClick={() => toggleSort(column.key)}
                          className="hover:text-text flex items-center gap-1"
                        >
                          {column.label}
                          {state.sort === column.key && (
                            <span aria-hidden="true">{state.dir === "asc" ? "▲" : "▼"}</span>
                          )}
                        </button>
                      ) : (
                        column.label
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={cn("transition-opacity", isPending && "opacity-50")}>
                {items.map((item) => (
                  <tr key={item._id} className="border-border-muted border-t">
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selected.has(item._id)}
                        onCheckedChange={() => toggleOne(item._id)}
                        aria-label="Select row"
                      />
                    </td>
                    {columns.map((column, columnIndex) => {
                      const content = column.render
                        ? column.render(item)
                        : String(item[column.key] ?? "—");
                      return (
                        <td key={column.key} className="text-body text-text px-4 py-3">
                          {rowHref && columnIndex === 0 ? (
                            <Link href={rowHref(item)} className="hover:text-accent">
                              {content}
                            </Link>
                          ) : (
                            content
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={cn("space-y-3 transition-opacity md:hidden", isPending && "opacity-50")}>
            {items.map((item) => (
              <div key={item._id} className="border-border-muted rounded-lg border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <Checkbox
                    checked={selected.has(item._id)}
                    onCheckedChange={() => toggleOne(item._id)}
                    aria-label="Select"
                  />
                  {rowHref && (
                    <Link href={rowHref(item)} className="text-accent text-caption">
                      Open
                    </Link>
                  )}
                </div>
                <dl className="space-y-1.5">
                  {columns.map((column) => (
                    <div key={column.key} className="flex justify-between gap-4">
                      <dt className="text-caption text-text-muted">{column.label}</dt>
                      <dd className="text-body text-text text-right">
                        {column.render ? column.render(item) : String(item[column.key] ?? "—")}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </>
      )}

      {(hasNext || hasPrev) && (
        <div className="flex justify-between pt-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={!hasPrev}
            onClick={goToPreviousPage}
            type="button"
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={!hasNext}
            onClick={() => setParams({ cursor: nextCursor }, { resetCursor: false })}
            type="button"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
