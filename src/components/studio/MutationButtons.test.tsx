// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import type { EntryActionState } from '@/lib/studio/entry-actions';
import { GraduateToBuildButton } from './labs/GraduateToBuildButton';
import { LeadStatusButtons } from './leads/LeadStatusButtons';

const refresh = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('single-flight mutation buttons', () => {
  it('dispatches one Lead status action for a rapid click burst', async () => {
    let release: (value: EntryActionState) => void = () => {};
    const action = vi.fn(() => new Promise<EntryActionState>((resolve) => (release = resolve)));
    render(<LeadStatusButtons leadId="lead-1" status="new" action={action} />);

    const button = screen.getByRole('button', { name: 'Contacted' });
    button.click();
    button.click();
    button.click();

    expect(action).toHaveBeenCalledTimes(1);
    release({});
    await waitFor(() => expect(refresh).toHaveBeenCalledTimes(1));
  });

  it('dispatches one Lab graduation action for a rapid click burst', async () => {
    let release: (value: EntryActionState) => void = () => {};
    const action = vi.fn(() => new Promise<EntryActionState>((resolve) => (release = resolve)));
    render(<GraduateToBuildButton onGraduate={action} />);

    const button = screen.getByRole('button', { name: 'Graduate to Build' });
    button.click();
    button.click();
    button.click();

    expect(action).toHaveBeenCalledTimes(1);
    release({});
    await waitFor(() => expect(refresh).toHaveBeenCalledTimes(1));
  });
});
