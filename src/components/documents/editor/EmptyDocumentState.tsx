'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

/** DESIGN_SYSTEM.md §7 Empty States — instructive, never apologetic, with an implied next action. */
export function EmptyDocumentState({ onInsert }: { onInsert: () => void }) {
  return (
    <EmptyState
      title="This document is empty."
      description="Start writing, or insert your first block — a heading, a paragraph, an image, whatever the content calls for."
      action={
        <Button type="button" onClick={onInsert}>
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Insert a block
        </Button>
      }
    />
  );
}
