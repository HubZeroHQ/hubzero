'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { EditorGuardContext } from '@/lib/studio/editor-state/context';
import { EditorRegistry } from '@/lib/studio/editor-state/editor-registry';
import { StickySaveBar } from './StickySaveBar';
import { UnsavedChangesDialog } from './UnsavedChangesDialog';

/**
 * Marks a link that must bypass the unsaved-changes guard — an escape hatch
 * for a link whose whole purpose is to leave (there is none today; it exists
 * so a future one doesn't have to fight the guard).
 */
const BYPASS_ATTRIBUTE = 'data-unsaved-guard-bypass';

/**
 * Key stamped onto the history entry the guard pushes to absorb a Back
 * press. Merged into Next's own `history.state` rather than replacing it —
 * the App Router keeps its routing tree there, and clobbering it would break
 * back/forward navigation far more thoroughly than losing an edit.
 */
const SENTINEL_KEY = '__hubzeroUnsavedGuard';

/**
 * Is the entry the browser is currently sitting on one the guard pushed?
 *
 * The sentinel's lifecycle is read from `history.state` rather than mirrored
 * in a React ref. A ref is a *copy* of the history stack's shape, and the two
 * drift the moment anything happens asynchronously — `history.back()` resolves
 * on a later task, so a dirty→clean→dirty flip within that window could push a
 * second sentinel before the first pop landed, leaving either two sentinels
 * (Back costs an extra press) or none (Back isn't guarded at all). Asking the
 * stack itself makes both push and pop idempotent and self-correcting.
 */
function hasSentinel(): boolean {
  return Boolean((window.history.state as Record<string, unknown> | null)?.[SENTINEL_KEY]);
}

/** Pushes a same-URL sentinel, unless one is already the current entry. */
function pushSentinel(): void {
  if (hasSentinel()) {
    return;
  }
  window.history.pushState({ ...window.history.state, [SENTINEL_KEY]: true }, '');
}

function isModifiedClick(event: MouseEvent): boolean {
  return event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

/**
 * Whether this anchor is a same-tab, in-app navigation the guard is
 * responsible for. Anything else — a new tab, a download, `mailto:`, an
 * external origin, a pure hash jump on the current page — either doesn't
 * discard the editor or isn't ours to intercept.
 */
function guardableHref(anchor: HTMLAnchorElement): URL | null {
  if (anchor.hasAttribute(BYPASS_ATTRIBUTE) || anchor.hasAttribute('download')) {
    return null;
  }
  const target = anchor.getAttribute('target');
  if (target && target !== '_self') {
    return null;
  }

  let url: URL;
  try {
    url = new URL(anchor.href, window.location.href);
  } catch {
    return null;
  }

  if (url.origin !== window.location.origin) {
    return null;
  }
  if (url.pathname === window.location.pathname && url.search === window.location.search) {
    // Same document, hash-only — no editor state is lost.
    return null;
  }
  return url;
}

/**
 * Installs the Studio's unsaved-changes protection around everything the
 * shell renders (phase brief §5–§7).
 *
 * Three interception points, because the browser gives no single one:
 *
 * 1. **A capture-phase click listener on `document`** catches every anchor —
 *    sidebar, breadcrumbs, entry tables, dashboard lists, detail-page
 *    actions — including links written by code that has never heard of the
 *    guard. Capture + `stopPropagation` means the event never reaches
 *    Next.js's `Link` handler, so the route change genuinely does not start.
 * 2. **A `popstate` handler over a same-URL sentinel entry** catches Back and
 *    Forward. The sentinel is pushed the moment an editor becomes dirty, so
 *    the first Back press pops a duplicate of the page the author is already
 *    on: nothing renders, nothing is lost, and the guard re-pushes the
 *    sentinel to keep the position stable while it asks.
 * 3. **`beforeunload`** covers refresh, tab close, and typed-URL departure.
 *    The listener remains mounted for the provider lifetime and synchronously
 *    probes the registry, eliminating the render-timing gap after an edit.
 *
 * Programmatic navigation (the command palette, keyboard jumps) has no DOM
 * event to intercept and opts in through `useGuardedRouter` instead.
 */
export function EditorGuardProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [registry] = useState(() => new EditorRegistry());

  const suppressPopRef = useRef(false);

  // ---- Anchor clicks -----------------------------------------------------
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented || isModifiedClick(event)) {
        return;
      }
      if (!registry.hasUnsavedWork()) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      const anchor = target.closest('a[href]');
      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }
      const url = guardableHref(anchor);
      if (!url) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      const href = `${url.pathname}${url.search}${url.hash}`;
      registry.requestNavigation({ perform: () => router.push(href), description: href });
    }

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [registry, router]);

  // ---- Browser Back / Forward -------------------------------------------
  useEffect(() => {
    function handlePopState() {
      if (suppressPopRef.current) {
        // Our own cleanup pop, not the author's.
        suppressPopRef.current = false;
        return;
      }
      if (!registry.hasUnsavedWork()) {
        return;
      }

      // Re-absorb: put the position back exactly where it was before asking,
      // so choosing "Stay Editing" leaves history untouched. This consumes
      // the sentinel the pop just popped and pushes a replacement, so the
      // count above the edit entry stays at exactly one no matter how many
      // times Back is pressed.
      pushSentinel();
      registry.requestNavigation({
        // Two entries back: the sentinel just re-pushed, then the one the
        // author was actually trying to reach. `requestNavigation` ignores
        // this while a question is already open, so the intent that survives
        // is always the one built for the stack as it stands.
        perform: () => window.history.go(-2),
        description: 'history-back',
      });
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [registry]);

  // ---- Sentinel lifecycle + unload protection ---------------------------
  const guardState = useEditorGuardBlocking(registry);

  useEffect(() => {
    if (guardState) {
      pushSentinel();
      return;
    }

    // Clean again without having navigated (saved in place, or discarded):
    // retire the sentinel so the author's next Back press behaves normally
    // instead of costing them a wasted press on a duplicate entry. Skipped
    // while bypassing, because there the departure itself is what retires it.
    if (!registry.isBypassing() && hasSentinel()) {
      suppressPopRef.current = true;
      window.history.back();
    }
  }, [guardState, registry]);

  useEffect(() => {
    // This listener must exist before the first edit. Registering it only
    // after React has rendered a dirty state leaves a real event-loop gap:
    // typing and immediately reloading can beat the effect and discard text.
    // The listener itself is cheap and consults the registry's synchronous
    // probe, so clean Studio pages still proceed without a prompt or render
    // work on every keystroke.
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (!registry.hasUnsavedWork()) {
        return;
      }
      event.preventDefault();
      // Legacy spelling still required by some browsers to raise the prompt.
      event.returnValue = '';
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [registry]);

  return (
    <EditorGuardContext.Provider value={registry}>
      {children}
      <StickySaveBar />
      <UnsavedChangesDialog />
    </EditorGuardContext.Provider>
  );
}

/**
 * A deliberately coarse subscription: re-renders the provider only when the
 * *boolean* "is anything dirty" flips, never on the per-keystroke updates
 * that flow through the registry. The provider sits above the whole shell,
 * so anything finer-grained here would re-render the sidebar as the author
 * types.
 */
function useEditorGuardBlocking(registry: EditorRegistry): boolean {
  const [blocking, setBlocking] = useState(false);

  useEffect(() => {
    function sync() {
      setBlocking(registry.dirtyEditors().length > 0);
    }
    sync();
    return registry.subscribe(sync);
  }, [registry]);

  return blocking;
}
