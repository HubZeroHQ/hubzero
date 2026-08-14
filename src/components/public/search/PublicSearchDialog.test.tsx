// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PublicSearchDialog } from './PublicSearchDialog';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: vi.fn() }),
}));

describe('PublicSearchDialog accessibility', () => {
  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = function showModal() {
      this.setAttribute('open', '');
    };
    HTMLDialogElement.prototype.close = function close() {
      this.removeAttribute('open');
    };
  });

  afterEach(cleanup);

  it('exposes a stable accessible name for the combobox', () => {
    render(<PublicSearchDialog />);
    fireEvent.click(screen.getByRole('button', { name: 'Search HubZero' }));
    expect(screen.getByRole('combobox', { name: 'Search published records' })).toBeTruthy();
  });
});
