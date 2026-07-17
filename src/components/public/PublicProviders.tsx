import type { ReactNode } from 'react';
import { PublicRouteEffects } from './PublicRouteEffects';

/** The intentionally small global client boundary for cross-route accessibility behavior. */
export function PublicProviders({ children }: { children: ReactNode }) {
  return (
    <>
      <PublicRouteEffects />
      {children}
    </>
  );
}
