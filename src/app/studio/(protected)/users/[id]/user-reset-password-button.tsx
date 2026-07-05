"use client";

import { useState } from "react";

import { resetUserPassword } from "@/actions/studio/users";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Alert, Button, PasswordInput, Text } from "@/components/ui";
import { PASSWORD_MIN_LENGTH } from "@/lib/cms/password";

export interface UserResetPasswordButtonProps {
  id: string;
  /** Whether the signed-in Head Admin is resetting their own password — surfaced as a note, not a client-side restriction (the server is the actual guard, same convention as `UserEditForm`/`UserDeleteButton`). */
  isSelf: boolean;
}

/**
 * Its own dedicated action (not a field on `UserEditForm`) — see
 * `user-fields.tsx`'s module comment for why. Reuses the same
 * `passwordSchema` strength rule as `create-admin`/`UserCreateForm`
 * (`@/lib/cms/password`) and the shared `<ConfirmDialog>` every other
 * state-changing action on this screen goes through.
 */
export function UserResetPasswordButton({ id, isSelf }: UserResetPasswordButtonProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [result, setResult] = useState<
    { status: "success" } | { status: "error"; message: string } | null
  >(null);

  const tooShort = password.length > 0 && password.length < PASSWORD_MIN_LENGTH;
  const confirmMismatch = confirmTouched && password !== confirmPassword;
  const canSubmit = password.length >= PASSWORD_MIN_LENGTH && password === confirmPassword;

  async function handleReset() {
    const outcome = await resetUserPassword(id, password);
    setResult(outcome);
    if (outcome.status === "success") {
      setPassword("");
      setConfirmPassword("");
      setConfirmTouched(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {isSelf && (
        <Text tone="muted" className="text-caption">
          This is your own account — resetting the password signs you out everywhere immediately,
          including this session.
        </Text>
      )}
      {result?.status === "error" && <Alert variant="danger">{result.message}</Alert>}
      {result?.status === "success" && (
        <Alert variant="success">
          Password reset. Every active session for this user has been signed out.
        </Alert>
      )}
      <ConfirmDialog
        trigger={
          <Button variant="secondary" type="button">
            Reset password
          </Button>
        }
        title="Reset this user's password?"
        description="Enter a new password for this account. This immediately signs the user out of every active session — they'll need the new password to sign back in."
        confirmLabel="Reset password"
        confirmDisabled={!canSubmit}
        onConfirm={handleReset}
      >
        <div className="mt-4 space-y-4">
          <PasswordInput
            label="New password"
            autoComplete="new-password"
            hint={`At least ${PASSWORD_MIN_LENGTH} characters.`}
            error={
              tooShort ? `Password must be at least ${PASSWORD_MIN_LENGTH} characters.` : undefined
            }
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
      </ConfirmDialog>
    </div>
  );
}
