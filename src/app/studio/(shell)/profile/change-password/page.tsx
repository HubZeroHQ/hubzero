import type { Metadata } from 'next';
import { ChangePasswordForm } from '@/components/studio/profile/ChangePasswordForm';
import { PageHeader } from '@/components/studio/PageHeader';

export const metadata: Metadata = { title: 'Change password — HubZero Studio' };

/** The one route `middleware.ts` still allows through when `mustChangePassword` is set — see that file's comment. */
export default function ChangePasswordPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Change password"
        description="Changing your password signs you out of this session — sign back in with the new one."
      />
      <ChangePasswordForm />
    </div>
  );
}
