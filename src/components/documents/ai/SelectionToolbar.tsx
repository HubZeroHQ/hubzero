'use client';

import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { SELECTION_INSTRUCTIONS } from '@/lib/ai/editorial';
import type { DocumentOutlineHeading, TransformInstruction } from '@/lib/ai/types';
import type { BlockEditorAiConfig } from './types';
import type { TextSelectionRange } from './use-textarea-selection';
import { useAiAction } from './use-ai-action';

/**
 * The selection-level AI toolbar (Phase 10 brief: "When text is selected,
 * show contextual AI actions"). Rendered as a small toolbar anchored below
 * the field once a selection exists — deliberately not a bubble that
 * follows the cursor. CMS_PRODUCT_DESIGN.md §5 explicitly rejects "a
 * floating format bubble that follows the cursor everywhere" for this
 * editor; an anchored toolbar satisfies the same "contextual actions on
 * selection" requirement without the pattern this system avoids elsewhere.
 */
export function SelectionToolbar({
  selection,
  fullText,
  ai,
  outline,
  onReplace,
}: {
  selection: TextSelectionRange;
  fullText: string;
  ai: BlockEditorAiConfig;
  outline: DocumentOutlineHeading[];
  onReplace: (newText: string) => void;
}) {
  const { status, error, run } = useAiAction<{ text: string }>();
  const [targetLanguage, setTargetLanguage] = useState('Spanish');
  const [awaitingLanguage, setAwaitingLanguage] = useState(false);

  async function handleSelect(instruction: TransformInstruction) {
    if (instruction === 'translate' && !awaitingLanguage) {
      setAwaitingLanguage(true);
      return;
    }
    const result = await run(() =>
      ai.transformSelection({
        selectedText: selection.text,
        instruction,
        targetLanguage: instruction === 'translate' ? targetLanguage : undefined,
        surroundingText: {
          before: fullText.slice(Math.max(0, selection.start - 200), selection.start),
          after: fullText.slice(selection.end, selection.end + 200),
        },
        outline: outline.length > 0 ? outline : undefined,
      }),
    );
    if (result) {
      onReplace(fullText.slice(0, selection.start) + result.text + fullText.slice(selection.end));
      setAwaitingLanguage(false);
    }
  }

  return (
    <div className="border-border-default bg-surface-elevated rounded-control mt-1.5 flex flex-wrap items-center gap-1 border p-1">
      {status === 'loading' ? (
        <span className="text-text-muted flex items-center gap-1.5 px-2 py-1 text-xs">
          <Loader2 className="h-3 w-3 animate-spin" aria-hidden /> Working…
        </span>
      ) : (
        SELECTION_INSTRUCTIONS.map(({ instruction, label }) => (
          <button
            key={instruction}
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => void handleSelect(instruction)}
            className="text-text-secondary hover:bg-surface-default hover:text-text-primary duration-fast ease-standard rounded-control px-2 py-1 text-xs transition-colors"
          >
            {label}
          </button>
        ))
      )}
      {awaitingLanguage ? (
        <input
          autoFocus
          value={targetLanguage}
          onChange={(event) => setTargetLanguage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              void handleSelect('translate');
            }
          }}
          placeholder="Target language"
          className="border-border-default bg-surface-default text-text-primary rounded-control w-32 border px-2 py-1 text-xs"
        />
      ) : null}
      {error ? (
        <p role="alert" className="text-danger w-full text-[11px]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
