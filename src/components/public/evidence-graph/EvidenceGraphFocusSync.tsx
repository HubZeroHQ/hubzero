'use client';

import { useEffect, useRef, type ReactNode } from 'react';

const NODE_ATTR = 'data-evidence-node';
const ACTIVE_ATTR = 'data-evidence-active';

/**
 * The Evidence Graph's only client boundary. Everything it owns is
 * transient, DOM-local interaction state — which `data-evidence-node` id is
 * currently hovered or focused — and nothing else: no data, no routing, no
 * fetched state, nothing that needs to survive a re-render or a navigation.
 * That state cannot be expressed as a Server Component because it depends
 * on real browser pointer/focus events, so this is the one place those are
 * observed.
 *
 * It does not introduce a second keyboard model. Every real interactive
 * element inside `children` (the `<a>` tags in a `RelationshipCard` list)
 * keeps its native tab order and focus behavior untouched; this component
 * never sets `tabIndex` or moves focus itself. It only listens for focus
 * and pointer events that bubble up naturally, then mirrors the active id
 * to every element sharing it — including `EvidenceGraph`'s own SVG nodes,
 * which are hoverable but were never made focusable. The graph reflects
 * focus; it does not own it.
 *
 * Attribute toggling (not React state) is deliberate: it lets an arbitrary
 * number of matching nodes update on a single event without re-rendering
 * `children`, and it fails safe — with JavaScript disabled, the SVG and the
 * relationship list are each already fully meaningful on their own; this
 * only adds the cross-highlight on top.
 */
export function EvidenceGraphFocusSync({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let activeId: string | null = null;

    const nodeIdOf = (target: EventTarget | null): string | null => {
      if (!(target instanceof Element)) return null;
      return target.closest(`[${NODE_ATTR}]`)?.getAttribute(NODE_ATTR) ?? null;
    };

    // Matched by comparing the live attribute value in JS, not by
    // interpolating it into a `querySelectorAll` selector string — ids come
    // from `relationshipKey`, and this avoids needing `CSS.escape` (which
    // real browsers implement but jsdom does not) to make that safe.
    const matching = (id: string): Element[] =>
      Array.from(root.querySelectorAll(`[${NODE_ATTR}]`)).filter(
        (element) => element.getAttribute(NODE_ATTR) === id,
      );

    const setActive = (id: string | null) => {
      if (id === activeId) return;
      if (activeId) {
        for (const element of matching(activeId)) element.removeAttribute(ACTIVE_ATTR);
      }
      activeId = id;
      if (id) {
        for (const element of matching(id)) element.setAttribute(ACTIVE_ATTR, 'true');
      }
    };

    const onEnter = (event: Event) => setActive(nodeIdOf(event.target));
    const onLeave = (event: Event) => {
      const related =
        'relatedTarget' in event ? (event as FocusEvent | PointerEvent).relatedTarget : null;
      if (related instanceof Node && root.contains(related) && nodeIdOf(related)) return;
      setActive(null);
    };

    root.addEventListener('pointerover', onEnter);
    root.addEventListener('pointerout', onLeave);
    root.addEventListener('focusin', onEnter);
    root.addEventListener('focusout', onLeave);
    return () => {
      root.removeEventListener('pointerover', onEnter);
      root.removeEventListener('pointerout', onLeave);
      root.removeEventListener('focusin', onEnter);
      root.removeEventListener('focusout', onLeave);
    };
  }, []);

  return (
    <div ref={rootRef} className="evidence-graph-focus-region">
      {children}
    </div>
  );
}
