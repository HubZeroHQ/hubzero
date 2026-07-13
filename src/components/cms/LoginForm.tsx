'use client';

import { useActionState } from 'react';
import { loginAction, type LoginActionState } from '@/lib/auth/actions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const initialState: LoginActionState = {};

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl ?? ''} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-text-secondary text-sm">
          Email
        </label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-text-secondary text-sm">
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>

      {state.error ? (
        <p role="alert" className="text-danger text-sm">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
}
