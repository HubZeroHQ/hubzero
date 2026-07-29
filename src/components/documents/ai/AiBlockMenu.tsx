'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Loader2, Sparkles } from 'lucide-react';
import { getBlockInstructions, getInstructionGuidance } from '@/lib/ai/editorial';
import type {
  AdjacentBlockContext,
  BlockInstruction,
  DocumentOutlineHeading,
} from '@/lib/ai/types';
import type { Block } from '@/lib/documents/blocks';
import { cn } from '@/lib/utils/cn';
import type { BlockEditorAiConfig } from './types';
import { useAiAction } from './use-ai-action';

/**
 * The per-block AI menu (Phase 10 brief — "Every appropriate block should
 * expose AI actions... the available actions should depend on the selected
 * block type"). Sits in `BlockShell`'s existing action row, next to
 * duplicate/copy/delete, and stays entirely absent for block types with no
 * applicable instruction (`getBlockInstructions` returning an empty list —
 * divider, technologyStack, metrics, timeline, links, references,
 * fileAttachment) rather than showing a menu with nothing useful in it.
 *
 * "Generate alternatives" is deliberately not a special picker UI — the 2–3
 * returned candidates are inserted as sibling blocks right after the
 * original, each flagged AI-generated; the author picks between them using
 * the block canvas's existing delete action rather than a bespoke
 * comparison view. Every other instruction replaces the block in place.
 */
export function AiBlockMenu({
  block,
  ai,
  outline,
  adjacent,
  onReplace,
  onInsertAlternatives,
}: {
  block: Block;
  ai: BlockEditorAiConfig;
  outline: DocumentOutlineHeading[];
  adjacent?: AdjacentBlockContext;
  /** Replaces this block in place — every instruction except "generate alternatives". */
  onReplace: (blocks: Block[]) => void;
  /** Inserts the returned candidates as sibling blocks right after this one, keeping the original — "generate alternatives" only, so the author picks between real options rather than losing the source. */
  onInsertAlternatives: (blocks: Block[]) => void;
}) {
  const instructions = getBlockInstructions(block.type);
  const { status, error, run } = useAiAction<{ blocks: Block[]; containsPlaceholders: boolean }>();

  if (instructions.length === 0) {
    return null;
  }

  async function handleSelect(instruction: BlockInstruction) {
    const result = await run(() =>
      ai.transformBlock({
        block,
        instruction,
        adjacent,
        outline: outline.length > 0 ? outline : undefined,
      }),
    );
    if (result) {
      if (instruction === 'generateAlternatives') {
        onInsertAlternatives(result.blocks);
      } else {
        onReplace(result.blocks);
      }
    }
  }

  return (
    <div className="relative">
      {error ? (
        <p
          role="alert"
          className="text-danger bg-surface-overlay absolute top-full right-0 z-10 mt-1 w-48 rounded-[4px] p-1.5 text-[11px]"
        >
          {error}
        </p>
      ) : null}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            disabled={status === 'loading'}
            aria-label="AI actions for this block"
            title="AI actions"
            className={cn(
              'text-text-muted hover:text-text-primary hover:bg-surface-elevated duration-fast ease-standard rounded-control flex min-h-11 min-w-11 items-center justify-center transition-colors',
              status === 'loading' && 'text-text-primary',
            )}
          >
            {status === 'loading' ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            ) : (
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
            )}
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={6}
            className="overlay-panel rounded-card border-border-default bg-surface-overlay z-50 w-56 border p-1.5 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.7)] outline-none"
          >
            {instructions.map((instruction) => {
              const guidance = getInstructionGuidance(instruction);
              return (
                <DropdownMenu.Item
                  key={instruction}
                  onSelect={() => void handleSelect(instruction)}
                  className="text-text-secondary duration-fast ease-standard hover:bg-surface-elevated hover:text-text-primary data-[highlighted]:bg-surface-elevated data-[highlighted]:text-text-primary rounded-control flex w-full cursor-pointer items-center gap-2 px-2.5 py-2 text-left text-sm transition-colors outline-none"
                >
                  {guidance.label}
                </DropdownMenu.Item>
              );
            })}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
