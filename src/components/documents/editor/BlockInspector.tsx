'use client';

import { Button } from '@/components/ui/Button';
import { getBlockCatalogEntry } from '@/lib/documents/block-catalog';
import type { Block } from '@/lib/documents/blocks';
import {
  addTableColumn,
  addTableRow,
  removeTableColumn,
  removeTableRow,
} from '@/lib/documents/table-ops';
import { validateBlock } from '@/lib/documents/validation';

/**
 * Contextual settings, metadata, and validation for the selected block
 * (CMS_PRODUCT_DESIGN.md §5). Table's row/column controls are the one
 * genuinely block-specific contextual control today — every other block
 * type's "settings" already live inline in its field editor (a heading's
 * level, a callout's tone), so the inspector's job for those is mainly
 * surfacing metadata and validation rather than duplicating controls that
 * already exist in the canvas.
 */
export function BlockInspector({
  block,
  onChange,
  documentBlockCount,
}: {
  block: Block | null;
  onChange: (next: Block) => void;
  documentBlockCount: number;
}) {
  if (!block) {
    return (
      <div className="flex flex-col gap-2 p-4">
        <p className="text-text-muted font-mono text-[11px] tracking-[0.05em] uppercase">
          Document
        </p>
        <p className="text-text-secondary text-sm">
          {documentBlockCount} {documentBlockCount === 1 ? 'block' : 'blocks'}
        </p>
        <p className="text-text-muted text-xs">Select a block to see its settings.</p>
      </div>
    );
  }

  const catalogEntry = getBlockCatalogEntry(block.type);
  const validation = validateBlock(block);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <p className="text-text-muted font-mono text-[11px] tracking-[0.05em] uppercase">
          {catalogEntry.label}
        </p>
        <p className="text-text-muted text-xs">{catalogEntry.description}</p>
      </div>

      {block.type === 'table' ? (
        <div className="flex flex-col gap-2">
          <p className="text-text-secondary text-xs font-medium">Rows &amp; columns</p>
          <div className="flex flex-wrap gap-1.5">
            <Button
              variant="secondary"
              type="button"
              onClick={() => onChange({ ...block, data: addTableRow(block.data) })}
              className="px-2.5 text-xs"
            >
              Add row
            </Button>
            <Button
              variant="secondary"
              type="button"
              disabled={block.data.rows.length === 0}
              onClick={() =>
                onChange({ ...block, data: removeTableRow(block.data, block.data.rows.length - 1) })
              }
              className="px-2.5 text-xs"
            >
              Remove last row
            </Button>
            <Button
              variant="secondary"
              type="button"
              onClick={() => onChange({ ...block, data: addTableColumn(block.data) })}
              className="px-2.5 text-xs"
            >
              Add column
            </Button>
            <Button
              variant="secondary"
              type="button"
              disabled={block.data.headers.length <= 1}
              onClick={() =>
                onChange({
                  ...block,
                  data: removeTableColumn(block.data, block.data.headers.length - 1),
                })
              }
              className="px-2.5 text-xs"
            >
              Remove last column
            </Button>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-1">
        <p className="text-text-secondary text-xs font-medium">Validation</p>
        {validation.valid ? (
          <p className="text-success text-xs">Valid — ready to save.</p>
        ) : (
          <ul className="text-danger flex flex-col gap-0.5 text-xs">
            {Object.entries(validation.fieldErrors).map(([path, message]) => (
              <li key={path}>{message}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-text-muted font-mono text-[11px] tracking-[0.05em] uppercase">
          Block ID
        </p>
        <p className="text-text-muted truncate font-mono text-[11px]">{block.id}</p>
      </div>
    </div>
  );
}
