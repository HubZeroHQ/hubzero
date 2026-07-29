'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { flattenNav, type StudioNavEntry } from './navigation';

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  return (
    target.isContentEditable ||
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'SELECT'
  );
}

/**
 * CMS_PRODUCT_DESIGN.md §2 keyboard shortcut table — `⌘K`/`Ctrl+K` and `/`
 * both open the command palette (search-as-you-type is the palette's only
 * entry point, §7), and `g` then a letter jumps straight to a nav
 * destination by its first letter. `c` (new entry) and `Alt+↑/↓` (block
 * reorder) are out of scope — both require editing UI Phase 2 doesn't
 * build.
 */
export function useKeyboardShortcuts({
  nav,
  onOpenPalette,
}: {
  nav: StudioNavEntry[];
  onOpenPalette: () => void;
}): void {
  const router = useRouter();
  const awaitingChordRef = useRef(false);

  useEffect(() => {
    const leaves = flattenNav(nav);

    function handleKeyDown(event: KeyboardEvent) {
      if (isTypingTarget(event.target)) {
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        onOpenPalette();
        return;
      }

      if (awaitingChordRef.current) {
        awaitingChordRef.current = false;
        const match = leaves.find((leaf) =>
          leaf.label.toLowerCase().startsWith(event.key.toLowerCase()),
        );
        if (match) {
          event.preventDefault();
          router.push(match.href);
        }
        return;
      }

      if (event.key === '/') {
        event.preventDefault();
        onOpenPalette();
        return;
      }

      if (event.key === 'g') {
        awaitingChordRef.current = true;
        window.setTimeout(() => {
          awaitingChordRef.current = false;
        }, 1200);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nav, onOpenPalette, router]);
}
