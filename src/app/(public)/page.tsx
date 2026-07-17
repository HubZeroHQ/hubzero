import { redirect } from 'next/navigation';

/** Phase 15 owns the Homepage. Until then, the authenticated Studio remains the only active product surface. */
export default function PublicRoot() {
  redirect('/studio');
}
