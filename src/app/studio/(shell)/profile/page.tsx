import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/studio/PageHeader';
import { ProfileForm } from '@/components/studio/profile/ProfileForm';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Tag } from '@/components/ui/Tag';
import { auth } from '@/lib/auth';
import { userRepository } from '@/lib/db/repositories/user';
import { ROLE_LABEL } from '@/lib/studio/role-label';

export const metadata: Metadata = { title: 'My profile — HubZero Studio' };

/** Every authenticated role reaches this page, unlike `/studio/settings/users` (Head-Admin-only) — this is the account's own view of itself, not the admin management surface. */
export default async function MyProfilePage() {
  const session = await auth();
  if (!session) {
    redirect('/studio/login');
  }

  const user = await userRepository.findById(session.user.id);
  if (!user) {
    redirect('/studio/login');
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="My profile"
        description={user.email}
        actions={
          <ButtonLink href="/studio/profile/change-password" variant="secondary">
            Change password
          </ButtonLink>
        }
      />
      <Tag>{ROLE_LABEL[user.role]}</Tag>
      <ProfileForm name={user.name} />
    </div>
  );
}
