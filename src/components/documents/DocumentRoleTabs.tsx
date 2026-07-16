'use client';

import { useState } from 'react';
import type { Block } from '@/lib/documents/blocks';
import type { DocumentRole } from '@/lib/documents/schema';
import { cn } from '@/lib/utils/cn';
import { BlockEditor, type BlockEditorSaveResult } from './BlockEditor';

export interface DocumentRoleTab {
  role: DocumentRole;
  label: string;
  initialBlocks: Block[];
  onSave: (blocks: Block[]) => Promise<BlockEditorSaveResult>;
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
 * Each tab keeps its own `BlockEditor` mounted only while active — swapping
 * tabs is a full unmount/remount, so each editor's undo history and
 * autosave state stay scoped to its own Document rather than bleeding
 * across roles.
 */
export function DocumentRoleTabs({
  tabs,
  technologyOptions,
}: {
  tabs: DocumentRoleTab[];
  technologyOptions?: Array<{ id: string; label: string }>;
}) {
  const [activeRole, setActiveRole] = useState<DocumentRole>(tabs[0]?.role ?? 'caseStudy');
  const activeTab = tabs.find((tab) => tab.role === activeRole) ?? tabs[0];

  if (!activeTab) {
    return null;
  }

  if (tabs.length === 1) {
    return (
      <BlockEditor
        initialBlocks={activeTab.initialBlocks}
        onSave={activeTab.onSave}
        technologyOptions={technologyOptions}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        role="tablist"
        aria-label="Document"
        className="border-border-muted flex gap-1.5 border-b pb-3"
      >
        {tabs.map((tab) => (
          <button
            key={tab.role}
            type="button"
            role="tab"
            aria-selected={tab.role === activeRole}
            onClick={() => setActiveRole(tab.role)}
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
      />
    </div>
  );
}
