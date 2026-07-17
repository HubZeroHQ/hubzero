'use client';

import { useCallback, useRef, useState } from 'react';

/**
 * The shared loading/error/cancel/retry state machine behind every AI
 * surface (the generation panel, per-block actions, the selection
 * toolbar). One hook rather than four near-identical `useState` clusters,
 * so "what does 'generating…' look like, what does a failure look like, can
 * I retry" behaves identically everywhere in the editor.
 *
 * "Cancel" is a soft cancel: Next.js Server Actions have no supported
 * client-side abort signal today, so an in-flight request can't actually be
 * killed mid-flight. Instead, cancelling bumps an internal request id — a
 * response that arrives after cancel (or after a newer request superseded
 * it) is simply discarded rather than applied. This is an honest simplification worth
 * flagging rather than a full abort; true request cancellation is a
 * reasonable follow-up once the provider layer supports streaming
 * (see PR description's future extension points).
 */
export type AiActionStatus = 'idle' | 'loading' | 'error';

export interface UseAiActionResult<TResult> {
  status: AiActionStatus;
  error: string | null;
  run: (
    invoke: () => Promise<({ ok: true } & TResult) | { ok: false; error: string }>,
  ) => Promise<TResult | null>;
  cancel: () => void;
  reset: () => void;
}

export function useAiAction<TResult extends object>(): UseAiActionResult<TResult> {
  const [status, setStatus] = useState<AiActionStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, []);

  const cancel = useCallback(() => {
    requestIdRef.current += 1;
    reset();
  }, [reset]);

  const run = useCallback(
    async (
      invoke: () => Promise<({ ok: true } & TResult) | { ok: false; error: string }>,
    ): Promise<TResult | null> => {
      const requestId = ++requestIdRef.current;
      setStatus('loading');
      setError(null);

      let result: ({ ok: true } & TResult) | { ok: false; error: string };
      try {
        result = await invoke();
      } catch (thrown) {
        if (requestIdRef.current !== requestId) return null;
        setStatus('error');
        setError(
          thrown instanceof Error ? thrown.message : 'Something went wrong generating content.',
        );
        return null;
      }

      if (requestIdRef.current !== requestId) {
        return null;
      }
      if (!result.ok) {
        setStatus('error');
        setError(result.error);
        return null;
      }
      setStatus('idle');
      return result;
    },
    [],
  );

  return { status, error, run, cancel, reset };
}
