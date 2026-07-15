'use client';

import type { Block } from '@/lib/documents/blocks';
import { cn } from '@/lib/utils/cn';

/** Auto-generated from `heading` blocks (CMS_PRODUCT_DESIGN.md §5) — click to jump the canvas to that block. */
export function DocumentOutline({
  blocks,
  onJumpTo,
}: {
  blocks: Block[];
  onJumpTo: (blockId: string) => void;
}) {
  const headings = blocks.filter(
    (block): block is Extract<Block, { type: 'heading' }> => block.type === 'heading',
  );

  if (headings.length === 0) {
    return <p className="text-text-muted p-4 text-xs">Add a heading to build an outline.</p>;
  }

  return (
    <nav aria-label="Document outline" className="flex flex-col gap-0.5 p-2">
      {headings.map((heading) => (
        <button
          key={heading.id}
          type="button"
          onClick={() => onJumpTo(heading.id)}
          className={cn(
            'hover:bg-surface-elevated duration-fast ease-standard rounded-control truncate px-2 py-1.5 text-left text-xs transition-colors',
            heading.data.level === 2 && 'text-text-primary font-medium',
            heading.data.level === 3 && 'text-text-secondary pl-4',
            heading.data.level === 4 && 'text-text-muted pl-6',
          )}
        >
          {heading.data.text || 'Untitled heading'}
        </button>
      ))}
    </nav>
  );
}
