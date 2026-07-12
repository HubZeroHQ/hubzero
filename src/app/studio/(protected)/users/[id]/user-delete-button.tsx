"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Alert, Button, Text } from "@/components/ui";

type SimpleResult = { status: "success" } | { status: "error"; message: string };

export interface UserDeleteButtonProps {
  id: string;
  isSelf: boolean;
  remove: (id: string) => Promise<SimpleResult>;
}

/**
 * `remove()` is the generic engine's — its `deleteGuard` (`user.config.ts`)
 * already blocks deleting the last remaining Head Admin, so this component
 * only needs to surface whatever message that guard returns.
 */
export function UserDeleteButton({ id, isSelf, remove }: UserDeleteButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setError(null);
    const result = await remove(id);
    if (result.status === "success") router.push("/studio/users");
    else setError(result.message);
  }

  return (
    <div className="flex flex-col gap-3">
      {isSelf && (
        <Text tone="muted" className="text-caption">
          This is your own account.
        </Text>
      )}
      {error && <Alert variant="danger">{error}</Alert>}
      <ConfirmDialog
        trigger={
          <Button variant="secondary" className="text-danger" type="button">
            Delete this user
          </Button>
        }
        title="Delete this user?"
        description="This permanently removes the account. This can't be undone."
        destructive
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </div>
  );
}
