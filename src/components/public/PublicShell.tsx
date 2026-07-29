import type { ReactNode } from 'react';
import { PublicFooter } from './PublicFooter';
import { PublicNavigation } from './PublicNavigation';
import { PublicProviders } from './PublicProviders';
import { SkipLink } from './SkipLink';

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="public-shell">
      <SkipLink />
      <PublicNavigation />
      <PublicProviders>{children}</PublicProviders>
      <PublicFooter />
    </div>
  );
}
