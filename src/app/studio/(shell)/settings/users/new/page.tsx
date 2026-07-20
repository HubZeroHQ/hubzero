import type { Metadata } from 'next';
import { UserForm } from '@/components/studio/users/UserForm';
import { PageHeader } from '@/components/studio/PageHeader';
import { createUserAction } from '@/lib/studio/actions/user';

export const metadata: Metadata = { title: 'New user — HubZero Studio' };

export default function NewUserPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="New user"
        description="Sets an initial password directly — there's no email invite flow. The new user is prompted to change it on first sign-in."
      />
      <UserForm mode="create" action={createUserAction} submitLabel="Create user" />
    </div>
  );
}
