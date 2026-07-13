'use client';

import { ClipboardPaste, Eye, Pencil, Redo2, Undo2 } from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import {
  createBlockId,
  createDefaultBlock,
  duplicateBlockById,
  insertBlockAt,
  moveBlockBy,
  parseClipboardBlock,
  reorderBlocks,
  removeBlockById,
  serializeBlockForClipboard,
  updateBlockById,
} from '@/lib/documents/block-ops';
import type { Block, BlockType } from '@/lib/documents/blocks';
import { blockSchema } from '@/lib/documents/blocks';
import { useAutosave } from '@/lib/documents/use-autosave';
import { useDocumentHistory } from '@/lib/documents/use-document-history';
import { validateDocument } from '@/lib/documents/validation';
import { cn } from '@/lib/utils/cn';
import { BlockCanvas } from './editor/BlockCanvas';
import { BlockInsertMenu } from './editor/BlockInsertMenu';
import { BlockInspector } from './editor/BlockInspector';
import { DocumentOutline } from './editor/DocumentOutline';
import { EmptyDocumentState } from './editor/EmptyDocumentState';
import { useEditorShortcuts } from './editor/use-editor-shortcuts';
import { BlockRenderer } from './BlockRenderer';

export interface BlockEditorSaveResult {
  error?: string;
  fieldErrors?: Record<string, string>;
}

/**
 * The Document Engine's editor shell — the shared authoring surface every
 * collection that owns a Document uses (PLANNING.md §25). Collection-
 * agnostic by construction: nothing here knows about "Work" or "case
 * study," only `initialBlocks` and an `onSave` callback bound by the
 * caller's own server action (`document-actions.ts`'s
 * `createDocumentSaveAction`). `technologyOptions` is the one optional,
 * owner-supplied extra — any collection that wants the `technologyStack`
 * block's picker populated passes its own taxonomy options; omitting it
 * degrades to an honest empty state rather than a required prop every
 * caller must wire up.
 *
 * State model: `useDocumentHistory` owns the single source of truth for
 * `blocks` (past/present/future), `useAutosave` watches that value and
 * saves it through the same `onSave` every manual Save click uses. Every
 * mutation funnels through `commit()` so undo/redo, autosave, and the
 * dirty-state indicator all stay consistent by construction rather than by
 * convention.
 */
export function BlockEditor({
  initialBlocks,
  onSave,
  technologyOptions = [],
}: {
  initialBlocks: Block[];
  onSave: (blocks: Block[]) => Promise<BlockEditorSaveResult>;
  technologyOptions?: Array<{ id: string; label: string }>;
}) {
  const { blocks, commit, undo, redo, canUndo, canRedo } = useDocumentHistory(initialBlocks);
  const autosave = useAutosave({ blocks, onSave });

  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [collapsedBlockIds, setCollapsedBlockIds] = useState<Set<string>>(new Set());
  const [insertMenuOpen, setInsertMenuOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [pasteError, setPasteError] = useState<string | undefined>();

  const insertIndexRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const technologyLabels = useMemo(
    () => new Map(technologyOptions.map((option) => [option.id, option.label])),
    [technologyOptions],
  );

  const selectedBlock = blocks.find((block) => block.id === selectedBlockId) ?? null;
  const documentValidation = useMemo(() => validateDocument(blocks), [blocks]);

  const focusBlock = useCallback((id: string) => {
    setSelectedBlockId(id);
    // The block might not be in the DOM yet on the same tick it's inserted
    // (React hasn't committed/painted) — deferring to the next frame is
    // simpler and more robust here than threading a ref callback through
    // every insertion path.
    requestAnimationFrame(() => {
      const node = document.getElementById(`document-block-${id}`);
      node?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      node?.focus();
    });
  }, []);

  function openInsertMenuAt(index: number) {
    insertIndexRef.current = index;
    setInsertMenuOpen(true);
  }

  function handleInsertSelect(type: BlockType) {
    const newBlock = createDefaultBlock(type);
    commit(insertBlockAt(blocks, insertIndexRef.current, newBlock));
    focusBlock(newBlock.id);
  }

  function handleChangeBlock(next: Block) {
    commit(updateBlockById(blocks, next.id, next), `field:${next.id}`);
  }

  function handleMoveUp(id: string) {
    commit(moveBlockBy(blocks, id, -1));
  }

  function handleMoveDown(id: string) {
    commit(moveBlockBy(blocks, id, 1));
  }

  function handleDuplicate(id: string) {
    const next = duplicateBlockById(blocks, id);
    commit(next);
    const duplicated = next[next.findIndex((block) => block.id === id) + 1];
    if (duplicated) {
      focusBlock(duplicated.id);
    }
  }

  async function handleCopy(id: string) {
    const block = blocks.find((entry) => entry.id === id);
    if (!block || typeof navigator === 'undefined' || !navigator.clipboard) {
      return;
    }
    await navigator.clipboard.writeText(serializeBlockForClipboard(block));
  }

  async function handlePaste() {
    setPasteError(undefined);
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      setPasteError('Clipboard access is not available.');
      return;
    }
    try {
      const text = await navigator.clipboard.readText();
      const parsed = parseClipboardBlock(text);
      const result = parsed ? blockSchema.safeParse({ ...parsed, id: createBlockId() }) : null;
      if (!result || !result.success) {
        setPasteError('Clipboard doesn’t contain a copied block.');
        return;
      }
      const insertAfterIndex = selectedBlockId
        ? blocks.findIndex((block) => block.id === selectedBlockId) + 1
        : blocks.length;
      commit(insertBlockAt(blocks, insertAfterIndex, result.data));
      focusBlock(result.data.id);
    } catch {
      setPasteError('Could not read the clipboard.');
    }
  }

  function handleDelete(id: string) {
    commit(removeBlockById(blocks, id));
    if (selectedBlockId === id) {
      setSelectedBlockId(null);
    }
  }

  function handleReorder(fromIndex: number, toIndex: number) {
    commit(reorderBlocks(blocks, fromIndex, toIndex));
  }

  function handleToggleCollapsed(id: string) {
    setCollapsedBlockIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  useEditorShortcuts({
    containerRef,
    onUndo: undo,
    onRedo: redo,
    onSave: () => void autosave.saveNow(),
    onMoveSelectedUp: () => selectedBlockId && handleMoveUp(selectedBlockId),
    onMoveSelectedDown: () => selectedBlockId && handleMoveDown(selectedBlockId),
  });

  return (
    <div ref={containerRef} className="flex flex-col gap-3">
      <EditorHeader
        autosaveStatus={autosave.status}
        autosaveError={autosave.error}
        lastSavedAt={autosave.lastSavedAt}
        documentValid={documentValidation.valid}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onSave={() => void autosave.saveNow()}
        onPaste={() => void handlePaste()}
        previewMode={previewMode}
        onTogglePreview={() => setPreviewMode((prev) => !prev)}
      />

      {pasteError ? (
        <p role="alert" className="text-danger text-xs">
          {pasteError}
        </p>
      ) : null}

      {previewMode ? (
        <div className="rounded-card border-border-default border p-6">
          {blocks.length === 0 ? (
            <p className="text-text-muted text-sm">Nothing to preview yet.</p>
          ) : (
            <BlockRenderer blocks={blocks} technologyLabels={technologyLabels} />
          )}
        </div>
      ) : blocks.length === 0 ? (
        <EmptyDocumentState onInsert={() => openInsertMenuAt(0)} />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
          <BlockCanvas
            blocks={blocks}
            selectedBlockId={selectedBlockId}
            collapsedBlockIds={collapsedBlockIds}
            technologyOptions={technologyOptions}
            onSelect={setSelectedBlockId}
            onChangeBlock={handleChangeBlock}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            onDuplicate={handleDuplicate}
            onCopy={(id) => void handleCopy(id)}
            onDelete={handleDelete}
            onToggleCollapsed={handleToggleCollapsed}
            onReorder={handleReorder}
            onInsertAt={openInsertMenuAt}
          />

          <aside className="border-border-muted flex flex-col divide-y divide-[color:var(--color-border-muted)] border-l lg:sticky lg:top-4 lg:h-fit">
            <div>
              <p className="text-text-muted px-4 pt-3 font-mono text-[11px] tracking-[0.05em] uppercase">
                Outline
              </p>
              <DocumentOutline blocks={blocks} onJumpTo={focusBlock} />
            </div>
            <BlockInspector
              block={selectedBlock}
              onChange={handleChangeBlock}
              documentBlockCount={blocks.length}
            />
          </aside>
        </div>
      )}

      <BlockInsertMenu
        open={insertMenuOpen}
        onOpenChange={setInsertMenuOpen}
        onSelect={handleInsertSelect}
      />
    </div>
  );
}

function EditorHeader({
  autosaveStatus,
  autosaveError,
  lastSavedAt,
  documentValid,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSave,
  onPaste,
  previewMode,
  onTogglePreview,
}: {
  autosaveStatus: 'idle' | 'dirty' | 'saving' | 'saved' | 'invalid' | 'error';
  autosaveError?: string;
  lastSavedAt: Date | null;
  documentValid: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onPaste: () => void;
  previewMode: boolean;
  onTogglePreview: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p role="status" aria-live="polite" className="text-text-muted text-xs">
        <SaveStatusLabel status={autosaveStatus} error={autosaveError} lastSavedAt={lastSavedAt} />
      </p>

      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          type="button"
          onClick={onUndo}
          disabled={!canUndo || previewMode}
          aria-label="Undo"
          title="Undo (Ctrl/Cmd+Z)"
        >
          <Undo2 className="h-3.5 w-3.5" aria-hidden />
        </Button>
        <Button
          variant="ghost"
          type="button"
          onClick={onRedo}
          disabled={!canRedo || previewMode}
          aria-label="Redo"
          title="Redo (Ctrl/Cmd+Shift+Z)"
        >
          <Redo2 className="h-3.5 w-3.5" aria-hidden />
        </Button>
        <Button
          variant="ghost"
          type="button"
          onClick={onPaste}
          disabled={previewMode}
          aria-label="Paste block"
          title="Paste a copied block"
        >
          <ClipboardPaste className="h-3.5 w-3.5" aria-hidden />
        </Button>
        <Button variant="secondary" type="button" onClick={onTogglePreview}>
          {previewMode ? (
            <>
              <Pencil className="h-3.5 w-3.5" aria-hidden />
              Edit
            </>
          ) : (
            <>
              <Eye className="h-3.5 w-3.5" aria-hidden />
              Preview
            </>
          )}
        </Button>
        <Button
          type="button"
          onClick={onSave}
          disabled={!documentValid || autosaveStatus === 'saving'}
          title="Save (Ctrl/Cmd+S)"
        >
          {autosaveStatus === 'saving' ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </div>
  );
}

function SaveStatusLabel({
  status,
  error,
  lastSavedAt,
}: {
  status: 'idle' | 'dirty' | 'saving' | 'saved' | 'invalid' | 'error';
  error?: string;
  lastSavedAt: Date | null;
}) {
  switch (status) {
    case 'saving':
      return <span>Saving…</span>;
    case 'saved':
      return (
        <span className={cn('text-success')}>
          Saved{lastSavedAt ? ` at ${lastSavedAt.toLocaleTimeString()}` : ''}
        </span>
      );
    case 'dirty':
      return <span>Unsaved changes…</span>;
    case 'invalid':
      return <span className="text-danger">Fix highlighted fields to save.</span>;
    case 'error':
      return <span className="text-danger">{error ?? 'Could not save.'}</span>;
    default:
      return (
        <span>
          {lastSavedAt ? `Saved at ${lastSavedAt.toLocaleTimeString()}` : 'No changes yet.'}
        </span>
      );
  }
}
