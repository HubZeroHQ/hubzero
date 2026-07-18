'use client';

import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { PUBLIC_SEARCH_GROUPS } from '@/config/public-site';
import type { PublicSearchResult } from '@/lib/public/discovery/search';
import { PUBLIC_TRANSITIONS } from '@/lib/public/motion';

export function PublicSearchDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const restoreFocusRef = useRef(false);
  const listId = useId();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PublicSearchResult[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [activeIndex, setActiveIndex] = useState(-1);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const onShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onShortcut);
    return () => window.removeEventListener('keydown', onShortcut);
  }, []);

  /**
   * The native <dialog> stays open through the exit animation — closing it
   * immediately (the old behavior) would hard-cut via the UA's display:none,
   * killing any in-flight Framer Motion exit. `handleExitComplete` below
   * (fired once AnimatePresence's leaving children finish) does the real
   * `dialog.close()` instead.
   */
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      inputRef.current?.focus();
    }
  }, [open]);

  const handleExitComplete = () => {
    const dialog = dialogRef.current;
    if (dialog?.open) dialog.close();
    if (restoreFocusRef.current) {
      restoreFocusRef.current = false;
      triggerRef.current?.focus();
    }
  };

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (activeIndex < 0) return;
    document.getElementById(`${listId}-${activeIndex}`)?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, listId]);

  useEffect(() => {
    const normalized = query.trim();
    setActiveIndex(-1);
    if (!normalized) {
      setResults([]);
      setStatus('idle');
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setStatus('loading');
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(normalized)}&limit=10`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`Search returned ${response.status}`);
        const payload = (await response.json()) as { results?: PublicSearchResult[] };
        setResults(payload.results ?? []);
        setStatus('ready');
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error('Public search dialog failed', error);
        setResults([]);
        setStatus('error');
      }
    }, 160);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  const close = () => {
    restoreFocusRef.current = true;
    setOpen(false);
  };
  const groupedResults = PUBLIC_SEARCH_GROUPS.map((group) => ({
    ...group,
    results: results.filter((result) => result.type === group.type),
  })).filter((group) => group.results.length);
  const orderedResults = groupedResults.flatMap((group) => group.results);
  const activeResult = activeIndex >= 0 ? orderedResults[activeIndex] : undefined;

  /**
   * Framer Motion animations run in JS, so the site-wide reduced-motion CSS
   * kill switch (globals.css, near-zero `animation`/`transition-duration`)
   * cannot reach them — reduced motion is handled explicitly here instead,
   * matching that same near-instant convention rather than a slower "short"
   * fade, so this dialog behaves consistently with every other animated
   * element on reduced motion.
   */
  const reducedMotionTransition = { duration: 0.01 };
  const enterTransition = prefersReducedMotion
    ? reducedMotionTransition
    : PUBLIC_TRANSITIONS.considered;
  const exitTransition = prefersReducedMotion ? reducedMotionTransition : PUBLIC_TRANSITIONS.exit;
  const scrimMotion = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: enterTransition },
    exit: { opacity: 0, transition: exitTransition },
  };
  const surfaceMotion = prefersReducedMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: enterTransition },
        exit: { opacity: 0, transition: exitTransition },
      }
    : {
        initial: { opacity: 0, scale: 0.98 },
        animate: { opacity: 1, scale: 1, transition: enterTransition },
        exit: { opacity: 0, scale: 0.99, transition: exitTransition },
      };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="public-nav-search"
        aria-label="Search HubZero"
        aria-keyshortcuts="Meta+K Control+K"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="public-search-dialog"
        aria-current={pathname === '/search' ? 'page' : undefined}
        onClick={() => setOpen(true)}
      >
        <Search className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <kbd aria-hidden="true">⌘K</kbd>
      </button>

      <dialog
        ref={dialogRef}
        id="public-search-dialog"
        className="public-search-dialog"
        aria-labelledby="public-search-dialog-title"
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
        onClose={() => setOpen(false)}
      >
        <AnimatePresence onExitComplete={handleExitComplete}>
          {open ? (
            <>
              <motion.div
                key="public-search-scrim"
                className="public-search-scrim"
                onClick={close}
                {...scrimMotion}
              />
              <motion.div
                key="public-search-surface"
                className="public-search-dialog-surface"
                {...surfaceMotion}
              >
                <header className="public-search-dialog-header">
                  <div>
                    <p className="home-eyebrow">Search / published record</p>
                    <h2 id="public-search-dialog-title">Find an engineering record</h2>
                  </div>
                  <button type="button" onClick={close} aria-label="Close search">
                    <X aria-hidden="true" />
                  </button>
                </header>

                <form action="/search" role="search" className="public-search-dialog-form">
                  <Search aria-hidden="true" />
                  <input
                    ref={inputRef}
                    type="search"
                    name="q"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Escape') {
                        event.preventDefault();
                        close();
                        return;
                      }
                      if (!orderedResults.length) return;
                      if (event.key === 'ArrowDown') {
                        event.preventDefault();
                        setActiveIndex((current) => (current + 1) % orderedResults.length);
                      } else if (event.key === 'ArrowUp') {
                        event.preventDefault();
                        setActiveIndex((current) =>
                          current <= 0 ? orderedResults.length - 1 : current - 1,
                        );
                      } else if (event.key === 'Enter' && activeResult) {
                        event.preventDefault();
                        setOpen(false);
                        router.push(activeResult.url);
                      }
                    }}
                    maxLength={120}
                    placeholder="Title, technology, reference, or topic"
                    autoComplete="off"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={Boolean(query.trim())}
                    aria-controls={listId}
                    aria-activedescendant={activeResult ? `${listId}-${activeIndex}` : undefined}
                  />
                  <kbd aria-hidden="true">ESC</kbd>
                </form>

                <div
                  className="public-search-dialog-results"
                  id={listId}
                  role={results.length ? 'listbox' : undefined}
                >
                  {!query.trim() ? (
                    <div className="public-search-dialog-state">
                      <p>
                        Search titles, summaries, references, technologies, authors, and
                        relationships.
                      </p>
                      <Link href="/search" onClick={close}>
                        Open full search <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  ) : status === 'loading' ? (
                    <p className="public-search-dialog-status">Searching published records…</p>
                  ) : status === 'error' ? (
                    <p className="public-search-dialog-status">
                      Search is temporarily unavailable. Open full search to try again.
                    </p>
                  ) : status === 'ready' && !results.length ? (
                    <p className="public-search-dialog-status">
                      No published records match “{query}”.
                    </p>
                  ) : (
                    groupedResults.map((group) => (
                      <section
                        key={group.type}
                        className="public-search-dialog-group"
                        role="group"
                        aria-label={group.label}
                      >
                        <h3>{group.label}</h3>
                        <ul>
                          {group.results.map((result) => {
                            const index = orderedResults.indexOf(result);
                            return (
                              <li key={`${result.type}-${result.url}-${result.title}`}>
                                <Link
                                  id={`${listId}-${index}`}
                                  href={result.url}
                                  role="option"
                                  aria-selected={activeIndex === index}
                                  data-active={activeIndex === index ? 'true' : undefined}
                                  onMouseEnter={() => setActiveIndex(index)}
                                  onClick={() => setOpen(false)}
                                >
                                  <span>
                                    <strong>{result.title}</strong>
                                    <small>{result.summary}</small>
                                  </span>
                                  <span aria-hidden="true">→</span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </section>
                    ))
                  )}
                </div>

                <footer className="public-search-dialog-footer">
                  <span>↑↓ Select</span>
                  <span>↵ Open</span>
                  <Link
                    href={
                      query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : '/search'
                    }
                  >
                    Full search
                  </Link>
                </footer>
                <p className="sr-only" aria-live="polite" aria-atomic="true">
                  {status === 'ready'
                    ? `${results.length} search ${results.length === 1 ? 'result' : 'results'}`
                    : status === 'error'
                      ? 'Search unavailable'
                      : ''}
                </p>
              </motion.div>
            </>
          ) : null}
        </AnimatePresence>
      </dialog>
    </>
  );
}
