import { PublicShell } from '@/components/public/PublicShell';
import { PublicStatusPage } from '@/components/public/PublicStatusPage';

export default function NotFound() {
  return (
    <PublicShell>
      <PublicStatusPage kind="notFound" />
    </PublicShell>
  );
}
