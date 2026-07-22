'use client';

import {
  Code2,
  type LucideIcon,
  MessageSquareText,
  Rows3,
  Sparkles,
  Table as TableIcon,
  TextCursorInput,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { BlockType } from '@/lib/documents/blocks';
import { cn } from '@/lib/utils/cn';

/**
 * The editor's AI slash commands (Phase 10 brief: `/generate`, `/rewrite`,
 * `/summarize`, `/continue`, `/table`, `/explain`, `/code`). Triggered by
 * typing `/` as the very first character of an otherwise-empty paragraph or
 * markdown block — a small inline list anchored under the field, filtered
 * as the author keeps typing, rather than a second full-screen overlay
 * competing with the existing `BlockInsertMenu` "+" affordance.
 *
 * `generate`/`table`/`explain`/`code` insert new content at this block's
 * position; `rewrite`/`summarize`/`continue` act on the *previous* block
 * instead, since those verbs only make sense against content that already
 * exists — a slash command typed into a brand-new empty block has nothing
 * of its own yet to rewrite.
 */
export interface SlashCommandDefinition {
  command: string;
  label: string;
  description: string;
  icon: LucideIcon;
  kind: 'insert' | 'transform-previous';
  suggestedBlockType?: BlockType;
  instruction: string;
}

const SLASH_COMMANDS: SlashCommandDefinition[] = [
  {
    command: 'generate',
    label: '/generate',
    description: 'Generate new content at this position',
    icon: Sparkles,
    kind: 'insert',
    instruction: 'Generate content that fits naturally at this position in the document.',
  },
  {
    command: 'table',
    label: '/table',
    description: 'Generate a table',
    icon: TableIcon,
    kind: 'insert',
    suggestedBlockType: 'table',
    instruction: 'Generate a table appropriate for this position in the document.',
  },
  {
    command: 'code',
    label: '/code',
    description: 'Generate a code sample',
    icon: Code2,
    kind: 'insert',
    suggestedBlockType: 'code',
    instruction:
      'Generate a realistic code sample illustrating the point made just above this position.',
  },
  {
    command: 'explain',
    label: '/explain',
    description: 'Explain the preceding code',
    icon: TextCursorInput,
    kind: 'insert',
    instruction:
      'Explain the code block immediately before this position for a reader seeing it for the first time.',
  },
  {
    command: 'rewrite',
    label: '/rewrite',
    description: 'Rewrite the block above',
    icon: Rows3,
    kind: 'transform-previous',
    instruction: 'rewrite',
  },
  {
    command: 'summarize',
    label: '/summarize',
    description: 'Summarize the block above',
    icon: MessageSquareText,
    kind: 'transform-previous',
    instruction: 'summarize',
  },
  {
    command: 'continue',
    label: '/continue',
    description: 'Continue writing from the block above',
    icon: MessageSquareText,
    kind: 'transform-previous',
    instruction: 'continue',
  },
];

export function matchSlashCommand(
  value: string,
): { query: string; commands: SlashCommandDefinition[] } | null {
  const match = /^\/(\w*)$/.exec(value);
  if (!match) {
    return null;
  }
  const query = match[1]!.toLowerCase();
  const commands = SLASH_COMMANDS.filter((entry) => entry.command.startsWith(query));
  return { query, commands };
}

export function SlashCommandMenu({
  commands,
  disabledTransformPrevious,
  onSelect,
  onDismiss,
}: {
  commands: SlashCommandDefinition[];
  disabledTransformPrevious: boolean;
  onSelect: (command: SlashCommandDefinition) => void;
  onDismiss: () => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveIndex(0);
  }, [commands]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, commands.length - 1));
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      } else if (event.key === 'Enter') {
        const command = commands[activeIndex];
        if (command && !(command.kind === 'transform-previous' && disabledTransformPrevious)) {
          event.preventDefault();
          onSelect(command);
        }
      } else if (event.key === 'Escape') {
        onDismiss();
      }
    }
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [commands, activeIndex, disabledTransformPrevious, onSelect, onDismiss]);

  if (commands.length === 0) {
    return (
      <div
        ref={containerRef}
        className="border-border-default bg-surface-overlay rounded-card absolute top-full left-0 z-20 mt-1 w-64 border p-2 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.7)]"
      >
        <p className="text-text-muted px-2 py-1.5 text-xs">No matching command.</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      role="listbox"
      className="border-border-default bg-surface-overlay rounded-card absolute top-full left-0 z-20 mt-1 w-72 border p-1.5 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.7)]"
    >
      {commands.map((entry, index) => {
        const Icon = entry.icon;
        const disabled = entry.kind === 'transform-previous' && disabledTransformPrevious;
        return (
          <button
            key={entry.command}
            type="button"
            disabled={disabled}
            role="option"
            aria-selected={index === activeIndex}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onSelect(entry)}
            className={cn(
              'flex w-full items-start gap-2.5 rounded-[6px] px-2.5 py-2 text-left text-sm transition-colors',
              index === activeIndex && !disabled
                ? 'bg-surface-elevated text-text-primary'
                : 'text-text-secondary',
              disabled && 'cursor-not-allowed opacity-40',
            )}
          >
            <Icon className="text-text-muted mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span className="flex flex-col">
              <span>{entry.label}</span>
              <span className="text-text-muted text-xs">
                {disabled ? 'Needs a block above to act on' : entry.description}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
