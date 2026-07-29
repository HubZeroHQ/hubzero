'use client';

import { useRef } from 'react';
import type { Block } from '@/lib/documents/blocks';
import type { AdjacentBlockContext, DocumentOutlineHeading } from '@/lib/ai/types';
import { textareaClass } from '@/components/documents/editor/fields/shared';
import { cn } from '@/lib/utils/cn';
import { SelectionToolbar } from './SelectionToolbar';
import {
  matchSlashCommand,
  SlashCommandMenu,
  type SlashCommandDefinition,
} from './SlashCommandMenu';
import type { BlockEditorAiConfig } from './types';
import { useAiAction } from './use-ai-action';
import { useTextareaSelection } from './use-textarea-selection';

/**
 * The AI-aware wrapper around a plain `<textarea>` prose field (paragraph,
 * markdown) — adds the selection toolbar and slash commands on top of the
 * same field, without either feature requiring its own separate input.
 * Rendered only when the block's owning editor was given an `ai` config
 * (`BlockEditor`'s `ai` prop); the plain `<textarea>` shape it wraps is
 * otherwise unchanged from before Phase 10.
 */
export function TextBlockField({
  value,
  onChange,
  placeholder,
  rows,
  monospace,
  ariaLabel,
  ai,
  outline,
  adjacent,
  previousBlock,
  onReplaceSelf,
  onReplacePrevious,
}: {
  value: string;
  onChange: (text: string) => void;
  placeholder: string;
  rows: number;
  monospace?: boolean;
  ariaLabel: string;
  ai?: BlockEditorAiConfig;
  outline: DocumentOutlineHeading[];
  adjacent?: AdjacentBlockContext;
  previousBlock?: Block;
  onReplaceSelf: (blocks: Block[]) => void;
  onReplacePrevious: (blocks: Block[]) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { selection, updateSelection, clearSelection } = useTextareaSelection(textareaRef);
  const slashAction = useAiAction<{ blocks: Block[]; containsPlaceholders: boolean }>();

  const slashMatch = ai ? matchSlashCommand(value) : null;

  async function handleSlashSelect(command: SlashCommandDefinition) {
    if (!ai) return;
    if (command.kind === 'insert') {
      const result = await slashAction.run(() =>
        ai.generateBlock({
          instruction: command.instruction,
          suggestedBlockType: command.suggestedBlockType,
          adjacent,
          outline: outline.length > 0 ? outline : undefined,
        }),
      );
      if (result) {
        onReplaceSelf(result.blocks);
      }
      return;
    }

    if (!previousBlock) return;
    const result = await slashAction.run(() =>
      ai.transformBlock({
        block: previousBlock,
        instruction: command.instruction as 'rewrite' | 'summarize' | 'continue',
        outline: outline.length > 0 ? outline : undefined,
      }),
    );
    if (result) {
      onReplacePrevious(result.blocks);
      onChange('');
    }
  }

  return (
    <div className="relative flex flex-col gap-1">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onSelect={updateSelection}
        onBlur={() => window.setTimeout(clearSelection, 150)}
        rows={rows}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={cn(textareaClass, monospace && 'font-mono')}
      />

      {slashMatch ? (
        <SlashCommandMenu
          commands={slashMatch.commands}
          disabledTransformPrevious={!previousBlock}
          onSelect={(command) => void handleSlashSelect(command)}
          onDismiss={() => onChange('')}
        />
      ) : null}

      {slashAction.status === 'loading' ? (
        <p className="text-text-muted text-xs">Generating…</p>
      ) : null}
      {slashAction.error ? (
        <p role="alert" className="text-danger text-xs">
          {slashAction.error}
        </p>
      ) : null}

      {ai && selection ? (
        <SelectionToolbar
          selection={selection}
          fullText={value}
          ai={ai}
          outline={outline}
          onReplace={(newText) => {
            onChange(newText);
            clearSelection();
          }}
        />
      ) : null}
    </div>
  );
}
