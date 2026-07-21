'use client';

import { useEffect, useId, useState } from 'react';

const MOBILE_VISIBLE_COUNT = 6;
const MOBILE_MEDIA_QUERY = '(max-width: 767px)';

/**
 * Mobile-only progressive disclosure for a Blueprint's capability list. This
 * supporting metadata section must never dominate the page on a small
 * screen, but nothing should be removed from the DOM — every feature is
 * always rendered; only its visibility is toggled (via CSS, scoped to the
 * mobile breakpoint) so desktop is entirely unaffected and a no-JS render
 * still degrades to a sensible default. `isMobile` (read via `matchMedia`,
 * not assumed from `expanded` alone) exists purely so `aria-hidden` never
 * disagrees with what's actually on screen: without it, a permanently
 * collapsed state on desktop (where the toggle is hidden and CSS never
 * clips anything) would incorrectly hide real, visible content from
 * assistive tech.
 */
export function BlueprintFeatureList({ features }: { features: readonly string[] }) {
  const [expanded, setExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const listId = useId();
  const hasOverflow = features.length > MOBILE_VISIBLE_COUNT;

  useEffect(() => {
    const query = window.matchMedia(MOBILE_MEDIA_QUERY);
    setIsMobile(query.matches);
    const handleChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);
    query.addEventListener('change', handleChange);
    return () => query.removeEventListener('change', handleChange);
  }, []);

  return (
    <section className="blueprint-features" aria-labelledby="blueprint-features-title">
      <h3 id="blueprint-features-title">Included capabilities</h3>
      <ul id={listId} data-state={expanded ? 'expanded' : 'collapsed'}>
        {features.map((feature, index) => {
          const isOverflow = index >= MOBILE_VISIBLE_COUNT;
          return (
            <li
              key={`feature-${index}`}
              className={isOverflow ? 'blueprint-feature-overflow' : undefined}
              aria-hidden={isOverflow && isMobile && !expanded ? true : undefined}
            >
              {feature}
            </li>
          );
        })}
      </ul>
      {hasOverflow ? (
        <button
          type="button"
          className="blueprint-features-toggle"
          aria-expanded={expanded}
          aria-controls={listId}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? 'Collapse' : `Show all ${features.length} capabilities`}
          <span aria-hidden="true">{expanded ? ' ↑' : ' →'}</span>
        </button>
      ) : null}
    </section>
  );
}
