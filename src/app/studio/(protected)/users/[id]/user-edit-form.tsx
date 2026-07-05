"use client";

import { useActionState, useState } from "react";

import { updateUser } from "@/actions/studio/users";
import { Alert, Button, Input, PasswordInput, Select, Switch, Text } from "@/components/ui";
import { userRoleOptions, type UpdateUserInput } from "@/lib/cms/collections/user-fields";
import { PASSWORD_MIN_LENGTH } from "@/lib/cms/password";
import type { UserRole } from "@/types/cms";
import type { CrudActionState } from "@/types/cms";

const initialState: CrudActionState<UpdateUserInput> = { status: "idle" };

export interface UserEditFormProps {
  id: string;
  initialValues: { email: string; name: string; role: UserRole; disabled: boolean };
  /** Whether the signed-in Head Admin is editing their own account — surfaced as a note, not a client-side restriction (the server is the actual guard). */
  isSelf: boolean;
}

/** Bespoke form (not the generic `<CmsForm>`) — see `user-fields.tsx`'s module comment for why. */
export function UserEditForm({ id, initialValues, isSelf }: UserEditFormProps) {
  const boundAction = updateUser.bind(null, id);
  const [state, formAction, isPending] = useActionState(boundAction, initialState);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [role, setRole] = useState(initialValues.role);
  const [disabled, setDisabled] = useState(initialValues.disabled);

  const confirmMismatch = confirmTouched && password !== confirmPassword;

  return (
    <form action={formAction} className="max-w-lg space-y-6">
      {isSelf && (
        <Text tone="muted" className="text-caption">
          You&apos;re editing your own account. If you&apos;re the last remaining Head Admin, you
          can&apos;t remove your own Head Admin role or disable this account.
        </Text>
      )}

      <Input
        name="name"
        label="Name"
        defaultValue={initialValues.name}
        required
        error={state.fieldErrors?.name}
      />
      <Input
        name="email"
        type="email"
        label="Email"
        defaultValue={initialValues.email}
        required
        error={state.fieldErrors?.email}
        autoComplete="off"
      />
      <Select
        name="role"
        label="Role"
        required
        options={userRoleOptions}
        value={role}
        onValueChange={(value) => setRole(value as UserRole)}
        error={state.fieldErrors?.role}
      />
      <Switch
        name="disabled"
        label="Account disabled"
        hint="A disabled account is blocked from signing in; its data is retained."
        checked={disabled}
        onCheckedChange={setDisabled}
      />

      <div className="border-border-muted space-y-6 border-t pt-6">
        <Text tone="muted" className="text-caption">
          Leave both password fields blank to keep the current password unchanged.
        </Text>
        <PasswordInput
          name="password"
          label="New password"
          autoComplete="new-password"
          hint={`At least ${PASSWORD_MIN_LENGTH} characters.`}
          error={state.fieldErrors?.password}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <PasswordInput
          label="Confirm new password"
          autoComplete="new-password"
          error={confirmMismatch ? "Passwords don't match." : undefined}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          onBlur={() => setConfirmTouched(true)}
        />
      </div>

      {state.formError && <Alert variant="danger">{state.formError}</Alert>}
      {state.status === "success" && <Alert variant="success">Saved.</Alert>}

      <Button type="submit" isLoading={isPending} disabled={Boolean(confirmMismatch)}>
        Save changes
      </Button>
    </form>
  );
}
