import { redirect } from 'next/navigation';

export default function CmsRootPage() {
  redirect('/cms/dashboard');
}
