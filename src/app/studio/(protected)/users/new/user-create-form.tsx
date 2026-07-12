"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { createUser } from "@/actions/studio/users";
import { Alert, Button, Input, PasswordInput, Select } from "@/components/ui";
import { userRoleOptions } from "@/lib/cms/collections/user-fields";
import { PASSWORD_MIN_LENGTH } from "@/lib/cms/password";
import type { CreateUserInput } from "@/lib/cms/collections/user-fields";
import type { CrudActionState } from "@/types/cms";

const initialState: CrudActionState<CreateUserInput> = { status: "idle" };

/**
 * Bespoke form (not the generic `<CmsForm>`) — see `user-fields.tsx`'s
 * module comment for why. `confirmPassword` is a client-only guard against a
 * typo when creating an account (never submitted to the server); the
 * server's own strength check runs on `password` regardless.
 */
export function UserCreateForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createUser, initialState);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmTouched, setConfirmTouched] = useState(false);

  useEffect(() => {
    if (state.status === "success" && state.id) router.push(`/studio/users/${state.id}`);
  }, [state, router]);

  const confirmMismatch = confirmTouched && password !== confirmPassword;

  return (
    <form action={formAction} className="max-w-lg space-y-6">
      <Input name="name" label="Name" required error={state.fieldErrors?.name} />
      <Input
        name="email"
        type="email"
        label="Email"
        required
        error={state.fieldErrors?.email}
        autoComplete="off"
      />
      <Select
        name="role"
        label="Role"
        required
        options={userRoleOptions}
        defaultValue="teammate"
        error={state.fieldErrors?.role}
      />
      <PasswordInput
        name="password"
        label="Password"
        required
        autoComplete="new-password"
        hint={`At least ${PASSWORD_MIN_LENGTH} characters.`}
        error={state.fieldErrors?.password}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <PasswordInput
        label="Confirm password"
        required
        autoComplete="new-password"
        error={confirmMismatch ? "Passwords don't match." : undefined}
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        onBlur={() => setConfirmTouched(true)}
      />

      {state.formError && <Alert variant="danger">{state.formError}</Alert>}

      <Button type="submit" isLoading={isPending} disabled={Boolean(confirmMismatch)}>
        Create user
      </Button>
    </form>
  );
}
