"use client";

import { useActionState, useState } from "react";

import { loginAction } from "@/app/studio/login/actions";
import { Alert, Button, Input } from "@/components/ui";
import { initialLoginState } from "@/lib/cms/login-schema";

interface StudioLoginFormProps {
  from?: string;
}

/**
 * Mirrors `contact-form.tsx`'s `useActionState` pattern — Server Action,
 * never a client-fetched API call (`ARCHITECTURE/19_CMS_FOUNDATION.md` §2).
 * `from` (the originally-requested protected path, set by `middleware.ts`)
 * rides along as a hidden field so a successful sign-in lands back where the
 * visitor was headed, not always at the dashboard.
 *
 * Only `email` is controlled/preserved across a failed submit (same reason
 * as `contact-form.tsx` — a `<form action={fn}>` resets every field after
 * each action call). `password` is deliberately left uncontrolled so a
 * failed attempt clears it, the standard login-form security convention.
 */
export function StudioLoginForm({ from }: StudioLoginFormProps) {
  const [state, formAction, isPending] = useActionState(loginAction, initialLoginState);
  const [email, setEmail] = useState("");

  return (
    <form action={formAction} className="space-y-5">
      {from && <input type="hidden" name="from" value={from} />}

      <Input
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={state.fieldErrors?.email}
      />
      <Input
        name="password"
        type="password"
        label="Password"
        autoComplete="current-password"
        required
        error={state.fieldErrors?.password}
      />

      {state.formError && <Alert variant="danger">{state.formError}</Alert>}

      <Button type="submit" size="lg" isLoading={isPending} className="w-full">
        Sign in
      </Button>
    </form>
  );
}
