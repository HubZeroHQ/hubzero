import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

/**
 * Shared dense table for Studio collections.
 *
 * The first cell is the row's one explicit navigation action. Repeating the
 * same link in every cell created several indistinguishable Tab stops per row
 * and invalid interactive nesting as soon as a rendered cell gained a control.
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
    <div
      role="region"
      aria-label="Entries table"
      tabIndex={0}
      className="border-border-muted rounded-card overflow-x-auto border"
    >
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-border-muted border-b">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
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
                  {index === 0 ? (
                    <Link
                      href={getRowHref(entry)}
                      className="text-text-primary block px-4 py-3 hover:underline"
                    >
                      {column.render(entry)}
                    </Link>
                  ) : (
                    <div className="px-4 py-3">{column.render(entry)}</div>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
