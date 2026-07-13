import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

/**
 * CMS_PRODUCT_DESIGN.md §8 — Settings is structurally invisible to
 * anyone but Head Admin, not just hidden from the sidebar. The sidebar
 * already omits this group for other roles (`lib/studio/navigation.ts`); this
 * guards direct navigation to the URL too.
 */
export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user.role !== 'headAdmin') {
    redirect('/studio/dashboard');
  }
  return children;
}
