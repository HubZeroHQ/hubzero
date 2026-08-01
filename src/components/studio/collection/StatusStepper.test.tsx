// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StatusStepper } from './StatusStepper';

/**
 * Review flow state synchronisation (v3.1 Milestone 10).
 *
 * These cover the failure modes the workflow can actually reach: a second
 * click landing before React re-renders, a server refusal, and an action that
 * throws. The invariant behind all three is the same — the interface must
 * never be left disabled, and the server must never be asked to perform the
 * same transition twice.
 */

const refresh = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: () => refresh() }) }));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function setup(onTransition: (to: string, note?: string) => Promise<{ error?: string }>) {
  return render(
    <StatusStepper
      status="draft"
      availableTransitions={['inReview']}
      canUnpublishOverride={false}
      canReject={false}
      onTransition={onTransition as never}
    />,
  );
}

describe('StatusStepper', () => {
  it('runs the transition and refreshes from the server on success', async () => {
    const onTransition = vi.fn().mockResolvedValue({});
    setup(onTransition);

    await userEvent.click(screen.getByRole('button', { name: 'Submit for review' }));

    await waitFor(() => expect(onTransition).toHaveBeenCalledWith('inReview', undefined));
    // The server stays authoritative: nothing is mirrored into client state,
    // the page is re-rendered from fresh data instead.
    await waitFor(() => expect(refresh).toHaveBeenCalledTimes(1));
  });

  /**
   * The regression this milestone exists for. Five synchronous clicks
   * previously dispatched five Server Actions, and the four losers reported an
   * error over a transition that had succeeded.
   */
  it('fires exactly one Server Action for a burst of rapid clicks', async () => {
    let release: (value: { error?: string }) => void = () => {};
    const onTransition = vi.fn(
      () => new Promise<{ error?: string }>((resolve) => (release = resolve)),
    );
    setup(onTransition);

    const button = screen.getByRole('button', { name: 'Submit for review' });
    button.click();
    button.click();
    button.click();
    button.click();
    button.click();

    expect(onTransition).toHaveBeenCalledTimes(1);

    release({});
    await waitFor(() => expect(refresh).toHaveBeenCalledTimes(1));
  });

  it('shows progress on the button that is running, and restores it afterwards', async () => {
    let release: (value: { error?: string }) => void = () => {};
    const onTransition = vi.fn(
      () => new Promise<{ error?: string }>((resolve) => (release = resolve)),
    );
    setup(onTransition);

    await userEvent.click(screen.getByRole('button', { name: 'Submit for review' }));

    const working = (await screen.findByRole('button', { name: 'Working…' })) as HTMLButtonElement;
    expect(working.disabled).toBe(true);
    expect(working.getAttribute('aria-busy')).toBe('true');

    release({});

    // Restored, not left disabled — the reported symptom was buttons that
    // never recovered.
    await waitFor(() => {
      const restored = screen.getByRole('button', {
        name: 'Submit for review',
      }) as HTMLButtonElement;
      expect(restored.disabled).toBe(false);
    });
  });

  it('surfaces the real error, re-enables the controls and resynchronises', async () => {
    const onTransition = vi.fn().mockResolvedValue({ error: '"inReview" cannot move directly.' });
    setup(onTransition);

    await userEvent.click(screen.getByRole('button', { name: 'Submit for review' }));

    expect((await screen.findByRole('alert')).textContent).toContain('cannot move directly');
    await waitFor(() =>
      expect(
        (screen.getByRole('button', { name: 'Submit for review' }) as HTMLButtonElement).disabled,
      ).toBe(false),
    );
    // A refusal usually means the entry moved on elsewhere, so the stale
    // buttons that caused it are resynchronised rather than left in place.
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('never leaves the interface disabled when the action throws', async () => {
    const onTransition = vi.fn().mockRejectedValue(new Error('connection dropped'));
    setup(onTransition);

    await userEvent.click(screen.getByRole('button', { name: 'Submit for review' }));

    expect((await screen.findByRole('alert')).textContent).toContain('could not be completed');
    await waitFor(() =>
      expect(
        (screen.getByRole('button', { name: 'Submit for review' }) as HTMLButtonElement).disabled,
      ).toBe(false),
    );
    // Nothing was claimed to have succeeded, and no refresh pretended otherwise.
    expect(refresh).not.toHaveBeenCalled();
  });

  it('allows a fresh transition once the previous one has settled', async () => {
    const onTransition = vi.fn().mockResolvedValue({});
    setup(onTransition);

    const button = screen.getByRole('button', { name: 'Submit for review' });
    await userEvent.click(button);
    await waitFor(() => expect(refresh).toHaveBeenCalledTimes(1));

    await userEvent.click(screen.getByRole('button', { name: 'Submit for review' }));
    await waitFor(() => expect(onTransition).toHaveBeenCalledTimes(2));
  });

  it('blocks other transitions while one is running, but keeps Cancel usable', async () => {
    let release: (value: { error?: string }) => void = () => {};
    const onTransition = vi.fn(
      () => new Promise<{ error?: string }>((resolve) => (release = resolve)),
    );
    render(
      <StatusStepper
        status="inReview"
        availableTransitions={['approved']}
        canUnpublishOverride={true}
        canReject={true}
        onTransition={onTransition as never}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Reject' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    // Cancel is a local form control, so it works with no request in flight.
    expect(screen.queryByRole('button', { name: 'Confirm rejection' })).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: 'Approve' }));

    await waitFor(() =>
      expect(
        (screen.getByRole('button', { name: 'Unpublish to draft' }) as HTMLButtonElement).disabled,
      ).toBe(true),
    );
    release({});
  });
});
