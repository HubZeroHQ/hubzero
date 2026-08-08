// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { SaveStateIndicator } from './SaveStateIndicator';

describe('SaveStateIndicator', () => {
  afterEach(cleanup);

  it.each([
    ['dirty', 'Unsaved'],
    ['saving', 'Saving'],
    ['saved', 'Saved'],
    ['error', 'Failed'],
  ] as const)('uses the canonical %s label', (status, label) => {
    render(
      <SaveStateIndicator
        status={status}
        lastSavedAt={new Date('2026-08-02T17:41:11Z')}
        error="Network unavailable"
      />,
    );

    expect(screen.getByRole('status').textContent).toBe(label);
  });
});
