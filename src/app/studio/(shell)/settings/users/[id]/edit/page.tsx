import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/studio/PageHeader';
import { UserForm } from '@/components/studio/users/UserForm';
import { userRepository } from '@/lib/db/repositories/user';
import { updateUserAction } from '@/lib/studio/actions/user';

export const metadata: Metadata = { title: 'Edit user — HubZero Studio' };

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await userRepository.findById(id);
  if (!user) {
    notFound();
  }

  const boundUpdateAction = updateUserAction.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Edit — ${user.name}`}
        description="Password changes happen from the user's detail page, not here."
      />
      <UserForm
        mode="edit"
        action={boundUpdateAction}
        submitLabel="Save changes"
        initialValues={{ name: user.name, email: user.email, role: user.role }}
      />
    </div>
  );
}
