// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PublicLoadingState } from './PublicLoadingState';

const navigation = vi.hoisted(() => ({ pathname: '/blueprints' }));
vi.mock('next/navigation', () => ({ usePathname: () => navigation.pathname }));

describe('PublicLoadingState', () => {
  afterEach(cleanup);

  it('keeps a foundation identity and stable semantic main geometry while loading', () => {
    const { container } = render(<PublicLoadingState />);
    expect(screen.getByRole('main', { name: 'Loading Blueprints' }).getAttribute('aria-busy')).toBe(
      'true',
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Blueprints' })).toBeTruthy();
    expect(screen.getByLabelText('Loading content-entry count')).toBeTruthy();
    expect(screen.getByLabelText('Loading technology count')).toBeTruthy();
    expect(container.querySelector('.public-loading-ledger')).toBeTruthy();
  });

  it('uses reserved title geometry rather than inventing a dynamic record title', () => {
    navigation.pathname = '/work/does-not-exist';
    const { container } = render(<PublicLoadingState />);
    expect(screen.getByRole('main', { name: 'Loading published record' })).toBeTruthy();
    expect(container.querySelector('.public-loading-title')).toBeTruthy();
    expect(screen.queryByRole('heading', { level: 1 })).toBeNull();
  });
});
