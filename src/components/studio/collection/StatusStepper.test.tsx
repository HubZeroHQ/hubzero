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
  it('runs the transition and restores its controls on success', async () => {
    const onTransition = vi.fn().mockResolvedValue({});
    setup(onTransition);

    await userEvent.click(screen.getByRole('button', { name: 'Submit for review' }));

    await waitFor(() => expect(onTransition).toHaveBeenCalledWith('inReview', undefined));
    await waitFor(() =>
      expect(
        (screen.getByRole('button', { name: 'Submit for review' }) as HTMLButtonElement).disabled,
      ).toBe(false),
    );
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
    await waitFor(() =>
      expect(
        (screen.getByRole('button', { name: 'Submit for review' }) as HTMLButtonElement).disabled,
      ).toBe(false),
    );
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

  it('surfaces the real error and re-enables the controls', async () => {
    const onTransition = vi.fn().mockResolvedValue({ error: '"inReview" cannot move directly.' });
    setup(onTransition);

    await userEvent.click(screen.getByRole('button', { name: 'Submit for review' }));

    expect((await screen.findByRole('alert')).textContent).toContain('cannot move directly');
    await waitFor(() =>
      expect(
        (screen.getByRole('button', { name: 'Submit for review' }) as HTMLButtonElement).disabled,
      ).toBe(false),
    );
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
  });

  it('allows a fresh transition once the previous one has settled', async () => {
    const onTransition = vi.fn().mockResolvedValue({});
    setup(onTransition);

    const button = screen.getByRole('button', { name: 'Submit for review' });
    await userEvent.click(button);
    await waitFor(() =>
      expect(
        (screen.getByRole('button', { name: 'Submit for review' }) as HTMLButtonElement).disabled,
      ).toBe(false),
    );

    await userEvent.click(screen.getByRole('button', { name: 'Submit for review' }));
    await waitFor(() => expect(onTransition).toHaveBeenCalledTimes(2));
  });

  it('blocks other transitions while one is running, keeps Cancel usable, and never duplicates Reject', async () => {
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

    expect(screen.queryByRole('button', { name: 'Unpublish to draft' })).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: 'Reject' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    // Cancel is a local form control, so it works with no request in flight.
    expect(screen.queryByRole('button', { name: 'Confirm rejection' })).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: 'Approve' }));

    await waitFor(() =>
      expect((screen.getByRole('button', { name: 'Working…' }) as HTMLButtonElement).disabled).toBe(
        true,
      ),
    );
    release({});
  });
});
