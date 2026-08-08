import { describe, expect, it, vi } from 'vitest';
import { EditorRegistry } from './editor-registry';
import type { EditorHandle } from './types';

function editor(overrides: Partial<EditorHandle> = {}): EditorHandle {
  return {
    id: 'metadata',
    label: 'Work metadata',
    isDirty: false,
    status: 'saved',
    save: async () => true,
    discard: () => {},
    savesAutomatically: false,
    showsSaveBar: true,
    canDiscard: true,
    ...overrides,
  };
}

/** Lets a test await the microtasks the registry's own promise chains queue. */
async function settle(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe('EditorRegistry', () => {
  it('lets navigation through untouched when nothing is dirty', () => {
    const registry = new EditorRegistry();
    registry.publish(editor());
    const perform = vi.fn();

    registry.requestNavigation({ perform });

    expect(perform).toHaveBeenCalledOnce();
    expect(registry.getSnapshot().pendingIntent).toBeNull();
  });

  it('holds navigation and asks when a manually-saved editor is dirty', () => {
    const registry = new EditorRegistry();
    registry.publish(editor({ isDirty: true, status: 'dirty' }));
    const perform = vi.fn();

    registry.requestNavigation({ perform });

    expect(perform).not.toHaveBeenCalled();
    expect(registry.getSnapshot().pendingIntent).not.toBeNull();
  });

  it('stops blocking once the editor unregisters', () => {
    const registry = new EditorRegistry();
    registry.publish(editor({ isDirty: true }));
    expect(registry.hasUnsavedWork()).toBe(true);

    registry.unregister('metadata');

    expect(registry.hasUnsavedWork()).toBe(false);
  });

  it('flushes an autosaving editor silently rather than interrupting the author', async () => {
    const save = vi.fn(async () => true);
    const registry = new EditorRegistry();
    registry.publish(
      editor({
        id: 'document',
        isDirty: true,
        savesAutomatically: true,
        showsSaveBar: false,
        save,
      }),
    );
    const perform = vi.fn();

    registry.requestNavigation({ perform });
    await settle();

    expect(save).toHaveBeenCalledOnce();
    expect(perform).toHaveBeenCalledOnce();
    expect(registry.getSnapshot().pendingIntent).toBeNull();
  });

  it('falls back to asking when the silent flush fails', async () => {
    const registry = new EditorRegistry();
    registry.publish(
      editor({
        id: 'document',
        isDirty: true,
        savesAutomatically: true,
        error: 'Fix the highlighted fields.',
        save: async () => false,
      }),
    );
    const perform = vi.fn();

    registry.requestNavigation({ perform });
    await settle();

    expect(perform).not.toHaveBeenCalled();
    expect(registry.getSnapshot().pendingIntent).not.toBeNull();
    expect(registry.getSnapshot().resolveError).toBe('Fix the highlighted fields.');
  });

  it('navigates on "Save & Leave" only after the save actually succeeds', async () => {
    let saved = false;
    const registry = new EditorRegistry();
    const handle = editor({
      isDirty: true,
      save: async () => {
        saved = true;
        registry.publish({ ...handle, isDirty: false, status: 'saved' });
        return true;
      },
    });
    registry.publish(handle);
    const perform = vi.fn();

    registry.requestNavigation({ perform });
    expect(perform).not.toHaveBeenCalled();

    await registry.saveAndProceed();

    expect(saved).toBe(true);
    expect(perform).toHaveBeenCalledOnce();
    expect(registry.getSnapshot().pendingIntent).toBeNull();
  });

  it('skips an in-place refresh when Save & Leave has an approved destination', async () => {
    const save = vi.fn(async () => true);
    const registry = new EditorRegistry();
    registry.publish(editor({ isDirty: true, save }));
    const perform = vi.fn();

    registry.requestNavigation({ perform });
    await registry.saveAndProceed();

    expect(save).toHaveBeenCalledWith({ refresh: false });
    expect(perform).toHaveBeenCalledOnce();
  });

  it('stays on the page and reports why when "Save & Leave" fails', async () => {
    const registry = new EditorRegistry();
    registry.publish(
      editor({ isDirty: true, error: 'Slug is already taken.', save: async () => false }),
    );
    const perform = vi.fn();

    registry.requestNavigation({ perform });
    await registry.saveAndProceed();

    expect(perform).not.toHaveBeenCalled();
    expect(registry.getSnapshot().pendingIntent).not.toBeNull();
    expect(registry.getSnapshot().resolveError).toBe('Slug is already taken.');
  });

  it('treats a save that throws as a failure rather than letting it escape', async () => {
    const registry = new EditorRegistry();
    registry.publish(
      editor({
        isDirty: true,
        save: async () => {
          throw new Error('network down');
        },
      }),
    );
    const perform = vi.fn();

    registry.requestNavigation({ perform });
    await expect(registry.saveAndProceed()).resolves.toBeUndefined();

    expect(perform).not.toHaveBeenCalled();
  });

  it('discards every dirty editor, then navigates', () => {
    const discardA = vi.fn();
    const discardB = vi.fn();
    const registry = new EditorRegistry();
    registry.publish(editor({ id: 'a', isDirty: true, discard: discardA }));
    registry.publish(editor({ id: 'b', isDirty: true, discard: discardB }));
    const perform = vi.fn();

    registry.requestNavigation({ perform });
    registry.discardAndProceed();

    expect(discardA).toHaveBeenCalledOnce();
    expect(discardB).toHaveBeenCalledOnce();
    expect(perform).toHaveBeenCalledOnce();
  });

  it('leaves the editor and the page alone when the author stays', () => {
    const discard = vi.fn();
    const registry = new EditorRegistry();
    registry.publish(editor({ isDirty: true, discard }));
    const perform = vi.fn();

    registry.requestNavigation({ perform });
    registry.cancelNavigation();

    expect(discard).not.toHaveBeenCalled();
    expect(perform).not.toHaveBeenCalled();
    expect(registry.getSnapshot().pendingIntent).toBeNull();
    // Still dirty: staying is not a resolution, so the bar and the guard remain.
    expect(registry.hasUnsavedWork()).toBe(true);
  });

  it('stands down while performing a navigation it already approved', () => {
    const registry = new EditorRegistry();
    registry.publish(editor({ isDirty: true, discard: () => {} }));

    let duringNavigation: boolean | null = null;
    registry.requestNavigation({
      perform: () => {
        // What `beforeunload` and `popstate` see mid-departure. Prompting
        // here would ask the author to confirm the choice they just made.
        duringNavigation = registry.hasUnsavedWork();
      },
    });
    registry.discardAndProceed();

    expect(duringNavigation).toBe(false);
  });

  it('notifies subscribers when dirty state changes, and not when it does not', () => {
    const registry = new EditorRegistry();
    const listener = vi.fn();
    registry.subscribe(listener);

    registry.publish(editor());
    expect(listener).toHaveBeenCalledTimes(1);

    // A re-render publishing fresh callbacks but identical state.
    registry.publish(editor({ save: async () => true }));
    expect(listener).toHaveBeenCalledTimes(1);

    registry.publish(editor({ isDirty: true, status: 'dirty' }));
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('blocks navigation on the live probe even when the published flag is stale-clean', () => {
    // The regression this guards: an author types a character and clicks a
    // sidebar link inside the recomputation window, so the last *published*
    // dirty flag still says false while the DOM already differs.
    const registry = new EditorRegistry();
    registry.publish(editor({ isDirty: false, status: 'saved', isDirtyNow: () => true }));
    const perform = vi.fn();

    registry.requestNavigation({ perform });

    expect(perform).not.toHaveBeenCalled();
    expect(registry.getSnapshot().pendingIntent).not.toBeNull();
    expect(registry.hasUnsavedWork()).toBe(true);
  });

  it('lets navigation through when the live probe says clean but the flag is stale-dirty', () => {
    // The mirror image: the author reverted their edit and the published flag
    // hasn't caught up yet. Prompting here would be a dialog about nothing.
    const registry = new EditorRegistry();
    registry.publish(editor({ isDirty: true, status: 'dirty', isDirtyNow: () => false }));
    const perform = vi.fn();

    registry.requestNavigation({ perform });

    expect(perform).toHaveBeenCalledOnce();
  });

  it('treats a probe that throws as dirty rather than as safe to discard', () => {
    const registry = new EditorRegistry();
    registry.publish(
      editor({
        isDirty: false,
        isDirtyNow: () => {
          throw new Error('form detached');
        },
      }),
    );
    const perform = vi.fn();

    registry.requestNavigation({ perform });

    expect(perform).not.toHaveBeenCalled();
  });

  it('falls back to the published flag for an editor with no live probe', () => {
    const registry = new EditorRegistry();
    registry.publish(editor({ id: 'document', isDirty: true }));

    expect(registry.hasUnsavedWork()).toBe(true);
  });

  it('ignores further navigation requests while a question is already open', () => {
    const registry = new EditorRegistry();
    registry.publish(editor({ isDirty: true }));
    const first = vi.fn();
    const second = vi.fn();

    registry.requestNavigation({ perform: first, description: 'first' });
    // Holding Back with the dialog open: the second intent must not replace
    // the first, whose `history.go(-2)` was built for the stack as it stood.
    registry.requestNavigation({ perform: second, description: 'second' });
    registry.discardAndProceed();

    expect(first).toHaveBeenCalledOnce();
    expect(second).not.toHaveBeenCalled();
  });

  it('lets the author stay even while a save is still in flight', async () => {
    let release!: (saved: boolean) => void;
    const registry = new EditorRegistry();
    registry.publish(
      editor({ isDirty: true, save: () => new Promise<boolean>((r) => (release = r)) }),
    );
    const perform = vi.fn();

    registry.requestNavigation({ perform });
    const inFlight = registry.saveAndProceed();
    expect(registry.getSnapshot().resolving).toBe(true);

    registry.cancelNavigation();

    expect(registry.getSnapshot().resolving).toBe(false);
    expect(registry.getSnapshot().pendingIntent).toBeNull();

    // The save still lands, but it must not carry out the navigation the
    // author just cancelled.
    release(true);
    await inFlight;
    expect(perform).not.toHaveBeenCalled();
  });

  it('does not navigate when a silent flush finishes after the author cancelled', async () => {
    let release!: (saved: boolean) => void;
    const registry = new EditorRegistry();
    registry.publish(
      editor({
        isDirty: true,
        savesAutomatically: true,
        save: () => new Promise<boolean>((r) => (release = r)),
      }),
    );
    const perform = vi.fn();

    registry.requestNavigation({ perform });
    expect(registry.getSnapshot().resolving).toBe(true);

    registry.cancelNavigation();
    release(true);
    await settle();

    expect(perform).not.toHaveBeenCalled();
    expect(registry.getSnapshot().resolving).toBe(false);
  });

  it('accepts a fresh navigation request once the previous one is resolved', () => {
    const registry = new EditorRegistry();
    registry.publish(editor({ isDirty: true }));
    const first = vi.fn();
    const second = vi.fn();

    registry.requestNavigation({ perform: first });
    registry.cancelNavigation();
    registry.requestNavigation({ perform: second });
    registry.discardAndProceed();

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledOnce();
  });

  it('keeps the newest save callback after a re-render publishes one', async () => {
    const stale = vi.fn(async () => true);
    const fresh = vi.fn(async () => true);
    const registry = new EditorRegistry();

    registry.publish(editor({ isDirty: true, save: stale }));
    registry.publish(editor({ isDirty: true, save: fresh }));
    await registry.saveAll();

    expect(stale).not.toHaveBeenCalled();
    expect(fresh).toHaveBeenCalledOnce();
  });

  it('flushes one dirty editor before an intra-page role switch', async () => {
    const activeSave = vi.fn(async () => true);
    const inactiveSave = vi.fn(async () => true);
    const registry = new EditorRegistry();
    registry.publish(editor({ id: 'document:caseStudy', isDirty: true, save: activeSave }));
    registry.publish(editor({ id: 'document:technical', isDirty: true, save: inactiveSave }));

    await expect(registry.flushEditor('document:caseStudy')).resolves.toBe(true);

    expect(activeSave).toHaveBeenCalledOnce();
    expect(inactiveSave).not.toHaveBeenCalled();
  });

  it('refuses to authorize an unmount when the targeted editor save fails', async () => {
    const registry = new EditorRegistry();
    registry.publish(editor({ id: 'document:caseStudy', isDirty: true, save: async () => false }));

    await expect(registry.flushEditor('document:caseStudy')).resolves.toBe(false);
  });

  it('refuses to authorize an unmount when the targeted editor is not registered', async () => {
    const registry = new EditorRegistry();

    await expect(registry.flushEditor('document:missing')).resolves.toBe(false);
  });
});
