import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ConfirmActionDialog } from '@/components/studio/ConfirmActionDialog';
import { PageHeader } from '@/components/studio/PageHeader';
import { ResetPasswordDialog } from '@/components/studio/users/ResetPasswordDialog';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Tag } from '@/components/ui/Tag';
import { auth } from '@/lib/auth';
import { userRepository } from '@/lib/db/repositories/user';
import {
  deleteUserAction,
  resetUserPasswordAction,
  setUserDisabledAction,
} from '@/lib/studio/actions/user';
import { ROLE_LABEL } from '@/lib/studio/role-label';
import { formatRelativeTime } from '@/lib/utils/relative-time';

export const metadata: Metadata = { title: 'User — HubZero Studio' };

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await userRepository.findById(id);
  if (!user) {
    notFound();
  }

  const session = await auth();
  const isSelf = session?.user.id === id;
  const boundResetPasswordAction = resetUserPasswordAction.bind(null, id);
  const boundToggleDisabled = setUserDisabledAction.bind(null, id, !user.disabled);
  const boundDelete = deleteUserAction.bind(null, id);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={user.name}
        description={user.email}
        actions={
          <ButtonLink href={`/studio/settings/users/${id}/edit`} variant="secondary">
            Edit
          </ButtonLink>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <Tag>{ROLE_LABEL[user.role]}</Tag>
        <Tag>{user.disabled ? 'Disabled' : 'Active'}</Tag>
        {user.mustChangePassword ? <Tag>Password change pending</Tag> : null}
        {isSelf ? <Tag>You</Tag> : null}
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">Created</dt>
          <dd className="text-text-secondary">{formatRelativeTime(user.createdAt)}</dd>
        </div>
        <div>
          <dt className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">Updated</dt>
          <dd className="text-text-secondary">{formatRelativeTime(user.updatedAt)}</dd>
        </div>
      </dl>

      <div className="flex flex-wrap items-center gap-3">
        <ResetPasswordDialog action={boundResetPasswordAction} />
        <ConfirmActionDialog
          triggerLabel={user.disabled ? 'Enable account' : 'Disable account'}
          title={user.disabled ? 'Enable this account?' : 'Disable this account?'}
          description={
            user.disabled
              ? 'They will be able to sign in again immediately.'
              : 'They will be signed out and unable to sign in until re-enabled.'
          }
          confirmLabel={user.disabled ? 'Enable' : 'Disable'}
          action={boundToggleDisabled}
        />
        <ConfirmActionDialog
          triggerLabel="Delete user"
          title="Delete this user?"
          description="This permanently removes the account. This cannot be undone."
          confirmLabel="Delete"
          action={boundDelete}
        />
      </div>
    </div>
  );
}
