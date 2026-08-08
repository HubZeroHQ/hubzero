'use client';

import { useRef, useState, type KeyboardEvent } from 'react';
import type { Block } from '@/lib/documents/blocks';
import type { DocumentRole } from '@/lib/documents/schema';
import { useEditorRegistry } from '@/lib/studio/editor-state/context';
import { cn } from '@/lib/utils/cn';
import type { BlockEditorAiConfig } from './ai/types';
import { BlockEditor, type BlockEditorSaveResult } from './BlockEditor';

export interface DocumentRoleTab {
  role: DocumentRole;
  label: string;
  initialBlocks: Block[];
  onSave: (blocks: Block[]) => Promise<BlockEditorSaveResult>;
  /** Omit to hide every AI affordance for this specific Document role — each tab opts in independently, same as `BlockEditor`'s own `ai` prop. */
  ai?: BlockEditorAiConfig;
}

/**
 * The Document Engine's editor shell (`BlockEditor`) is per-Document, but an
 * owner can hold more than one Document distinguished by `role` (§25) — a
 * Build owns both `caseStudy` and `technical` (§10, §26.2). Rather than a
 * Builds-specific "two editors" page, this generalizes the switch to any
 * number of roles: CMS_PRODUCT_DESIGN.md §5 names this pattern directly
 * ("Document tabs (Builds only): Case Study / Technical") but describes it
 * as the general behavior for "an entry that owns more than one Document,"
 * not a Builds-only component — the next owner that grows a second role
 * (§36's changelog-as-a-role example) reuses this instead of another
 * bespoke tab strip.
 *
 * Each tab keeps its own `BlockEditor` mounted only while active. A swap
 * flushes the current role successfully before that unmount, so undo and
 * autosave state stay role-scoped without making unmount a data-loss path.
 */
export function DocumentRoleTabs({
  tabs,
  technologyOptions,
  previewHref,
}: {
  tabs: DocumentRoleTab[];
  technologyOptions?: Array<{ id: string; label: string }>;
  /** The owning entry's real public URL — the same one regardless of which Document role is active, since all roles belong to the same entry (see `BlockEditor`'s own doc comment). */
  previewHref?: string;
}) {
  const [activeRole, setActiveRole] = useState<DocumentRole>(tabs[0]?.role ?? 'caseStudy');
  const [switching, setSwitching] = useState(false);
  const activeRoleRef = useRef(activeRole);
  const pendingRoleRef = useRef<DocumentRole | null>(null);
  const switchingRef = useRef(false);
  const registry = useEditorRegistry();
  const activeTab = tabs.find((tab) => tab.role === activeRole) ?? tabs[0];

  activeRoleRef.current = activeRole;

  if (!activeTab) {
    return null;
  }

  const editorId = (role: DocumentRole) => `document-engine:${role}`;

  async function requestRole(nextRole: DocumentRole) {
    pendingRoleRef.current = nextRole;
    if (switchingRef.current || nextRole === activeRoleRef.current) {
      return;
    }

    switchingRef.current = true;
    setSwitching(true);
    try {
      const saved = registry ? await registry.flushEditor(editorId(activeRoleRef.current)) : true;
      if (!saved) {
        pendingRoleRef.current = null;
        return;
      }

      // Rapid clicks while the save is in flight collapse to the latest role.
      // Intermediate editors are never mounted, so there is no second
      // unsaved state to account for.
      const requestedRole = pendingRoleRef.current;
      pendingRoleRef.current = null;
      if (requestedRole && requestedRole !== activeRoleRef.current) {
        activeRoleRef.current = requestedRole;
        setActiveRole(requestedRole);
      }
    } finally {
      switchingRef.current = false;
      setSwitching(false);
    }
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number | null = null;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = tabs.length - 1;
    if (nextIndex === null) return;

    event.preventDefault();
    const next = tabs[nextIndex];
    const button =
      event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[
        nextIndex
      ];
    button?.focus();
    if (next) {
      void requestRole(next.role);
    }
  }

  if (tabs.length === 1) {
    return (
      <BlockEditor
        initialBlocks={activeTab.initialBlocks}
        onSave={activeTab.onSave}
        technologyOptions={technologyOptions}
        ai={activeTab.ai}
        previewHref={previewHref}
        editorId={editorId(activeTab.role)}
        editorLabel={`${activeTab.label} document`}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        role="tablist"
        aria-label="Document"
        aria-busy={switching}
        className="border-border-muted flex gap-1.5 border-b pb-3"
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.role}
            type="button"
            role="tab"
            aria-selected={tab.role === activeRole}
            tabIndex={tab.role === activeRole ? 0 : -1}
            onClick={() => void requestRole(tab.role)}
            onKeyDown={(event) => handleTabKeyDown(event, index)}
            className={cn(
              'rounded-control duration-fast ease-standard px-3 py-1.5 text-sm font-medium transition-colors',
              tab.role === activeRole
                ? 'bg-surface-elevated text-text-primary'
                : 'text-text-muted hover:text-text-secondary',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <BlockEditor
        key={activeTab.role}
        initialBlocks={activeTab.initialBlocks}
        onSave={activeTab.onSave}
        technologyOptions={technologyOptions}
        ai={activeTab.ai}
        previewHref={previewHref}
        editorId={editorId(activeTab.role)}
        editorLabel={`${activeTab.label} document`}
      />
    </div>
  );
}
