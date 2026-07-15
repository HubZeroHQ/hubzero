'use client';

import { Input } from '@/components/ui/Input';
import type { Block } from '@/lib/documents/blocks';

/**
 * The inline grid — cell/header text editing only. Row/column add/remove
 * lives in `BlockInspector` (CMS_PRODUCT_DESIGN.md §5's contextual-controls
 * example), sharing the pure `table-ops.ts` functions the inspector calls
 * directly against the selected block.
 */
export function TableFields({
  block,
  onChange,
}: {
  block: Extract<Block, { type: 'table' }>;
  onChange: (next: Block) => void;
}) {
  const { headers, rows } = block.data;

  function updateHeader(index: number, value: string) {
    onChange({
      ...block,
      data: { ...block.data, headers: headers.map((h, i) => (i === index ? value : h)) },
    });
  }

  function updateCell(rowIndex: number, columnIndex: number, value: string) {
    onChange({
      ...block,
      data: {
        ...block.data,
        rows: rows.map((row, r) =>
          r === rowIndex ? row.map((cell, c) => (c === columnIndex ? value : cell)) : row,
        ),
      },
    });
  }

  return (
    <div className="border-border-muted overflow-x-auto rounded-[4px] border">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index} className="border-border-muted border-b p-1">
                <Input
                  value={header}
                  onChange={(event) => updateHeader(index, event.target.value)}
                  placeholder={`Column ${index + 1}`}
                  aria-label={`Column ${index + 1} header`}
                  className="font-semibold"
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, columnIndex) => (
                <td key={columnIndex} className="border-border-muted border-b p-1">
                  <Input
                    value={cell}
                    onChange={(event) => updateCell(rowIndex, columnIndex, event.target.value)}
                    aria-label={`Row ${rowIndex + 1}, column ${columnIndex + 1}`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
