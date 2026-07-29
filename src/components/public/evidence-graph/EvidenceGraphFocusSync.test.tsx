// @vitest-environment jsdom
//
// The one test file in this repo that needs a real DOM: everything else
// under src/**/*.test.{ts,tsx} still runs under vitest.config.ts's default
// `environment: 'node'` (see that file's own comment for why). This pragma
// scopes jsdom to exactly the file that exercises real focus/hover/pointer
// events — see docs/architecture/ADR_PHASE_3_EVIDENCE_GRAPH.md for why this
// is the first component in the repo that actually needs it.
//
/* eslint-disable @next/next/no-html-link-for-pages --
   plain <a> fixtures standing in for a RelationshipCard's rendered anchor;
   this component pairs on data-evidence-node, not on next/link, so a bare
   <a> is the correct minimal fixture rather than pulling Next's router into
   a unit test. */
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { EvidenceGraphFocusSync } from './EvidenceGraphFocusSync';

const ACTIVE_ATTR = 'data-evidence-active';

// vitest.config.ts does not set `test.globals: true`, so Testing Library's
// automatic afterEach cleanup never registers — without this, each render()
// in this file leaves its DOM mounted, and the next test's queries match
// stale nodes from a prior test alongside the current ones.
afterEach(() => cleanup());

function renderPair() {
  return render(
    <EvidenceGraphFocusSync>
      <a href="/builds/release-review" data-evidence-node="rel-a">
        Release review
      </a>
      <a href="/notes/ownership-first" data-evidence-node="rel-b">
        Ownership first
      </a>
      <svg aria-hidden="true">
        <g data-evidence-node="rel-a">
          <circle data-testid="graph-node-a" />
        </g>
        <g data-evidence-node="rel-b">
          <circle data-testid="graph-node-b" />
        </g>
      </svg>
    </EvidenceGraphFocusSync>,
  );
}

describe('EvidenceGraphFocusSync', () => {
  it('does not add tabIndex or any new focusable role — the real anchors stay the only focus stops', () => {
    const { container } = renderPair();

    expect(container.querySelector('[tabindex]')).toBeNull();
    expect(container.querySelectorAll('[role]').length).toBe(0);
  });

  it('mirrors keyboard focus of a relationship link onto the matching graph node only', async () => {
    const user = userEvent.setup();
    renderPair();

    await user.tab();
    expect(document.activeElement).toBe(screen.getByText('Release review'));

    const nodeA = document.querySelector('g[data-evidence-node="rel-a"]')!;
    const nodeB = document.querySelector('g[data-evidence-node="rel-b"]')!;
    expect(nodeA.getAttribute(ACTIVE_ATTR)).toBe('true');
    expect(nodeB.getAttribute(ACTIVE_ATTR)).toBeNull();

    await user.tab();
    expect(document.activeElement).toBe(screen.getByText('Ownership first'));
    expect(nodeA.getAttribute(ACTIVE_ATTR)).toBeNull();
    expect(nodeB.getAttribute(ACTIVE_ATTR)).toBe('true');
  });

  it('mirrors hovering a graph node onto the matching relationship link', async () => {
    const user = userEvent.setup();
    renderPair();

    const graphNodeA = screen.getByTestId('graph-node-a');
    await user.hover(graphNodeA);

    expect(screen.getByText('Release review').closest('a')?.getAttribute(ACTIVE_ATTR)).toBe('true');
    expect(screen.getByText('Ownership first').closest('a')?.getAttribute(ACTIVE_ATTR)).toBeNull();

    await user.unhover(graphNodeA);
    expect(screen.getByText('Release review').closest('a')?.getAttribute(ACTIVE_ATTR)).toBeNull();
  });

  it('clears the active id when focus leaves the region entirely', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <EvidenceGraphFocusSync>
          <a href="/builds/release-review" data-evidence-node="rel-a">
            Release review
          </a>
        </EvidenceGraphFocusSync>
        <button type="button">Outside</button>
      </div>,
    );

    await user.tab();
    expect(screen.getByText('Release review').getAttribute(ACTIVE_ATTR)).toBe('true');

    await user.tab();
    expect(document.activeElement).toBe(screen.getByText('Outside'));
    expect(screen.getByText('Release review').getAttribute(ACTIVE_ATTR)).toBeNull();
  });
});
