import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

/**
 * CMS_PRODUCT_DESIGN.md §4 — "dense table, not cards" is the shared list
 * shell for every Content/Studio/Leads collection. One generic table
 * component, parameterized by `columns`, is what makes Builds/Blueprints/
 * Labs/Notes' future list pages a column-config difference rather than a
 * new table implementation each.
 */
export interface EntryTableColumn<T> {
  key: string;
  header: string;
  render: (entry: T) => React.ReactNode;
  className?: string;
}

export function EntryTable<T>({
  entries,
  columns,
  getRowHref,
  getRowKey,
}: {
  entries: T[];
  columns: EntryTableColumn<T>[];
  getRowHref: (entry: T) => string;
  getRowKey: (entry: T) => string;
}) {
  return (
    <div className="border-border-muted rounded-card overflow-x-auto border">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-border-muted border-b">
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  'text-text-muted px-4 py-2.5 text-left font-mono text-[11px] tracking-[0.05em] uppercase',
                  column.className,
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-border-muted divide-y">
          {entries.map((entry) => (
            <tr
              key={getRowKey(entry)}
              className="hover:bg-surface-elevated duration-fast ease-standard transition-colors"
            >
              {columns.map((column, index) => (
                <td key={column.key} className={cn('p-0', column.className)}>
                  {/* Every cell links to the row's detail page — the row-level hover fill implies the whole row is clickable, so only the first (title) column looking clickable would be a broken affordance. */}
                  <Link
                    href={getRowHref(entry)}
                    className={cn(
                      'block px-4 py-3',
                      index === 0 ? 'text-text-primary hover:underline' : undefined,
                    )}
                  >
                    {column.render(entry)}
                  </Link>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
